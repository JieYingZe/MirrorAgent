import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { StoryBlock } from '../types/story'
import type {
  ReadingPhase,
  ReadingSequenceState,
  ReadingStage,
} from '../utils/story/readingSequence'
import type { SequencePlan } from '../utils/story/readingPlan'
import { buildSequencePlan } from '../utils/story/readingPlan'
import {
  advanceToNextBlock,
  applyReadingInput,
  createReadingSequenceState,
  getCompletedBlockCount,
  getGraphemeProgress,
  getReadingPhase,
  getSequenceStage,
  getUnitProgress,
  resolveReadingTick,
  skipCurrentBlock,
  tickReadingSequence,
} from '../utils/story/readingSequence'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

/**
 * 把纯阅读状态机接到 React 上：一个调度器、一段生命周期。
 *
 * 关键约束：
 * - 逐字揭示与段间自动推进共用同一个调度器：整个展示序列同时最多只有一个
 *   活动 timer，用递归的单次 setTimeout，而不是 setInterval，也没有第二条
 *   与打字并行的 autoplay 定时线；自动播放开关也不另建 timer；
 * - 自动播放默认关闭，只在序列内部推进，最后一块结束即 sequenceComplete，
 *   绝不自动点击继续、自动选择或自动进入下一个节点；
 * - 推进走同步 ref，连续点击不会在同一渲染周期里读到旧状态而连跳两段；
 * - sequenceKey 变化时立即重建状态并作废旧回调，旧节点的文字不会漏进新节点；
 * - 页面隐藏时逐字与段间推进一起暂停，恢复后按当前偏好和 phase 继续，不追赶。
 */

const INPUT_THROTTLE_MS = 80

export type StoryReadingSequence = {
  stage: ReadingStage
  /** 当前阅读阶段：逐字揭示 / 段间等待 / 整段完成。 */
  phase: ReadingPhase
  sequenceKey: string
  plan: SequencePlan
  /** 当前正在揭示的 block 下标；等于块数表示整段完成。 */
  blockIndex: number
  /** 已完整显示的 block 数量。 */
  completedBlockCount: number
  /** 当前 block 的 grapheme 进度；非字符型块为 0。 */
  graphemeProgress: number
  /** 当前 block 的语义单元进度；非结构化块为 0。 */
  unitProgress: number
  revealed: number
  blockComplete: boolean
  sequenceComplete: boolean
  reducedMotion: boolean
  paused: boolean
  autoplayEnabled: boolean
  /** 推进锁是否生效。同步查询，不是渲染快照。 */
  isInputLocked: () => boolean
  /** 阅读区域的统一推进入口；返回是否真的消费了这次输入。 */
  advance: () => boolean
}

/** 页面是否处于隐藏状态。 */
function usePageHidden(): boolean {
  const [hidden, setHidden] = useState(
    () => typeof document !== 'undefined' && document.hidden === true,
  )

  useEffect(() => {
    if (typeof document === 'undefined') return

    const handleChange = () => setHidden(document.hidden === true)

    handleChange()
    document.addEventListener('visibilitychange', handleChange)

    return () => document.removeEventListener('visibilitychange', handleChange)
  }, [])

  return hidden
}

