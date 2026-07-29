import { describe, expect, it } from 'vitest'
import type { StoryBlock } from '../src/types/story'
import { READING_TIMING, buildSequencePlan } from '../src/utils/story/readingPlan'
import {
  advanceToNextBlock,
  applyReadingInput,
  completeSequence,
  createReadingSequenceState,
  getCompletedBlockCount,
  getGraphemeProgress,
  getReadingPhase,
  getSequenceStage,
  getUnitProgress,
  nodeSequenceKey,
  resolveReadingTick,
  responseSequenceKey,
  skipCurrentBlock,
  syncReadingSequence,
  tickReadingSequence,
} from '../src/utils/story/readingSequence'
import type {
  ReadingOptions,
  ReadingSequenceState,
  ReadingTick,
} from '../src/utils/story/readingSequence'
import type { SequencePlan } from '../src/utils/story/readingPlan'

/**
 * 阅读状态机的行为约定。
 *
 * 全部是纯函数，测试直接推状态，不需要 DOM 或计时器。
 * 这些用例锁住四条底线：打字机揭示与自动播放是两件事、
 * 一次输入只做一件事、自动播放不跨越交互边界、打字机不影响剧情状态。
 */

const NODE_KEY = nodeSequenceKey('ch1.opening')

/** 自动播放默认关闭，这是首次玩家的真实起点。 */
const AUTOPLAY_OFF: ReadingOptions = {
  paused: false,
  reducedMotion: false,
  autoplayEnabled: false,
}

const AUTOPLAY_ON: ReadingOptions = { ...AUTOPLAY_OFF, autoplayEnabled: true }

function setup(blocks: StoryBlock[], sequenceKey = NODE_KEY) {
  const plan = buildSequencePlan(blocks)

  return { plan, state: createReadingSequenceState(plan, sequenceKey) }
}

/** 一直 tick 到当前块显示完，返回结果与用掉的步数。 */
function runToBlockEnd(state: ReadingSequenceState, plan: SequencePlan) {
  let current = state
  let ticks = 0

  while (!current.blockComplete && ticks < 10000) {
    const next = tickReadingSequence(current, plan)

    if (next === current) break

    current = next
    ticks += 1
  }

  return { state: current, ticks }
}

/**
 * 无输入的自动推进。
 *
 * 完全照抄调度器的逻辑：每一轮问一次「下一步该做什么」，然后执行对应的状态转换。
 * 状态不再变化或返回 idle 就停，所以死循环会表现为步数用尽而不是测试挂死。
 */
function autoplay(
  state: ReadingSequenceState,
  plan: SequencePlan,
  options: ReadingOptions = AUTOPLAY_ON,
  maxSteps = 5000,
) {
  let current = state
  let steps = 0
  const kinds: ReadingTick['type'][] = []

  while (steps < maxSteps) {
    const tick = resolveReadingTick(current, plan, options)

    kinds.push(tick.type)

    if (tick.type === 'idle') break

    const next =
      tick.type === 'complete'
        ? skipCurrentBlock(current, plan)
        : tick.type === 'reveal'
          ? tickReadingSequence(current, plan)
          : advanceToNextBlock(current, plan)

    // 状态没变说明调度器会停在这里，不会形成活的死循环。
    if (next === current) break

    current = next
    steps += 1
  }

  return { state: current, steps, kinds }
}

