import type { SequencePlan, BlockRevealMode } from './readingPlan'
import type { ReadingSequenceState } from './readingSequence'

/**
 * 揭示进度事件（I01 的最小扩展，供 A03 使用）。
 *
 * 阅读状态机本身不认识声音，这里只是把「刚刚发生了一次什么样的揭示」
 * 翻译成一个可以被订阅的事实：揭示了几项、属于哪一块、是什么原因造成的。
 * 判断「这次要不要响」完全在音频层（utils/audio/typingSfx.ts），
 * 因此纯阅读逻辑不依赖任何浏览器音频对象，音频也无法反过来影响阅读推进。
 *
 * 事件是**被动**的：它只在一次状态转换已经提交之后生成，不参与调度，
 * 也不会为自己安排任何 timer。所以「旧的打字声调度必须立即失效」这件事
 * 不需要额外处理 —— 根本没有调度可以变旧。
 */

/**
 * 这次揭示是怎么发生的。
 *
 * 只有 `tick` 是「按揭示计划一步一步走出来的」，其余四种都是一次性跨过一段内容：
 * 玩家补全、看完整段、关自动播放刹车、减少动态模式立即完整显示。
 * 音频层据此区分「正在逐字显示」和「内容被跳过了」，不为被跳过的字符补声。
 */
export type ReadingRevealCause =
  /** 调度器按揭示计划推进的一步。 */
  | 'tick'
  /** 进入了新的一块（自动播放的段间推进，或玩家手动进入下一块）。 */
  | 'enterBlock'
  /** 补全当前块：玩家点击，或关闭自动播放时的立即刹车。 */
  | 'skip'
  /** 一次显示完整个展示序列。 */
  | 'complete'
  /** 减少动态模式：当前块直接完整显示。 */
  | 'reducedMotion'

export type ReadingRevealEvent = {
  /** 展示序列标识；换序列时音频层据此丢弃旧的限频状态。 */
  sequenceKey: string
  blockIndex: number
  mode: BlockRevealMode
  /** 本次转换新揭示的项数（chars 是字素数，units 是语义单元数）。 */
  delta: number
  cause: ReadingRevealCause
}

/**
 * 把一次已经提交的状态转换翻译成揭示事件。
 *
 * 返回 null 表示这次转换没有新增可见内容（状态没变、跨块时上一块本来就完整、
 * instant 或空块），此时不该有任何反应。
 */
export function buildReadingRevealEvent(
  previous: ReadingSequenceState,
  next: ReadingSequenceState,
  plan: SequencePlan,
  cause: ReadingRevealCause,
): ReadingRevealEvent | null {
  if (next === previous) return null
  if (next.sequenceKey !== previous.sequenceKey) return null

  const blockPlan = plan.blocks[next.blockIndex]

  if (!blockPlan) return null

  // 换块时上一块的进度不参与计算：新块是从 0 开始揭示的。
  const delta =
    next.blockIndex === previous.blockIndex ? next.revealed - previous.revealed : next.revealed

  if (delta <= 0) return null

  return {
    sequenceKey: next.sequenceKey,
    blockIndex: next.blockIndex,
    mode: blockPlan.mode,
    delta,
    cause,
  }
}
