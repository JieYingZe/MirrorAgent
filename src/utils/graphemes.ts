/**
 * Unicode grapheme 分割。
 *
 * 打字机必须按「用户感知到的一个字符」推进：直接用 UTF-16 下标切片会把
 * emoji 代理对、肤色修饰符、变体选择符、ZWJ 序列和组合字符从中间截断，
 * 屏幕上会短暂出现乱码方块。
 *
 * 优先使用 Intl.Segmenter；不可用时退回到手写的合并规则。
 * 两条路径都保证 `splitGraphemes(text).join('') === text`。
 */

type SegmentLike = { segment: string }

type SegmenterLike = {
  segment(input: string): Iterable<SegmentLike>
}

type SegmenterCtor = new (
  locales?: string | string[],
  options?: { granularity: 'grapheme' | 'word' | 'sentence' },
) => SegmenterLike

/** undefined 表示还没探测过，null 表示探测过但不可用。 */
let cachedSegmenter: SegmenterLike | null | undefined

function resolveSegmenter(): SegmenterLike | null {
  if (cachedSegmenter !== undefined) return cachedSegmenter

  const ctor = (Intl as unknown as { Segmenter?: SegmenterCtor }).Segmenter

  if (typeof ctor !== 'function') {
    cachedSegmenter = null
    return null
  }

  try {
    cachedSegmenter = new ctor(undefined, { granularity: 'grapheme' })
  } catch {
    cachedSegmenter = null
  }

  return cachedSegmenter
}

/* 不可见字符一律写成转义序列，避免源码里出现看不见的字面量。 */

const ZERO_WIDTH_JOINER = '\u{200d}'

/** 组合记号、ZWJ、变体选择符、keycap：一律并入前一个字素。 */
const APPEND_TO_PREVIOUS = /^[\p{M}\u{200d}\u{fe0e}\u{fe0f}\u{20e3}]$/u

/** 肤色修饰符。 */
const SKIN_TONE = /^[\u{1f3fb}-\u{1f3ff}]$/u

/** 区域指示符：两个连在一起才是一面国旗。 */
const REGIONAL_INDICATOR = /^[\u{1f1e6}-\u{1f1ff}]$/u

/**
 * Intl.Segmenter 不可用时的回退实现。
 *
 * 覆盖组合字符、变体选择符、ZWJ 序列、肤色修饰符和国旗，
 * 不追求完整实现 UAX #29，只保证不会把常见字素切碎。
 * 导出仅供测试与内部使用。
 */
export function splitGraphemesFallback(text: string): string[] {
  const result: string[] = []

  for (const codePoint of text) {
    const previous = result[result.length - 1]

    if (previous === undefined) {
      result.push(codePoint)
      continue
    }

    if (previous.endsWith(ZERO_WIDTH_JOINER)) {
      result[result.length - 1] = previous + codePoint
      continue
    }

    if (APPEND_TO_PREVIOUS.test(codePoint) || SKIN_TONE.test(codePoint)) {
      result[result.length - 1] = previous + codePoint
      continue
    }

    if (
      REGIONAL_INDICATOR.test(codePoint) &&
      REGIONAL_INDICATOR.test(previous) &&
      [...previous].length === 1
    ) {
      result[result.length - 1] = previous + codePoint
      continue
    }

    result.push(codePoint)
  }

  return result
}

export function splitGraphemes(text: string): string[] {
  if (text === '') return []

  const segmenter = resolveSegmenter()

  if (!segmenter) return splitGraphemesFallback(text)

  try {
    const result: string[] = []

    for (const item of segmenter.segment(text)) {
      result.push(item.segment)
    }

    return result
  } catch {
    return splitGraphemesFallback(text)
  }
}