describe('展示序列的建立', () => {
  it('第一个字在进入时就出现，不用先等一个间隔', () => {
    const { state } = setup([{ kind: 'narration', text: '你创造了一个 AI。' }])

    expect(state.blockIndex).toBe(0)
    expect(state.revealed).toBe(1)
    expect(state.blockComplete).toBe(false)
    expect(state.sequenceComplete).toBe(false)
    expect(getReadingPhase(state)).toBe('revealing')
  })

  it('没有可见块时立即视为读完，交互马上可用', () => {
    const { state } = setup([])

    expect(state.sequenceComplete).toBe(true)
    expect(state.blockComplete).toBe(true)
    expect(getReadingPhase(state)).toBe('sequenceComplete')
  })

  it('全是空块时同样立即读完', () => {
    const { state } = setup([
      { kind: 'narration', text: '   ' },
      { kind: 'system', variant: 'status', lines: [] },
    ])

    expect(state.sequenceComplete).toBe(true)
  })

  it('开头的空块被跳过，直接进入第一个有内容的块', () => {
    const { state } = setup([
      { kind: 'narration', text: '' },
      { kind: 'narration', text: '正文还有后一段。' },
      { kind: 'narration', text: '第二段。' },
    ])

    expect(state.blockIndex).toBe(1)
    expect(state.sequenceComplete).toBe(false)
  })

  it('instant 块进入即完成，但仍然是独立的一段', () => {
    const { state } = setup([
      { kind: 'divider', label: '第二天早晨' },
      { kind: 'narration', text: '正文' },
    ])

    expect(state.blockIndex).toBe(0)
    expect(state.blockComplete).toBe(true)
    expect(state.sequenceComplete).toBe(false)
    expect(getReadingPhase(state)).toBe('interBlockDelay')
  })
})

describe('自动播放关闭（默认）', () => {
  const blocks: StoryBlock[] = [
    { kind: 'narration', text: '第一段正文，稍微长一点。' },
    { kind: 'narration', text: '第二段正文，也不算短。' },
  ]

  it('当前 block 仍然自动逐字揭示', () => {
    const { plan, state } = setup(blocks)

    expect(resolveReadingTick(state, plan, AUTOPLAY_OFF).type).toBe('reveal')
  })

  it('当前 block 揭示完就停住，不排段间 timer', () => {
    const { plan, state } = setup(blocks)
    const finished = runToBlockEnd(state, plan)

    expect(getReadingPhase(finished.state)).toBe('interBlockDelay')
    expect(resolveReadingTick(finished.state, plan, AUTOPLAY_OFF)).toEqual({ type: 'idle' })
  })

  it('没有输入时不会自己进入下一块', () => {
    const { plan, state } = setup(blocks)
    const played = autoplay(state, plan, AUTOPLAY_OFF)

    expect(played.state.blockIndex).toBe(0)
    expect(played.state.blockComplete).toBe(true)
    expect(played.state.sequenceComplete).toBe(false)
    expect(played.kinds).not.toContain('autoAdvance')
  })

  it('当前块没显示完时，一次输入只补全当前块，不进入下一块', () => {
    const { plan, state } = setup(blocks)
    const result = applyReadingInput(state, plan, AUTOPLAY_OFF)

    expect(result.action).toBe('skip')
    expect(result.state.blockIndex).toBe(0)
    expect(result.state.blockComplete).toBe(true)
    expect(result.state.revealed).toBe(plan.blocks[0].total)
    expect(result.state.sequenceComplete).toBe(false)
  })

  it('下一次独立输入才进入下一块', () => {
    const { plan, state } = setup(blocks)
    const first = applyReadingInput(state, plan, AUTOPLAY_OFF)
    const second = applyReadingInput(first.state, plan, AUTOPLAY_OFF)

    expect(second.action).toBe('advance')
    expect(second.state.blockIndex).toBe(1)
    expect(second.state.blockComplete).toBe(false)
    expect(second.state.revealed).toBe(1)
  })

  it('连续快速点击不会连跳：每次输入只推进一格', () => {
    const { plan, state } = setup(blocks)

    let current = state
    const actions: string[] = []

    for (let index = 0; index < 3; index += 1) {
      const result = applyReadingInput(current, plan, AUTOPLAY_OFF)
      actions.push(result.action)
      current = result.state
    }

    expect(actions).toEqual(['skip', 'advance', 'skip'])
    expect(current.blockIndex).toBe(1)
    // 第三次输入补全的是最后一块，整段随之结束，但绝不会越过交互边界。
    expect(current.sequenceComplete).toBe(true)
    expect(getCompletedBlockCount(current, plan)).toBe(2)
  })

  it('整段读完后的输入被忽略，阅读区域点击不会替玩家点继续', () => {
    const { plan, state } = setup([{ kind: 'narration', text: '一' }])

    expect(state.sequenceComplete).toBe(true)

    const extra = applyReadingInput(state, plan, AUTOPLAY_OFF)

    expect(extra.action).toBe('ignored')
    expect(extra.state).toBe(state)
  })

  it('当前块没完成时 advance 不生效，防止一次事件跨两段', () => {
    const { plan, state } = setup(blocks)

    expect(advanceToNextBlock(state, plan)).toBe(state)
  })

  it('中间的空块不消耗一次输入', () => {
    const { plan, state } = setup([
      { kind: 'narration', text: '前面这一段有点长。' },
      { kind: 'narration', text: '  ' },
      { kind: 'record', recordType: 'audit', paragraphs: [] },
      { kind: 'narration', text: '后面这一段也有点长。' },
    ])

    const afterSkip = skipCurrentBlock(state, plan)
    const afterAdvance = advanceToNextBlock(afterSkip, plan)

    expect(afterAdvance.blockIndex).toBe(3)
    expect(afterAdvance.sequenceComplete).toBe(false)
  })

  it('末尾的空块不会要求玩家多点一次', () => {
    const { plan, state } = setup([
      { kind: 'narration', text: '正文' },
      { kind: 'narration', text: '' },
    ])

    expect(applyReadingInput(state, plan, AUTOPLAY_OFF).state.sequenceComplete).toBe(true)
  })
})

