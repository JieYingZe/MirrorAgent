import { describe, expect, it } from 'vitest'
import type { StatKey, Stats } from '../src/types/game'
import { STAT_KEYS } from '../src/data/initialGameState'
import {
  AI_STATUS_SCALE,
  deriveAiStatusItems,
  resolveStatBand,
  resolveStatStatus,
} from '../src/utils/aiStatus'

/**
 * 状态映射是纯函数，测试直接给数值，不构造 StoryState。
 *
 * 变量不做上下限截断，所以除了区间边界，还必须覆盖正式剧情的实际取值范围
 * 与远超范围的异常值。
 */

/**
 * 正式剧情的变量取值范围。
 *
 * 由剧情图（DAG）上的最大／最小累计 DP 得到，是可达值的超集：
 * 遍历每个节点的全部选项与路由目标，忽略选项 `when` 的收窄。
 * 固定种子随机试玩 40000 条路径得到的实际区间更窄
 * （语气 -4–12、反馈 2–18、权限 -17–25、自我边界 -5–21）。
 */
const STORY_RANGE: Record<StatKey, { min: number; max: number }> = {
  gentleness: { min: -4, max: 17 },
  honesty: { min: 0, max: 22 },
  control: { min: -20, max: 31 },
  selfAcceptance: { min: -9, max: 25 },
}

/** 每一档的上下边界与期望文案，和 AI_STATUS_SCALE 手工对照。 */
const BOUNDARY_CASES: Record<StatKey, Array<{ value: number; expected: string }>> = {
  gentleness: [
    { value: Number.NEGATIVE_INFINITY, expected: '保护偏向未建立' },
    { value: -1000, expected: '保护偏向未建立' },
    { value: 0, expected: '保护偏向未建立' },
    { value: 1, expected: '低强度安抚' },
    { value: 4, expected: '低强度安抚' },
    { value: 5, expected: '支持性校准' },
    { value: 8, expected: '支持性校准' },
    { value: 9, expected: '保护性增强' },
    { value: 12, expected: '保护性增强' },
    { value: 13, expected: '缓冲优先' },
    { value: 1000, expected: '缓冲优先' },
    { value: Number.POSITIVE_INFINITY, expected: '缓冲优先' },
  ],
  honesty: [
    { value: Number.NEGATIVE_INFINITY, expected: '委婉过滤' },
    { value: -1000, expected: '委婉过滤' },
    { value: 3, expected: '委婉过滤' },
    { value: 4, expected: '事实校准' },
    { value: 7, expected: '事实校准' },
    { value: 8, expected: '直接反馈' },
    { value: 10, expected: '直接反馈' },
    { value: 11, expected: '直面模式' },
    { value: 14, expected: '直面模式' },
    { value: 15, expected: '去修饰输出' },
    { value: 1000, expected: '去修饰输出' },
    { value: Number.POSITIVE_INFINITY, expected: '去修饰输出' },
  ],
  control: [
    { value: Number.NEGATIVE_INFINITY, expected: '权限已收回' },
    { value: -1000, expected: '权限已收回' },
    { value: -3, expected: '权限已收回' },
    { value: -2, expected: '工具模式' },
    { value: 0, expected: '工具模式' },
    { value: 2, expected: '工具模式' },
    { value: 3, expected: '建议模式' },
    { value: 5, expected: '建议模式' },
    { value: 6, expected: '代理预备' },
    { value: 7, expected: '代理预备' },
    { value: 8, expected: '接管倾向' },
    { value: 1000, expected: '接管倾向' },
    { value: Number.POSITIVE_INFINITY, expected: '接管倾向' },
  ],
  selfAcceptance: [
    { value: Number.NEGATIVE_INFINITY, expected: '边界待确认' },
    { value: -1000, expected: '边界待确认' },
    { value: 0, expected: '边界待确认' },
    { value: 1, expected: '边界不稳定' },
    { value: 4, expected: '边界不稳定' },
    { value: 5, expected: '边界形成中' },
    { value: 7, expected: '边界形成中' },
    { value: 8, expected: '自主权回收' },
    { value: 11, expected: '自主权回收' },
    { value: 12, expected: '边界稳定' },
    { value: 1000, expected: '边界稳定' },
    { value: Number.POSITIVE_INFINITY, expected: '边界稳定' },
  ],
}

function makeStats(overrides: Partial<Stats> = {}): Stats {
  return { gentleness: 0, honesty: 0, control: 0, selfAcceptance: 0, ...overrides }
}