export function useStoryReadingSequence(
  blocks: readonly StoryBlock[],
  sequenceKey: string,
  options: { autoplayEnabled: boolean },
): StoryReadingSequence {
  const { autoplayEnabled } = options
  const plan = useMemo(() => buildSequencePlan(blocks), [blocks])
  const reducedMotion = usePrefersReducedMotion()
  const paused = usePageHidden()

  const [state, setState] = useState(() => createReadingSequenceState(plan, sequenceKey))

  /** 事件处理里读的永远是这个同步副本，不是可能滞后的 state。 */
  const stateRef = useRef(state)
  const planRef = useRef(plan)
  const lastInputAtRef = useRef(0)
  /** 每次调度换代一次，旧回调即使侥幸触发也会自行作废。 */
  const generationRef = useRef(0)

  // 展示序列或计划换了：同一次渲染内重建，绝不用旧进度去索引新计划。
  let active = state

  if (state.sequenceKey !== sequenceKey || planRef.current !== plan) {
    active = createReadingSequenceState(plan, sequenceKey)
    stateRef.current = active
    planRef.current = plan
    lastInputAtRef.current = 0
    generationRef.current += 1
    setState(active)
  }

  const commit = useCallback((next: ReadingSequenceState) => {
    if (next === stateRef.current) return
    stateRef.current = next
    setState(next)
  }, [])

  const {
    sequenceKey: activeKey,
    blockIndex,
    stepIndex,
    blockComplete,
    sequenceComplete,
  } = active

  /**
   * 关掉自动播放时的「立即刹车」。
   *
   * 只做两件事：把当前 block 立刻补全、停在这里。不进入下一个 block，
   * 也不会变成「显示整段」。旧的 reveal / autoAdvance timer 由下面调度 effect 的
   * cleanup 清掉并换代作废 —— autoplayEnabled 是它的依赖之一。
   * 这个 effect 声明在调度 effect 之前，所以同一次提交里刹车先生效，
   * 调度 effect 随后看到的已经是补全后的状态。
   */
  const previousAutoplayRef = useRef(autoplayEnabled)

  useEffect(() => {
    const wasEnabled = previousAutoplayRef.current

    previousAutoplayRef.current = autoplayEnabled

    if (!wasEnabled || autoplayEnabled) return

    commit(skipCurrentBlock(stateRef.current, plan))
  }, [autoplayEnabled, commit, plan])

  useEffect(() => {
    const tick = resolveReadingTick(stateRef.current, plan, {
      paused,
      reducedMotion,
      autoplayEnabled,
    })

    if (tick.type === 'idle') return

    if (tick.type === 'complete') {
      commit(skipCurrentBlock(stateRef.current, plan))
      return
    }

    const generation = generationRef.current
    const isReveal = tick.type === 'reveal'

    const timer = window.setTimeout(() => {
      // 换代即作废：旧序列或已被用户输入取代的调度不会再改状态。
      if (generation !== generationRef.current) return

      // 两个转换都在旧状态上再判一次前置条件，与用户输入撞车时只会有一次生效。
      commit(
        isReveal
          ? tickReadingSequence(stateRef.current, plan)
          : advanceToNextBlock(stateRef.current, plan),
      )
    }, tick.delay)

    return () => {
      generationRef.current += 1
      window.clearTimeout(timer)
    }
    // activeKey / blockIndex / stepIndex / blockComplete 一变就重新排下一步：
    // 逐字走完 → 排段间停顿，段间停顿到期 → 排下一块的第一步，形成单线递归调度。
  }, [
    commit,
    plan,
    paused,
    reducedMotion,
    autoplayEnabled,
    activeKey,
    blockIndex,
    stepIndex,
    blockComplete,
    sequenceComplete,
  ])

  const isInputLocked = useCallback(
    () => Date.now() - lastInputAtRef.current < INPUT_THROTTLE_MS,
    [],
  )

  const advance = useCallback(() => {
    const now = Date.now()

    // 轻量节流只用来吃掉重复的物理事件，防连跳靠的是下面的同步状态推进。
    if (now - lastInputAtRef.current < INPUT_THROTTLE_MS) return false

    const result = applyReadingInput(stateRef.current, plan, { autoplayEnabled })

    if (result.action === 'ignored') return false

    lastInputAtRef.current = now
    commit(result.state)
    return true
  }, [autoplayEnabled, commit, plan])

  return {
    stage: getSequenceStage(activeKey),
    phase: getReadingPhase(active),
    sequenceKey: activeKey,
    plan,
    blockIndex,
    completedBlockCount: getCompletedBlockCount(active, plan),
    graphemeProgress: getGraphemeProgress(active, plan),
    unitProgress: getUnitProgress(active, plan),
    revealed: active.revealed,
    blockComplete,
    sequenceComplete,
    reducedMotion,
    paused,
    autoplayEnabled,
    isInputLocked,
    advance,
  }
}