describe('自动播放开启', () => {
  const blocks: StoryBlock[] = [
    { kind: 'narration', text: '第一段正文，稍微长一点。' },
    { kind: 'dialogue', speaker: 'agent', text: '第二段对白。' },
    { kind: 'quote', text: '第三段引语。' },
  ]

  it('当前 block 自动完成后进入段间等待，并给出该块的停顿时长', () => {
    const { plan, state } = setup(blocks)
    const finished = runToBlockEnd(state, plan)

    expect(getReadingPhase(finished.state)).toBe('interBlockDelay')
    expect(resolveReadingTick(finished.state, plan, AUTOPLAY_ON)).toEqual({
      type: 'autoAdvance',
      delay: plan.blocks[0].interBlockDelay,
    })
  })

  it('段间等待结束后自动进入下一 block', () => {
    const { plan, state } = setup(blocks)
    const waiting = runToBlockEnd(state, plan).state
    const next = advanceToNextBlock(waiting, plan)

    expect(next.blockIndex).toBe(1)
    expect(next.revealed).toBe(1)
    expect(getReadingPhase(next)).toBe('revealing')
  })

  it('多个 blocks 在没有任何输入时连续播放到底', () => {
    const { plan, state } = setup(blocks)
    const played = autoplay(state, plan)

    expect(played.state.sequenceComplete).toBe(true)
    expect(played.state.blockIndex).toBe(2)
    expect(getCompletedBlockCount(played.state, plan)).toBe(3)
    expect(played.kinds).toContain('reveal')
    expect(played.kinds).toContain('autoAdvance')
    expect(played.kinds.at(-1)).toBe('idle')
  })

  it('最后一个 block 完成后直接结束，不再安排任何自动推进', () => {
    const { plan, state } = setup(blocks)
    const played = autoplay(state, plan)

    expect(resolveReadingTick(played.state, plan, AUTOPLAY_ON)).toEqual({ type: 'idle' })
    // 自动播放绝不跨越交互边界：整段结束后 advance 也不再生效。
    expect(advanceToNextBlock(played.state, plan)).toBe(played.state)
  })

  it('每种块的段间停顿按类型区分，且都在克制范围内', () => {
    const plan = buildSequencePlan([
      { kind: 'narration', text: '一段普通正文，长度足够触发普通停顿。' },
      { kind: 'narration', text: '很短。' },
      { kind: 'quote', text: '一句需要留白的话。' },
      { kind: 'system', variant: 'status', lines: [{ label: '权限', value: '提升' }] },
      { kind: 'divider', label: '转场' },
    ])

    const [text, short, quote, panel, divider] = plan.blocks.map((item) => item.interBlockDelay)

    expect(text).toBe(READING_TIMING.interBlockText)
    expect(short).toBe(READING_TIMING.interBlockShortText)
    expect(quote).toBe(READING_TIMING.interBlockQuote)
    expect(panel).toBe(READING_TIMING.interBlockPanel)
    expect(divider).toBe(READING_TIMING.interBlockDivider)

    expect(short).toBeLessThan(text)
    expect(text).toBeLessThan(quote)
    expect(divider).toBeLessThan(text)

    for (const delay of plan.blocks.map((item) => item.interBlockDelay)) {
      expect(delay).toBeLessThanOrEqual(900)
    }
  })

  it('空块与 instant 块混排不会形成死循环，也不会产生大量状态变化', () => {
    const { plan, state } = setup([
      { kind: 'divider' },
      { kind: 'narration', text: '' },
      { kind: 'narration', text: '   ' },
      { kind: 'divider', label: '再转场' },
      { kind: 'system', variant: 'status', lines: [] },
      { kind: 'divider' },
    ])

    const played = autoplay(state, plan)

    expect(played.state.sequenceComplete).toBe(true)
    // 三个 divider：两次自动推进 + 一次 idle，空块在同一次转换里一起跳过。
    expect(played.steps).toBeLessThanOrEqual(4)
  })

  it('全空序列不会进入任何调度', () => {
    const { plan, state } = setup([{ kind: 'narration', text: '' }])

    expect(resolveReadingTick(state, plan, AUTOPLAY_ON)).toEqual({ type: 'idle' })
    expect(autoplay(state, plan).steps).toBe(0)
  })
})

