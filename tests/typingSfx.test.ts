import { describe, expect, it } from 'vitest'
import type { StoryBlock } from '../src/types/story'
import type { ReadingSequenceState } from '../src/utils/story/readingSequence'
import type { ReadingRevealCause } from '../src/utils/story/readingReveal'
import { buildSequencePlan } from '../src/utils/story/readingPlan'
import { buildReadingRevealEvent } from '../src/utils/story/readingReveal'
import {
  advanceToNextBlock,
  applyReadingInput,
  completeSequence,
  createReadingSequenceState,
  resolveReadingTick,
  skipCurrentBlock,
  tickReadingSequence,
} from '../src/utils/story/readingSequence'
import {
  TYPING_SFX_POLICY,
  createTypingSfxState,
  decideTypingSfx,
} from '../src/utils/audio/typingSfx'

/**
 * 打字机音效的触发策略（A03）。
 *
 * 测的不是「声音好不好听」，而是「什么时候会响、响多密」：全部靠回放真实的
 * 阅读状态机得到，不依赖真实播放时长，也不需要渲染任何组件。
 *
 * 下面的 `runSequence` 复刻了 useStoryReadingSequence 的调度与因果标注：
 * 同一个 resolveReadingTick / tickReadingSequence / skipCurrentBlock，
 * 同一套 cause 映射。因此这里验证的就是运行时真正会发生的事。
 */

const NODE_KEY = 'node:test'

type Sound = { at: number; blockIndex: number; cause: ReadingRevealCause }

type RunOptions = {
  sequenceKey?: string
  autoplayEnabled?: boolean
  reducedMotion?: boolean
  paused?: boolean
  /** 走到第 N 步调度时插入一次玩家输入。 */
  inputAtStep?: number
  /** 走到第 N 步调度时模拟「关闭自动播放」的立即刹车。 */
  brakeAtStep?: number
  maxSteps?: number
}

type RunResult = {
  sounds: Sound[]
  state: ReadingSequenceState
  elapsed: number
  revealedGraphemes: number
}

/** 回放一整个展示序列，返回打字声的发生时刻。 */
function runSequence(blocks: readonly StoryBlock[], options: RunOptions = {}): RunResult {
  const {
    sequenceKey = NODE_KEY,
    autoplayEnabled = true,
    reducedMotion = false,
    paused = false,
    inputAtStep,
    brakeAtStep,
    maxSteps = 50000,
  } = options

  const plan = buildSequencePlan(blocks)
  let state = createReadingSequenceState(plan, sequenceKey)
  let typing = createTypingSfxState()
  let now = 0
  let revealedGraphemes = 0

  const sounds: Sound[] = []

  function commit(next: ReadingSequenceState, cause: ReadingRevealCause) {
    const event = buildReadingRevealEvent(state, next, plan, cause)

    state = next

    if (!event) return

    revealedGraphemes += event.mode === 'chars' ? event.delta : 0

    const decision = decideTypingSfx(typing, event, now)

    typing = decision.state

    if (decision.play) sounds.push({ at: now, blockIndex: event.blockIndex, cause: event.cause })
  }

  for (let step = 0; step < maxSteps; step += 1) {
    if (step === brakeAtStep) {
      // 关闭自动播放时的立即刹车：补全当前块并停住。
      commit(skipCurrentBlock(state, plan), 'skip')
      break
    }

    if (step === inputAtStep) {
      const result = applyReadingInput(state, plan, { autoplayEnabled })

      if (result.action !== 'ignored') {
        commit(
          result.state,
          result.action === 'skip' ? 'skip' : result.action === 'advance' ? 'enterBlock' : 'complete',
        )
      }

      if (!autoplayEnabled) break
      continue
    }

    const tick = resolveReadingTick(state, plan, { paused, reducedMotion, autoplayEnabled })

    if (tick.type === 'idle') break

    if (tick.type === 'complete') {
      const next = skipCurrentBlock(state, plan)

      if (next === state) break
      commit(next, 'reducedMotion')
      continue
    }

    now += tick.delay

    const isReveal = tick.type === 'reveal'
    const next = isReveal ? tickReadingSequence(state, plan) : advanceToNextBlock(state, plan)

    if (next === state) break
    commit(next, isReveal ? 'tick' : 'enterBlock')
  }

  return { sounds, state, elapsed: now, revealedGraphemes }
}

function narration(text: string): StoryBlock {
  return { kind: 'narration', text }
}

const LONG_NARRATION = narration(
  '它开始记录你每天说过的话，把重复出现的句子折叠成一条更短的表述，' +
    '然后在你还没有开口之前，把那条表述放回你面前。你读它的时候，' +
    '会有一瞬间分不清那到底是你说过的，还是它替你说的。',
)

const PANEL_BLOCK: StoryBlock = {
  kind: 'system',
  variant: 'status',
  title: '权限审查',
  lines: [
    { label: '日程', value: '已托管' },
    { label: '沟通', value: '已托管' },
    { label: '判断', value: '部分托管' },
    { label: '边界', value: '待确认' },
    { label: '结论', value: '继续观察' },
    { label: '复核', value: '48 小时后' },
  ],
}