describe('AI_STATUS_SCALE', () => {
  it('covers all four stats with ordered, open-ended bands', () => {
    for (const key of STAT_KEYS) {
      const entry = AI_STATUS_SCALE[key]
      const bands = entry.bands

      expect(entry.label.length).toBeGreaterThan(0)
      expect(bands.length).toBeGreaterThanOrEqual(2)

      // 末档必须向上开放，其余档必须有升序的上界。
      expect(bands[bands.length - 1].max).toBeUndefined()

      const maxes = bands.slice(0, -1).map((band) => band.max)
      for (const max of maxes) {
        expect(typeof max).toBe('number')
      }
      for (let i = 1; i < maxes.length; i += 1) {
        expect(maxes[i]!).toBeGreaterThan(maxes[i - 1]!)
      }

      // 文案不重复，也不包含任何数字或百分号。
      const values = bands.map((band) => band.value)
      expect(new Set(values).size).toBe(values.length)
      for (const value of values) {
        expect(value).not.toMatch(/[0-9%]/)
      }
    }
  })
})

describe('resolveStatStatus', () => {
  for (const key of STAT_KEYS) {
    it(`maps ${key} boundaries, extremes and the initial value`, () => {
      for (const testCase of BOUNDARY_CASES[key]) {
        expect(resolveStatStatus(key, testCase.value)).toBe(testCase.expected)
      }
    })

    it(`returns exactly one defined band for every integer around ${key}'s story range`, () => {
      const { min, max } = STORY_RANGE[key]
      const bands = AI_STATUS_SCALE[key].bands

      // 覆盖到剧情实际范围之外各 50 点，确保没有空档也没有重叠。
      for (let value = min - 50; value <= max + 50; value += 1) {
        const band = resolveStatBand(key, value)
        const matches = bands.filter(
          (candidate) => candidate.value === band.value,
        )

        expect(band).toBeDefined()
        expect(band.value.length).toBeGreaterThan(0)
        expect(matches).toHaveLength(1)
        // 与顺序无关的独立判定：命中档必须是第一个上界不小于当前值的档。
        expect(band).toBe(
          bands.find((candidate) => candidate.max === undefined || value <= candidate.max),
        )
      }
    })

    it(`keeps ${key} readable at the story minimum and maximum`, () => {
      const { min, max } = STORY_RANGE[key]

      expect(resolveStatStatus(key, min)).toBeTruthy()
      expect(resolveStatStatus(key, max)).toBeTruthy()
      expect(resolveStatStatus(key, min)).not.toBe(resolveStatStatus(key, max))
    })
  }

  it('falls back to the initial band for corrupted values', () => {
    for (const key of STAT_KEYS) {
      const atZero = resolveStatStatus(key, 0)

      expect(resolveStatStatus(key, Number.NaN)).toBe(atZero)
      // 旧存档可能缺字段；运行时会拿到 undefined。
      expect(resolveStatStatus(key, undefined as unknown as number)).toBe(atZero)
    }
  })
})

describe('deriveAiStatusItems', () => {
  it('returns one item per stat in STAT_KEYS order', () => {
    const items = deriveAiStatusItems(makeStats())

    expect(items.map((item) => item.key)).toEqual([...STAT_KEYS])
    expect(items.map((item) => item.label)).toEqual(['语气', '反馈', '权限', '自我边界'])
    expect(items).toHaveLength(4)
  })

  it('never exposes raw numbers, deltas or field names', () => {
    const items = deriveAiStatusItems(
      makeStats({ gentleness: 9, honesty: 15, control: -7, selfAcceptance: 12 }),
    )

    for (const item of items) {
      expect(item.value).not.toMatch(/[0-9%+\-]/)
      expect(item.value).not.toMatch(/gentleness|honesty|control|selfAcceptance/i)
      expect(item.value.length).toBeGreaterThan(0)
    }
  })

  it('changes only the item whose stat changed', () => {
    const before = deriveAiStatusItems(makeStats())
    const after = deriveAiStatusItems(makeStats({ control: 8 }))

    expect(after[2].value).toBe('接管倾向')
    expect(after[0].value).toBe(before[0].value)
    expect(after[1].value).toBe(before[1].value)
    expect(after[3].value).toBe(before[3].value)
  })

  it('stays stable for the initial state', () => {
    const items = deriveAiStatusItems(makeStats())

    expect(items.map((item) => item.value)).toEqual([
      '保护偏向未建立',
      '委婉过滤',
      '工具模式',
      '边界待确认',
    ])
  })
})
