import { describe, expect, it } from 'vitest'
import { toEndingRatePercent } from '../src/utils/story/endingRate'
import { endingRates } from '../src/data/story'
import { endingContent } from '../src/data/uiContent'

/**
 * 结局页上的理论路径占比（docs/06 §15）。
 *
 * 两件事要守住：
 * - 数字是整数，且永远不会显示成「约 0%」；
 * - 措辞永远不能变成「达成概率」或「达成率」——
 *   当前没有任何真实玩家统计，那样写会让玩家误认为这是实时数据。
 */

describe('toEndingRatePercent', () => {
  it('把 0–1 的小数四舍五入成整数百分比', () => {
    expect(toEndingRatePercent(0.0989)).toBe(10)
    expect(toEndingRatePercent(0.128)).toBe(13)
    expect(toEndingRatePercent(0.0467)).toBe(5)
    expect(toEndingRatePercent(0.0204)).toBe(2)
  })

  it('永远不会显示成 0%', () => {
    expect(toEndingRatePercent(0)).toBe(1)
    expect(toEndingRatePercent(0.0001)).toBe(1)
    expect(toEndingRatePercent(-1)).toBe(1)
  })

  it('上限锁在 100，异常输入回落到 1', () => {
    expect(toEndingRatePercent(1)).toBe(100)
    expect(toEndingRatePercent(5)).toBe(100)
    expect(toEndingRatePercent(Number.NaN)).toBe(1)
    expect(toEndingRatePercent(Number.POSITIVE_INFINITY)).toBe(1)
  })

  it('11 个玩家可见结局都能得到一个 1–100 的整数', () => {
    for (const [variantId, rate] of Object.entries(endingRates.rates)) {
      const percent = toEndingRatePercent(rate)

      expect(Number.isInteger(percent), `${variantId} 不是整数`).toBe(true)
      expect(percent).toBeGreaterThanOrEqual(1)
      expect(percent).toBeLessThanOrEqual(100)
    }
  })

  it('隐藏结局取整后仍然明显低于常规结局', () => {
    const mirror = toEndingRatePercent(endingRates.rates.mirror_trap)

    for (const [variantId, rate] of Object.entries(endingRates.rates)) {
      if (variantId === 'mirror_trap') continue

      expect(toEndingRatePercent(rate)).toBeGreaterThan(mirror)
    }
  })
})

describe('占比文案', () => {
  it('直接标注数字的那句话只说「理论路径占比」', () => {
    // 断言性文案里不允许出现这些词；说明文案可以用「不是玩家达成率」否认它。
    const assertive = `${endingContent.rateLabel} ${endingContent.rateValuePrefix}`

    expect(endingContent.rateLabel).toContain('理论')
    expect(assertive).not.toMatch(/概率|达成率|成功率/)
  })

  it('任何一句都不把它说成「概率」', () => {
    const copy = [
      endingContent.rateLabel,
      endingContent.rateValuePrefix,
      endingContent.rateHint,
    ].join(' ')

    expect(copy).not.toMatch(/概率/)
  })

  it('说明文案明确否认这是玩家达成率', () => {
    expect(endingContent.rateHint).toContain('不是玩家达成率')
  })
})