describe('普通逐字揭示：稀疏但确实有打字声', () => {
  it('长段正文会产生打字声，但远少于字符数', () => {
    const result = runSequence([LONG_NARRATION])

    expect(result.sounds.length).toBeGreaterThan(0)
    expect(result.revealedGraphemes).toBeGreaterThan(50)
    // 抽样：声音数最多是字素数的 1/6。
    expect(result.sounds.length).toBeLessThanOrEqual(
      Math.ceil(result.revealedGraphemes / TYPING_SFX_POLICY.graphemesPerSound),
    )
  })

  it('两次打字声之间始终不短于最小间隔', () => {
    const result = runSequence([LONG_NARRATION, narration('它没有停下来。'), LONG_NARRATION])

    for (let index = 1; index < result.sounds.length; index += 1) {
      expect(result.sounds[index].at - result.sounds[index - 1].at).toBeGreaterThanOrEqual(
        TYPING_SFX_POLICY.charsMinIntervalMs,
      )
    }
  })

  it('打字声只来自逐字揭示，不来自任何跳过', () => {
    const result = runSequence([LONG_NARRATION, PANEL_BLOCK, LONG_NARRATION])

    expect(result.sounds.every((sound) => sound.cause === 'tick')).toBe(true)
  })

  it('揭示频率被限制在每秒 7 次以内', () => {
    const result = runSequence([LONG_NARRATION, LONG_NARRATION, LONG_NARRATION])

    expect(result.elapsed).toBeGreaterThan(0)

    const perSecond = (result.sounds.length / result.elapsed) * 1000

    expect(perSecond).toBeLessThanOrEqual(7)
  })

  it('极快揭示（时长上限压缩）时也不会连成一串', () => {
    // 超长块会被 maxCharsBlockMs 压缩，一次 tick 揭示多个字素。
    const huge = narration('镜'.repeat(2000))
    const result = runSequence([huge])

    for (let index = 1; index < result.sounds.length; index += 1) {
      expect(result.sounds[index].at - result.sounds[index - 1].at).toBeGreaterThanOrEqual(
        TYPING_SFX_POLICY.charsMinIntervalMs,
      )
    }
  })
})

describe('结构化块：整行揭示要更稀疏', () => {
  it('面板类块不会每一行都响', () => {
    const result = runSequence([PANEL_BLOCK])

    // 六行内容，按 450ms 的间隔最多响两次。
    expect(result.sounds.length).toBeLessThan(6)
  })

  it('面板类块的打字声间隔不短于 units 的最小间隔', () => {
    const result = runSequence([PANEL_BLOCK, PANEL_BLOCK])

    for (let index = 1; index < result.sounds.length; index += 1) {
      expect(result.sounds[index].at - result.sounds[index - 1].at).toBeGreaterThanOrEqual(
        TYPING_SFX_POLICY.unitsMinIntervalMs,
      )
    }
  })
})

describe('不该发声的情况', () => {
  it('divider、instant 和空块不产生任何打字声', () => {
    const result = runSequence([
      { kind: 'divider' },
      { kind: 'narration', text: '这一段立即显示。', pacing: 'instant' },
      { kind: 'narration', text: '' },
      { kind: 'narration', text: '   ' },
    ])

    expect(result.sounds).toEqual([])
    expect(result.state.sequenceComplete).toBe(true)
  })

  it('reduced-motion 下每块立即完整显示，不补播被跳过的字符', () => {
    const result = runSequence([LONG_NARRATION, PANEL_BLOCK, LONG_NARRATION], {
      reducedMotion: true,
    })

    expect(result.sounds).toEqual([])
    expect(result.state.sequenceComplete).toBe(true)
  })

  it('页面隐藏时不产生任何打字声', () => {
    const result = runSequence([LONG_NARRATION], { paused: true })

    expect(result.sounds).toEqual([])
  })

  it('玩家点击补全当前 block 时不补播被跳过的字符', () => {
    const full = runSequence([LONG_NARRATION], { autoplayEnabled: false })
    const skipped = runSequence([LONG_NARRATION], { autoplayEnabled: false, inputAtStep: 3 })

    expect(skipped.state.blockComplete).toBe(true)
    // 只保留补全之前那几步产生的声音，跳过的部分一声都不补。
    expect(skipped.sounds.length).toBeLessThan(full.sounds.length)
    expect(skipped.sounds.every((sound) => sound.cause === 'tick')).toBe(true)
  })

  it('一次完成整个展示序列时不补播', () => {
    const blocks = [LONG_NARRATION, LONG_NARRATION, LONG_NARRATION]
    const early = runSequence(blocks, { autoplayEnabled: true, inputAtStep: 2 })

    expect(early.state.sequenceComplete).toBe(true)
    // 只有第一块开头那两步是逐字揭示，其余全部被一次跳过。
    expect(early.sounds.length).toBeLessThanOrEqual(1)
  })

  it('关闭自动播放导致的立即刹车不补播', () => {
    const braked = runSequence([LONG_NARRATION], { brakeAtStep: 4 })
    const soundsAfterBrake = braked.sounds.filter((sound) => sound.cause !== 'tick')

    expect(braked.state.blockComplete).toBe(true)
    expect(soundsAfterBrake).toEqual([])
  })

  it('文本已经完整时的手动推进只是进入下一块，本身不发声', () => {
    const plan = buildSequencePlan([narration('短句。'), LONG_NARRATION])
    let state = createReadingSequenceState(plan, NODE_KEY)

    state = skipCurrentBlock(state, plan)

    const next = advanceToNextBlock(state, plan)
    const event = buildReadingRevealEvent(state, next, plan, 'enterBlock')

    expect(event).not.toBeNull()

    const decision = decideTypingSfx(createTypingSfxState(), event!, 10_000)

    expect(decision.play).toBe(false)
  })

  it('completeSequence 产生的转换不发声', () => {
    const plan = buildSequencePlan([LONG_NARRATION, LONG_NARRATION])
    const state = createReadingSequenceState(plan, NODE_KEY)
    const next = completeSequence(state, plan)
    const event = buildReadingRevealEvent(state, next, plan, 'complete')

    if (event) {
      expect(decideTypingSfx(createTypingSfxState(), event, 10_000).play).toBe(false)
    }
  })
})