describe('自动播放开启时的一次点击：看完当前展示序列', () => {
  const blocks: StoryBlock[] = [
    { kind: 'narration', text: '第一段正文，稍微长一点。' },
    { kind: 'system', variant: 'status', lines: [{ label: '权限', value: '提升' }] },
    { kind: 'narration', text: '第三段正文。' },
  ]

  it('一次输入直接让整段完成', () => {
    const { plan, state } = setup(blocks)
    const result = applyReadingInput(state, plan, AUTOPLAY_ON)

    expect(result.action).toBe('completeSequence')
    expect(result.state.sequenceComplete).toBe(true)
    expect(getReadingPhase(result.state)).toBe('sequenceComplete')
    expect(getCompletedBlockCount(result.state, plan)).toBe(3)
  })

  it('停在最后一块上，块内进度也补满', () => {
    const { plan, state } = setup(blocks)
    const done = completeSequence(state, plan)

    expect(done.blockIndex).toBe(2)
    expect(done.revealed).toBe(plan.blocks[2].total)
    expect(done.blockComplete).toBe(true)
  })

  it('完成后不再调度，也不会替玩家跨越交互边界', () => {
    const { plan, state } = setup(blocks)
    const done = completeSequence(state, plan)

    expect(resolveReadingTick(done, plan, AUTOPLAY_ON)).toEqual({ type: 'idle' })
    expect(advanceToNextBlock(done, plan)).toBe(done)
    expect(applyReadingInput(done, plan, AUTOPLAY_ON).action).toBe('ignored')
  })

  it('边界严格限定在当前展示序列：只认这一份 plan，不换 sequenceKey', () => {
    const responseKey = responseSequenceKey('ch1_tone_open', 'ch1.behavior_evidence')
    const { plan, state } = setup(
      [
        { kind: 'dialogue', speaker: 'agent', text: '记录不是指控。' },
        { kind: 'narration', text: '记录标记熄灭。' },
      ],
      responseKey,
    )

    const done = completeSequence(state, plan)

    expect(done.sequenceKey).toBe(responseKey)
    expect(getSequenceStage(done.sequenceKey)).toBe('response')
    expect(done.blockIndex).toBe(plan.blocks.length - 1)
    expect(getCompletedBlockCount(done, plan)).toBe(2)
  })

  it('末尾是空块时也停在最后一个有内容的块上', () => {
    const { plan, state } = setup([
      { kind: 'narration', text: '正文一。' },
      { kind: 'narration', text: '正文二。' },
      { kind: 'narration', text: '   ' },
    ])

    const done = completeSequence(state, plan)

    expect(done.blockIndex).toBe(1)
    expect(done.sequenceComplete).toBe(true)
  })

  it('已经完成的序列再点一次不会有任何变化', () => {
    const { plan, state } = setup(blocks)
    const done = completeSequence(state, plan)

    expect(completeSequence(done, plan)).toBe(done)
  })
})

