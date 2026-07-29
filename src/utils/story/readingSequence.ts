import type { StoryChoiceId, StoryNodeId } from '../../types/story'
import { READING_TIMING } from './readingPlan'
import type { BlockRevealPlan, SequencePlan } from './readingPlan'

/**
 * 阅读状态机（I01）。
 *
 * 纯函数，不认识 React、timer 和 DOM。规则只有四条：
 *
 * 1. 已完成的 block 始终完整显示；
 * 2. 只有当前 block 逐步揭示，后面的 block 还没开始显示；
 * 3. 当前 block 显示完后，等一段阅读停顿就自动进入下一个 block，
 *    直到整段结束；自动播放只在序列内部推进，绝不跨越交互边界；
 * 4. 一次输入只完成一个动作 —— 要么补全当前 block，要么跳过段间停顿进入下一个。
 *
 * 这个状态只属于展示层：它不进入 StoryState，不写 localStorage，
 * 也不会影响选择结果或节点路由。
 */

export type ReadingStage = 'node' | 'response'

/**
 * 阅读阶段。
 *
 * - `revealing`：正在按揭示计划推进字符或语义单元；
 * - `interBlockDelay`：当前 block 已完整，正在等段间停顿，到期自动进入下一 block；
 * - `sequenceComplete`：整段结束，自动播放停止，等待玩家点击继续／探索／选项。
 *
 * 由状态推导，不单独保存，避免和 blockComplete / sequenceComplete 漂移。
 */
export type ReadingPhase = 'revealing' | 'interBlockDelay' | 'sequenceComplete'

export type ReadingSequenceState = {
  /** 展示序列的稳定标识，变化即整段重来。 */
  sequenceKey: string
  /** 当前正在揭示的 block 下标；等于块数时表示整段已完成。 */
  blockIndex: number
  /** 当前 block 已揭示的项数：chars 模式是 grapheme 数，units 模式是语义单元数。 */
  revealed: number
  /** 当前 block 的揭示步骤下标。 */
  stepIndex: number
  blockComplete: boolean
  sequenceComplete: boolean
}

export type ReadingInputAction = 'skip' | 'advance' | 'completeSequence' | 'ignored'

/** 调度与输入都要知道当前偏好：自动播放默认关闭，由玩家主动开启。 */
export type ReadingOptions = {
  paused: boolean
  reducedMotion: boolean
  autoplayEnabled: boolean
}

export type ReadingInputResult = {
  state: ReadingSequenceState
  action: ReadingInputAction
}

export type ReadingTick =
  /** 不需要调度：整段已完成、页面隐藏，或状态越界。 */
  | { type: 'idle' }
  /** 减少动态模式：当前 block 直接补全，不逐字等待。 */
  | { type: 'complete' }
  /** 揭示下一步。 */
  | { type: 'reveal'; delay: number }
  /** 段间停顿到期后自动进入下一个 block。 */
  | { type: 'autoAdvance'; delay: number }

const RESPONSE_KEY_PREFIX = 'response:'

/** 稳定节点的展示序列标识。 */
export function nodeSequenceKey(nodeId: StoryNodeId): string {
  return `node:${nodeId}`
}

/**
 * 选项专属回应的展示序列标识。
 *
 * 带上选择 ID 与下一个稳定节点，保证「同一节点的不同选项」「同一选项重复进入」
 * 都会被当成新的展示序列。
 */
export function responseSequenceKey(
  choiceId: StoryChoiceId,
  destinationNodeId: StoryNodeId,
): string {
  return `${RESPONSE_KEY_PREFIX}${choiceId}:${destinationNodeId}`
}

export function getSequenceStage(sequenceKey: string): ReadingStage {
  return sequenceKey.startsWith(RESPONSE_KEY_PREFIX) ? 'response' : 'node'
}

/**
 * 从 from 开始的第一个非空块下标；没有则返回块数。
 *
 * 连续的空块在这里一次跳完，不会退化成一连串 setState，
 * 也不会要求玩家为空内容多点一次。
 */
function findNextBlockIndex(plan: SequencePlan, from: number): number {
  let index = Math.max(from, 0)

  while (index < plan.blocks.length && plan.blocks[index].empty) {
    index += 1
  }

  return index
}

function completedSequenceState(sequenceKey: string, plan: SequencePlan): ReadingSequenceState {
  return {
    sequenceKey,
    blockIndex: plan.blocks.length,
    revealed: 0,
    stepIndex: 0,
    blockComplete: true,
    sequenceComplete: true,
  }
}

