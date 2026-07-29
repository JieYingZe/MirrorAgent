import type { StoryBlock } from '../../types/story'
import { splitGraphemes } from '../graphemes'
import { getBlockUnitTotal, isBlockEmpty } from './readingUnits'

/**
 * 阅读揭示计划（I01）。
 *
 * 纯计算：把一组已经通过条件过滤的文本块，翻译成「第几步揭示到第几项、之后等多久」。
 * 这里不碰 React、不碰 timer、也不读写 StoryState —— 打字机只影响展示层。
 *
 * 两种揭示模式：
 * - chars：narration / dialogue / quote 按 grapheme 逐字；
 * - units：system / record / message / document 按语义单元整条显示；
 * - instant：divider 与 `pacing: 'instant'`，整体立即显示。
 */

export type RevealStep = {
  /** 本步之后已揭示的项数（chars 为 grapheme 数，units 为语义单元数）。 */
  upTo: number
  /** 本步之后到下一步的等待毫秒数；最后一步为 0。 */
  delay: number
}

export type BlockRevealMode = 'chars' | 'units' | 'instant'

export type BlockRevealPlan = {
  mode: BlockRevealMode
  /** 空块不消耗一次点击，由状态机自动跳过。 */
  empty: boolean
  /** 完整揭示后的项数；instant 与空块为 0。 */
  total: number
  /** chars 模式的完整 grapheme 序列；其他模式为空数组。 */
  graphemes: string[]
  steps: RevealStep[]
  /** 本块显示完之后、自动进入下一块之前的阅读停顿。 */
  interBlockDelay: number
}

export type SequencePlan = {
  blocks: BlockRevealPlan[]
  /** 没有块，或全部块都是空块。 */
  empty: boolean
}

/**
 * 节奏参数。
 *
 * 目标是阅读舒适与 10–15 分钟通关，取值范围来自
 * docs/04-ui-visual-spec.md §8.3（单字 18–35ms）。
 */
export const READING_TIMING = {
  /** 普通正文。 */
  normal: 22,
  /** delivery: 'direct' 的对话。 */
  direct: 18,
  /** delivery: 'soft' 的对话。 */
  soft: 26,
  /** quote 与 pacing: 'slow'。 */
  slow: 32,
  /** 结构化语义单元。 */
  unit: 180,
  /** 逗号类停顿。 */
  softPause: 40,
  /** 句末停顿。 */
  hardPause: 95,
  /** 段内换行停顿。 */
  newlinePause: 100,
  /** 单个字符型块的最长自动播放时长。 */
  maxCharsBlockMs: 6000,
  /** 单个结构化块的最长自动播放时长。 */
  maxUnitsBlockMs: 2800,
  /** 单次调度的最小间隔；低于这个值就合并成一步揭示多项。 */
  minStepMs: 16,

  /* 段间停顿：当前块显示完之后，自动进入下一块之前的一次呼吸。 */

  /** 普通 narration / dialogue。 */
  interBlockText: 520,
  /** 很短的一句，停久了反而拖节奏。 */
  interBlockShortText: 380,
  /** quote 需要留白。 */
  interBlockQuote: 760,
  /** system / record / message / document。 */
  interBlockPanel: 620,
  /** divider 只是转场标记。 */
  interBlockDivider: 320,
  /** 减少动态模式：仍然自动播放，只是几乎不等。 */
  interBlockReducedMs: 110,
  /** 少于这个字素数算「很短的一句」。 */
  shortTextGraphemes: 12,
} as const

const SOFT_PAUSE_CHARS = new Set(['，', '、', '：', '；', ',', ':', ';'])
const HARD_PAUSE_CHARS = new Set(['。', '！', '？', '…', '!', '?'])

/** 一个 grapheme 显示之后的额外停顿。 */
function pauseAfter(grapheme: string): number {
  if (grapheme === '\n') return READING_TIMING.newlinePause
  if (SOFT_PAUSE_CHARS.has(grapheme)) return READING_TIMING.softPause
  if (HARD_PAUSE_CHARS.has(grapheme)) return READING_TIMING.hardPause
  return 0
}