describe('关闭自动播放开关：立即刹车', () => {
  const blocks: StoryBlock[] = [
    { kind: 'narration', text: '第一段正文，稍微长一点。' },
    { kind: 'narration', text: '第二段正文，也不算短。' },
  ]

  it('揭示途中关闭：当前 block 立即完整，且不进入下一块', () => {
    const { plan, state } = setup(blocks)
    const revealing = tickReadingSequence(state, plan)

    expect(revealing.blockComplete).toBe(false)

    const braked = skipCurrentBlock(revealing, plan)

    expect(braked.blockIndex).toBe(0)
    expect(braked.revealed).toBe(plan.blocks[0].total)
    expect(braked.blockComplete).toBe(true)
    expect(braked.sequenceComplete).toBe(false)
    // 刹车不是「显示整段」：第二块一个字都还没出现。
    expect(getCompletedBlockCount(braked, plan)).toBe(1)
  })

  it('刹车后不再有任何调度', () => {
    const { plan, state } = setup(blocks)
    const braked = skipCurrentBlock(tickReadingSequence(state, plan), plan)

    expect(resolveReadingTick(braked, plan, AUTOPLAY_OFF)).toEqual({ type: 'idle' })
    expect(autoplay(braked, plan, AUTOPLAY_OFF).steps).toBe(0)
  })

  it('段间等待时关闭：停在当前完整块，取消剩余等待', () => {
    const { plan, state } = setup(blocks)
    const waiting = runToBlockEnd(state, plan).state

    expect(resolveReadingTick(waiting, plan, AUTOPLAY_ON).type).toBe('autoAdvance')

    // 偏好一变，同一份状态上的调度决策立刻变成 idle，旧的段间 timer 不再有效。
    expect(resolveReadingTick(waiting, plan, AUTOPLAY_OFF)).toEqual({ type: 'idle' })
    expect(skipCurrentBlock(waiting, plan)).toBe(waiting)
    expect(waiting.blockIndex).toBe(0)
  })

  it('序列已完成时关闭不触发任何动作', () => {
    const { plan, state } = setup(blocks)
    const done = completeSequence(state, plan)

    expect(skipCurrentBlock(done, plan)).toBe(done)
    expect(resolveReadingTick(done, plan, AUTOPLAY_OFF)).toEqual({ type: 'idle' })
  })
})

describe('逐步揭示', () => {
  it('字符型块按 grapheme 前进，不跳过也不越界', () => {
    const { plan, state } = setup([{ kind: 'narration', text: '一二三四五六七八。' }])
    const finished = runToBlockEnd(state, plan)

    expect(finished.state.revealed).toBe(plan.blocks[0].total)
    expect(finished.state.blockComplete).toBe(true)
    expect(getGraphemeProgress(finished.state, plan)).toBe(plan.blocks[0].total)
    expect(getUnitProgress(finished.state, plan)).toBe(0)
  })

  it('emoji 不会被从中间截断', () => {
    const text = `好的\u{1f469}\u{200d}\u{1f469}\u{200d}\u{1f467}。`
    const { plan, state } = setup([{ kind: 'narration', text }])

    let current = state

    while (!current.blockComplete) {
      const shown = plan.blocks[0].graphemes.slice(0, current.revealed).join('')

      expect(text.startsWith(shown)).toBe(true)

      current = tickReadingSequence(current, plan)
    }
  })

  it('结构化块按语义单元前进', () => {
    const { plan, state } = setup([
      {
        kind: 'system',
        variant: 'permission',
        title: '权限变更',
        lines: [
          { label: '人格辅助', value: '全面启用' },
          { label: '自动执行', value: '开启' },
          { label: '边界提醒', value: '关闭' },
        ],
      },
    ])

    expect(state.revealed).toBe(1)
    expect(getUnitProgress(state, plan)).toBe(1)
    expect(getGraphemeProgress(state, plan)).toBe(0)

    const finished = runToBlockEnd(state, plan)

    expect(finished.state.revealed).toBe(3)
    expect(finished.ticks).toBe(2)
  })

  it('已完成的块继续 tick 不会有任何变化', () => {
    const { plan, state } = setup([{ kind: 'narration', text: '一' }])

    expect(state.blockComplete).toBe(true)
    expect(tickReadingSequence(state, plan)).toBe(state)
  })
})