/**
 * 当前 block 刚显示完时的归位。
 *
 * 后面还有非空块 → 停在 `interBlockDelay`，由调度器安排一次段间停顿；
 * 已经是最后一块 → 直接进入 `sequenceComplete`，
 * 不会为「进入下一个节点」安排任何 timer，交互边界由玩家点击跨越。
 *
 * 结束时 blockIndex 仍停在最后一块上（不是块数），这样字符／单元进度还能读，
 * 内部滚动也还能找到「当前块」。整段完成后所有块都会完整渲染，与下标无关。
 */
function settleBlockComplete(
  next: ReadingSequenceState,
  plan: SequencePlan,
): ReadingSequenceState {
  if (!next.blockComplete || next.sequenceComplete) return next

  if (findNextBlockIndex(plan, next.blockIndex + 1) >= plan.blocks.length) {
    return { ...next, sequenceComplete: true }
  }

  return next
}

/** 找到第一个非空块并进入它。 */
function enterBlockFrom(
  sequenceKey: string,
  plan: SequencePlan,
  from: number,
): ReadingSequenceState {
  const index = findNextBlockIndex(plan, from)

  if (index >= plan.blocks.length) {
    return completedSequenceState(sequenceKey, plan)
  }

  const blockPlan = plan.blocks[index]

  // instant 块进入即完整；其余块的第一步在进入时立刻生效，
  // 第一个字不需要先等一个间隔。
  const firstStep =
    blockPlan.mode === 'instant'
      ? { upTo: blockPlan.total, delay: 0 }
      : (blockPlan.steps[0] ?? { upTo: blockPlan.total, delay: 0 })

  return settleBlockComplete(
    {
      sequenceKey,
      blockIndex: index,
      revealed: firstStep.upTo,
      stepIndex: 0,
      blockComplete: firstStep.upTo >= blockPlan.total,
      sequenceComplete: false,
    },
    plan,
  )
}

export function createReadingSequenceState(
  plan: SequencePlan,
  sequenceKey: string,
): ReadingSequenceState {
  return enterBlockFrom(sequenceKey, plan, 0)
}

/**
 * 展示序列换了就整段重来：block 进度、字符进度、完成状态、推进锁全部重置。
 * key 没变时返回同一个引用，调用方可以据此跳过无意义的提交。
 */
export function syncReadingSequence(
  state: ReadingSequenceState,
  plan: SequencePlan,
  sequenceKey: string,
): ReadingSequenceState {
  if (state.sequenceKey === sequenceKey) return state

  return createReadingSequenceState(plan, sequenceKey)
}

function currentBlockPlan(
  state: ReadingSequenceState,
  plan: SequencePlan,
): BlockRevealPlan | undefined {
  return plan.blocks[state.blockIndex]
}

/** 揭示下一步。已完成或越界时返回同一个引用。 */
export function tickReadingSequence(
  state: ReadingSequenceState,
  plan: SequencePlan,
): ReadingSequenceState {
  if (state.sequenceComplete || state.blockComplete) return state

  const blockPlan = currentBlockPlan(state, plan)

  if (!blockPlan) return state

  const nextStepIndex = state.stepIndex + 1
  const nextStep = blockPlan.steps[nextStepIndex]

  if (!nextStep) {
    return settleBlockComplete({ ...state, revealed: blockPlan.total, blockComplete: true }, plan)
  }

  return settleBlockComplete(
    {
      ...state,
      stepIndex: nextStepIndex,
      revealed: nextStep.upTo,
      blockComplete: nextStep.upTo >= blockPlan.total,
    },
    plan,
  )
}

/** 立即补全当前 block。已完成时返回同一个引用。 */
export function skipCurrentBlock(
  state: ReadingSequenceState,
  plan: SequencePlan,
): ReadingSequenceState {
  if (state.sequenceComplete || state.blockComplete) return state

  const blockPlan = currentBlockPlan(state, plan)

  if (!blockPlan) return state

  return settleBlockComplete(
    {
      ...state,
      revealed: blockPlan.total,
      stepIndex: Math.max(blockPlan.steps.length - 1, 0),
      blockComplete: true,
    },
    plan,
  )
}

/**
 * 立即完成整个展示序列。
 *
 * 自动播放开启时的「点击一次看完当前页」：把当前序列剩下的 block 全部标记为完整，
 * 直接进入 `sequenceComplete`，随后由调度器自然停下（不会再排任何 timer）。
 *
 * 边界严格限定在当前展示序列内：稳定节点只完成该节点条件过滤后的 blocks，
 * responseStage 只完成这一次选择的 response。它不触发任何剧情交互 ——
 * 不点继续、不选选项、不结束 responseStage、不碰 StoryState / 路由 / 存档，
 * 也不改变自动播放偏好。
 */