/** 字符型块的基础速度。pacing 优先于 delivery。 */
export function resolveCharBaseMs(block: StoryBlock): number {
  if (block.pacing === 'slow') return READING_TIMING.slow
  if (block.kind === 'quote') return READING_TIMING.slow

  if (block.kind === 'dialogue') {
    if (block.delivery === 'direct') return READING_TIMING.direct
    if (block.delivery === 'soft') return READING_TIMING.soft
  }

  return READING_TIMING.normal
}

/**
 * 把「每一项之后的等待时间」压成实际调度步骤。
 *
 * 两件事在这里一起完成：
 * 1. 总时长超过上限时整体按比例缩短，绝不删改任何内容；
 * 2. 缩短后间隔小于 minStepMs 的相邻项合并成一步，
 *    也就是一次 tick 揭示多个 grapheme，而不是排出一串几乎同时到期的 timer。
 */
export function buildRevealSteps(delays: readonly number[], maxTotalMs: number): RevealStep[] {
  const count = delays.length

  if (count === 0) return []
  if (count === 1) return [{ upTo: 1, delay: 0 }]

  // 最后一项显示完就算本块结束，它后面的等待没有意义。
  let total = 0

  for (let index = 0; index < count - 1; index += 1) {
    total += Math.max(delays[index], 0)
  }

  const scale = total > maxTotalMs && total > 0 ? maxTotalMs / total : 1

  const steps: RevealStep[] = []
  let pending = 0

  for (let index = 0; index < count - 1; index += 1) {
    pending += Math.max(delays[index], 0) * scale

    if (pending < READING_TIMING.minStepMs) continue

    steps.push({ upTo: index + 1, delay: Math.round(pending) })
    pending = 0
  }

  steps.push({ upTo: count, delay: 0 })

  return steps
}

/**
 * 段间停顿。
 *
 * 只按块类型和长度粗分档，不追求精确数值：目标是自然、安静，
 * 同时让「完全不点击」的通关时长仍然落在 10–15 分钟。
 */
export function resolveInterBlockDelay(block: StoryBlock, graphemeCount: number): number {
  if (block.kind === 'divider') return READING_TIMING.interBlockDivider
  if (block.kind === 'quote') return READING_TIMING.interBlockQuote

  if (block.kind === 'narration' || block.kind === 'dialogue') {
    return graphemeCount > 0 && graphemeCount <= READING_TIMING.shortTextGraphemes
      ? READING_TIMING.interBlockShortText
      : READING_TIMING.interBlockText
  }

  return READING_TIMING.interBlockPanel
}

export function buildBlockRevealPlan(block: StoryBlock): BlockRevealPlan {
  if (isBlockEmpty(block)) {
    // 空块会被状态机跳过，不会被调度，停顿取 0 只是为了字段完整。
    return { mode: 'instant', empty: true, total: 0, graphemes: [], steps: [], interBlockDelay: 0 }
  }

  if (block.pacing === 'instant' || block.kind === 'divider') {
    return {
      mode: 'instant',
      empty: false,
      total: 0,
      graphemes: [],
      steps: [],
      interBlockDelay: resolveInterBlockDelay(block, 0),
    }
  }

  if (block.kind === 'narration' || block.kind === 'dialogue' || block.kind === 'quote') {
    const graphemes = splitGraphemes(block.text)
    const baseMs = resolveCharBaseMs(block)
    const delays = graphemes.map((grapheme) => baseMs + pauseAfter(grapheme))

    return {
      mode: 'chars',
      empty: false,
      total: graphemes.length,
      graphemes,
      steps: buildRevealSteps(delays, READING_TIMING.maxCharsBlockMs),
      interBlockDelay: resolveInterBlockDelay(block, graphemes.length),
    }
  }

  const total = getBlockUnitTotal(block)
  const delays = new Array<number>(total).fill(READING_TIMING.unit)

  return {
    mode: 'units',
    empty: false,
    total,
    graphemes: [],
    steps: buildRevealSteps(delays, READING_TIMING.maxUnitsBlockMs),
    interBlockDelay: resolveInterBlockDelay(block, 0),
  }
}

export function buildSequencePlan(blocks: readonly StoryBlock[]): SequencePlan {
  const plans = blocks.map(buildBlockRevealPlan)

  return {
    blocks: plans,
    empty: plans.every((plan) => plan.empty),
  }
}