describe('调度决策', () => {
  it('正在逐字时返回下一步的等待时间', () => {
    const { plan, state } = setup([{ kind: 'narration', text: '一二三四五。' }])
    const tick = resolveReadingTick(state, plan, AUTOPLAY_ON)

    expect(tick.type).toBe('reveal')
    expect(tick.type === 'reveal' && tick.delay).toBeGreaterThan(0)
  })

  it('整段完成后不再调度', () => {
    const { plan, state } = setup([{ kind: 'divider' }])

    expect(state.sequenceComplete).toBe(true)
    expect(resolveReadingTick(state, plan, AUTOPLAY_ON)).toEqual({ type: 'idle' })
  })

  it('页面隐藏时逐字与段间推进一起暂停', () => {
    const { plan, state } = setup([
      { kind: 'narration', text: '一二三四五六。' },
      { kind: 'narration', text: '第二段。' },
    ])

    const revealing = tickReadingSequence(state, plan)
    const waiting = skipCurrentBlock(revealing, plan)

    expect(resolveReadingTick(revealing, plan, { ...AUTOPLAY_ON, paused: true })).toEqual({
      type: 'idle',
    })
    expect(resolveReadingTick(waiting, plan, { ...AUTOPLAY_ON, paused: true })).toEqual({
      type: 'idle',
    })

    // 隐藏期间自动播放完全停住，不会偷偷往前走。
    expect(autoplay(revealing, plan, { ...AUTOPLAY_ON, paused: true }).steps).toBe(0)
  })

  it('恢复后按当前偏好与进度继续，不追赶', () => {
    const { plan, state } = setup([
      { kind: 'narration', text: '一二三四五六。' },
      { kind: 'narration', text: '第二段。' },
    ])

    const revealing = tickReadingSequence(state, plan)
    const waiting = skipCurrentBlock(revealing, plan)

    expect(revealing.revealed).toBe(2)
    expect(resolveReadingTick(revealing, plan, AUTOPLAY_ON).type).toBe('reveal')
    expect(getReadingPhase(waiting)).toBe('interBlockDelay')
    // 恢复后重新拿到的是同一个完整停顿，而不是按后台时长补跳。
    expect(resolveReadingTick(waiting, plan, AUTOPLAY_ON)).toEqual({
      type: 'autoAdvance',
      delay: plan.blocks[0].interBlockDelay,
    })
    // 后台期间偏好被关掉的话，恢复后就停住不动。
    expect(resolveReadingTick(waiting, plan, AUTOPLAY_OFF)).toEqual({ type: 'idle' })
  })

  it('减少动态模式下当前块立即完整显示，自动播放开启时块间仍自动推进', () => {
    const { plan, state } = setup([
      { kind: 'narration', text: '一二三四五六。' },
      { kind: 'narration', text: '第二段也不短。' },
    ])

    const reduced = { ...AUTOPLAY_ON, reducedMotion: true }

    expect(resolveReadingTick(state, plan, reduced)).toEqual({ type: 'complete' })

    const completed = skipCurrentBlock(state, plan)

    expect(completed.blockComplete).toBe(true)
    expect(completed.sequenceComplete).toBe(false)
    expect(resolveReadingTick(completed, plan, reduced)).toEqual({
      type: 'autoAdvance',
      delay: READING_TIMING.interBlockReducedMs,
    })
    expect(READING_TIMING.interBlockReducedMs).toBeLessThanOrEqual(150)

    const played = autoplay(state, plan, reduced)

    expect(played.state.sequenceComplete).toBe(true)
    expect(played.kinds).not.toContain('reveal')
  })

  it('减少动态模式 + 自动播放关闭：当前块立即完整后停住', () => {
    const { plan, state } = setup([
      { kind: 'narration', text: '一二三四五六。' },
      { kind: 'narration', text: '第二段也不短。' },
    ])

    const reduced = { ...AUTOPLAY_OFF, reducedMotion: true }
    const played = autoplay(state, plan, reduced)

    expect(played.state.blockIndex).toBe(0)
    expect(played.state.blockComplete).toBe(true)
    expect(played.state.sequenceComplete).toBe(false)
    expect(played.kinds).not.toContain('autoAdvance')
  })
})