export function completeSequence(
  state: ReadingSequenceState,
  plan: SequencePlan,
): ReadingSequenceState {
  if (state.sequenceComplete) return state

  let lastIndex = plan.blocks.length - 1

  while (lastIndex >= 0 && plan.blocks[lastIndex].empty) {
    lastIndex -= 1
  }

  if (lastIndex < 0) return completedSequenceState(state.sequenceKey, plan)

  const blockPlan = plan.blocks[lastIndex]

  return {
    sequenceKey: state.sequenceKey,
    blockIndex: lastIndex,
    revealed: blockPlan.total,
    stepIndex: Math.max(blockPlan.steps.length - 1, 0),
    blockComplete: true,
    sequenceComplete: true,
  }
}

/** 进入下一个 block。当前 block 还没完成时不动，避免一次输入跨两段。 */
export function advanceToNextBlock(
  state: ReadingSequenceState,
  plan: SequencePlan,
): ReadingSequenceState {
  if (state.sequenceComplete) return state
  if (!state.blockComplete) return state

  return enterBlockFrom(state.sequenceKey, plan, state.blockIndex + 1)
}

/**
 * 一次输入 = 一个动作。
 *
 * 自动播放开启时，一次推进直接看完当前展示序列（不跨节点、不触发交互）。
 *
 * 自动播放关闭时回到逐段手动：
 * 当前 block 未完成 → 只补全它，绝不顺带进入下一段；
 * 当前 block 已完成 → 才进入下一段；
 * 整段已完成 → 忽略。阅读推进不触发继续按钮，交互边界必须由玩家显式跨越。
 */
export function applyReadingInput(
  state: ReadingSequenceState,
  plan: SequencePlan,
  options: Pick<ReadingOptions, 'autoplayEnabled'>,
): ReadingInputResult {
  if (state.sequenceComplete) return { state, action: 'ignored' }

  if (options.autoplayEnabled) {
    return { state: completeSequence(state, plan), action: 'completeSequence' }
  }

  if (!state.blockComplete) {
    return { state: skipCurrentBlock(state, plan), action: 'skip' }
  }

  return { state: advanceToNextBlock(state, plan), action: 'advance' }
}

/** 当前阅读阶段，由状态推导。 */
export function getReadingPhase(state: ReadingSequenceState): ReadingPhase {
  if (state.sequenceComplete) return 'sequenceComplete'

  return state.blockComplete ? 'interBlockDelay' : 'revealing'
}

/**
 * 下一次调度应该做什么。整个序列同时只会有一次调度在等待。
 *
 * - 整段结束 → idle：不再安排任何 timer，交互边界由玩家跨越；
 * - 页面隐藏 → idle：逐字与段间推进一起停，恢复后从当前 phase 继续，
 *   既不累计后台时间，也不会一次性追赶；
 * - 当前 block 已完整 → 只有开启自动播放才排段间停顿，否则停下等玩家；
 * - 否则 → reveal：按揭示计划走下一步。
 *
 * 注意「打字机揭示」和「自动播放」是两件事：不论偏好如何，当前 block 自身
 * 始终自动逐字／逐单元显示；偏好只决定完成后要不要自动进入下一个 block。
 */
export function resolveReadingTick(
  state: ReadingSequenceState,
  plan: SequencePlan,
  options: ReadingOptions,
): ReadingTick {
  if (state.sequenceComplete) return { type: 'idle' }
  if (options.paused) return { type: 'idle' }

  const blockPlan = currentBlockPlan(state, plan)

  if (!blockPlan) return { type: 'idle' }

  if (state.blockComplete) {
    if (!options.autoplayEnabled) return { type: 'idle' }

    return {
      type: 'autoAdvance',
      delay: options.reducedMotion
        ? READING_TIMING.interBlockReducedMs
        : blockPlan.interBlockDelay,
    }
  }

  if (options.reducedMotion) return { type: 'complete' }

  const step = blockPlan.steps[state.stepIndex]

  if (!step) return { type: 'complete' }

  return { type: 'reveal', delay: step.delay }
}

/** 已经完整显示的 block 数量。整段完成后就是全部块。 */
export function getCompletedBlockCount(
  state: ReadingSequenceState,
  plan: SequencePlan,
): number {
  if (state.sequenceComplete) return plan.blocks.length

  return state.blockComplete ? state.blockIndex + 1 : state.blockIndex
}

/** 当前 block 的 grapheme 进度；不是字符型块时为 0。 */
export function getGraphemeProgress(state: ReadingSequenceState, plan: SequencePlan): number {
  return currentBlockPlan(state, plan)?.mode === 'chars' ? state.revealed : 0
}

/** 当前 block 的语义单元进度；不是结构化块时为 0。 */
export function getUnitProgress(state: ReadingSequenceState, plan: SequencePlan): number {
  return currentBlockPlan(state, plan)?.mode === 'units' ? state.revealed : 0
}