describe('限频状态跟着展示序列走', () => {
  it('sequenceKey 变化后，上一段的累计与间隔一律作废', () => {
    const plan = buildSequencePlan([LONG_NARRATION])
    const state = createReadingSequenceState(plan, NODE_KEY)
    const next = tickReadingSequence(state, plan)
    const event = buildReadingRevealEvent(state, next, plan, 'tick')

    expect(event).not.toBeNull()

    // 上一段刚响过，间隔还没到。
    const stale = { pendingGraphemes: 5, lastPlayedAt: 10_000, sequenceKey: 'node:old' }
    const decision = decideTypingSfx(stale, { ...event!, delta: 6 }, 10_010)

    // 换了序列，旧的 lastPlayedAt 不再压制新序列的第一次发声。
    expect(decision.state.sequenceKey).toBe(NODE_KEY)
    expect(decision.play).toBe(true)
  })

  it('同一序列内旧的累计会被保留，不会因为一次静默事件被清空', () => {
    const base = { pendingGraphemes: 3, lastPlayedAt: 0, sequenceKey: NODE_KEY }
    const decision = decideTypingSfx(
      base,
      { sequenceKey: NODE_KEY, blockIndex: 0, mode: 'chars', delta: 1, cause: 'tick' },
      1_000,
    )

    expect(decision.play).toBe(false)
    expect(decision.state.pendingGraphemes).toBe(4)
  })

  it('累计不会攒过阈值，快速揭示后也只响一次', () => {
    let state = createTypingSfxState()
    let played = 0

    for (let index = 0; index < 20; index += 1) {
      const decision = decideTypingSfx(
        state,
        { sequenceKey: NODE_KEY, blockIndex: 0, mode: 'chars', delta: 30, cause: 'tick' },
        1_000,
      )

      state = decision.state
      if (decision.play) played += 1
    }

    // 时间完全不前进时，只有第一次会响，剩下的全被最小间隔挡住。
    expect(played).toBe(1)
    expect(state.pendingGraphemes).toBe(TYPING_SFX_POLICY.graphemesPerSound)
  })

  it('被跳过的转换会清掉累计，跳过之后不会立刻补一声', () => {
    const decision = decideTypingSfx(
      { pendingGraphemes: 5, lastPlayedAt: 0, sequenceKey: NODE_KEY },
      { sequenceKey: NODE_KEY, blockIndex: 0, mode: 'chars', delta: 200, cause: 'skip' },
      5_000,
    )

    expect(decision.play).toBe(false)
    expect(decision.state.pendingGraphemes).toBe(0)
  })
})

describe('揭示事件本身', () => {
  it('状态没变时不产生事件', () => {
    const plan = buildSequencePlan([LONG_NARRATION])
    const state = createReadingSequenceState(plan, NODE_KEY)

    expect(buildReadingRevealEvent(state, state, plan, 'tick')).toBeNull()
  })

  it('跨展示序列的状态变化不产生事件', () => {
    const plan = buildSequencePlan([LONG_NARRATION])
    const previous = createReadingSequenceState(plan, NODE_KEY)
    const next = createReadingSequenceState(plan, 'response:ch1_x:ch1.y')

    expect(buildReadingRevealEvent(previous, next, plan, 'tick')).toBeNull()
  })

  it('事件如实报告本次新增的项数', () => {
    const plan = buildSequencePlan([LONG_NARRATION])
    const state = createReadingSequenceState(plan, NODE_KEY)
    const next = tickReadingSequence(state, plan)
    const event = buildReadingRevealEvent(state, next, plan, 'tick')

    expect(event?.delta).toBe(next.revealed - state.revealed)
    expect(event?.mode).toBe('chars')
    expect(event?.sequenceKey).toBe(NODE_KEY)
  })
})