describe('展示序列标识', () => {
  it('节点与回应用不同的标识，回应还带上选择与去向', () => {
    expect(nodeSequenceKey('ch2.mirror')).toBe('node:ch2.mirror')
    expect(responseSequenceKey('ch2_accept', 'ch2.after')).toBe('response:ch2_accept:ch2.after')
    expect(getSequenceStage(nodeSequenceKey('ch2.mirror'))).toBe('node')
    expect(getSequenceStage(responseSequenceKey('ch2_accept', 'ch2.after'))).toBe('response')
  })

  it('标识变化时整段重置：块进度、字符进度、完成状态、阶段一起归零', () => {
    const { plan, state } = setup([
      { kind: 'narration', text: '第一段。' },
      { kind: 'narration', text: '第二段。' },
    ])

    const advanced = advanceToNextBlock(skipCurrentBlock(state, plan), plan)

    expect(advanced.blockIndex).toBe(1)

    const responseKey = responseSequenceKey('ch1_accept', 'ch1.after')
    const reset = syncReadingSequence(advanced, plan, responseKey)

    expect(reset.sequenceKey).toBe(responseKey)
    expect(reset.blockIndex).toBe(0)
    expect(reset.revealed).toBe(1)
    expect(reset.blockComplete).toBe(false)
    expect(reset.sequenceComplete).toBe(false)
    expect(getReadingPhase(reset)).toBe('revealing')
    // 旧序列不论停在哪个 phase，新序列都从第一块的第一步重新开始调度。
    expect(resolveReadingTick(reset, plan, AUTOPLAY_ON).type).toBe('reveal')
  })

  it('标识没变时返回同一个引用，不会白白重置进度', () => {
    const { plan, state } = setup([{ kind: 'narration', text: '第一段。' }])
    const advanced = skipCurrentBlock(state, plan)

    expect(syncReadingSequence(advanced, plan, NODE_KEY)).toBe(advanced)
  })

  it('刷新后从稳定节点开头重放：同一个节点标识总是得到同一个初始状态', () => {
    const blocks: StoryBlock[] = [{ kind: 'narration', text: '第一段。' }]
    const first = setup(blocks)
    const second = setup(blocks)

    expect(second.state).toEqual(first.state)
    expect(second.state.blockIndex).toBe(0)
    expect(second.state.revealed).toBe(1)
  })

  it('response 序列播完只进入 sequenceComplete，不会自行越过继续按钮', () => {
    const responseKey = responseSequenceKey('ch1_tone_open', 'ch1.behavior_evidence')
    const { plan, state } = setup(
      [
        { kind: 'dialogue', speaker: 'agent', text: '记录不是指控。' },
        { kind: 'narration', text: '记录标记熄灭。' },
      ],
      responseKey,
    )

    const played = autoplay(state, plan)

    expect(getSequenceStage(played.state.sequenceKey)).toBe('response')
    expect(played.state.sequenceComplete).toBe(true)
    // 阅读状态机没有任何「结束 responseStage」的出口：
    // 清除 responseStage 只能由玩家点击继续触发，applyChoice 早在选择时就调用过一次。
    expect(resolveReadingTick(played.state, plan, AUTOPLAY_ON)).toEqual({ type: 'idle' })
    expect(applyReadingInput(played.state, plan, AUTOPLAY_ON).action).toBe('ignored')
  })
})

describe('已完成块的计数', () => {
  it('从 0 递增到块数，中途不会多算', () => {
    const { plan, state } = setup([
      { kind: 'narration', text: '一。' },
      { kind: 'narration', text: '二。' },
    ])

    expect(getCompletedBlockCount(state, plan)).toBe(0)

    const firstDone = skipCurrentBlock(state, plan)

    expect(getCompletedBlockCount(firstDone, plan)).toBe(1)

    const secondStarted = advanceToNextBlock(firstDone, plan)

    expect(getCompletedBlockCount(secondStarted, plan)).toBe(1)

    const allDone = skipCurrentBlock(secondStarted, plan)

    expect(allDone.sequenceComplete).toBe(true)
    expect(getCompletedBlockCount(allDone, plan)).toBe(2)
  })
})
