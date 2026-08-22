import { describe, expect, it } from 'vitest'
import type { EndingVariantId } from '../src/types/story'
import {
  endingManifest,
  endingRates,
  endingRules,
  endingFallbackRules,
  endingVariantIndex,
  endings,
} from '../src/data/story'
import {
  BOUNDARY_RECOVERY_CHOICE_IDS,
  DEFAULT_FALLBACK_VARIANT_ID,
  FALLBACK_ALLOWED_VARIANT_IDS,
  STRONG_DELEGATION_CHOICE_IDS,
} from '../src/data/story/rules/endingRules'
import { nodeIndex, storyManifest } from '../src/data/story'

/**
 * 结局数据的引用一致性。
 *
 * 结局清单、家族定义、变体、触发规则和理论占比是五份互相引用的数据，
 * 任何一份单独改动都可能悄悄漂移 —— 这里把它们钉在一起。
 * 这些检查在 npm run validate:story 里也有，但那条命令不进 CI 的单元测试。
 */

const VISIBLE_ENDING_COUNT = 11

function allChoiceIds(): Set<string> {
  const ids = new Set<string>()

  for (const node of nodeIndex.values()) {
    for (const choice of node.choices ?? []) {
      ids.add(choice.id)
    }
  }

  return ids
}

describe('结局清单与定义', () => {
  it('共有 11 个玩家可见结局，分属 6 个家族', () => {
    expect(endingVariantIndex.size).toBe(VISIBLE_ENDING_COUNT)
    expect(Object.keys(endings)).toHaveLength(6)
  })

  it('清单顺序与变体索引完全对应', () => {
    expect(new Set(endingManifest.order)).toEqual(new Set(endingVariantIndex.keys()))
    expect(endingManifest.order).toHaveLength(VISIBLE_ENDING_COUNT)
  })

  it('清单里的标题、家族与隐藏标记都和定义一致', () => {
    for (const variantId of endingManifest.order) {
      const lookup = endingVariantIndex.get(variantId)
      const entry = endingManifest.entries[variantId]

      expect(lookup).toBeDefined()
      expect(entry.title).toBe(lookup?.variant.title)
      expect(entry.endingId).toBe(lookup?.ending.id)
      expect(entry.hidden).toBe(lookup?.ending.metadata?.hidden ?? false)
    }
  })

  it('每个变体都有独立可感知的标题与副标题', () => {
    const titles = new Set<string>()
    const subtitles = new Set<string>()

    for (const { variant } of endingVariantIndex.values()) {
      expect(variant.title.trim()).not.toBe('')
      expect(variant.subtitle.trim()).not.toBe('')
      titles.add(variant.title)
      subtitles.add(variant.subtitle)
    }

    expect(titles.size).toBe(VISIBLE_ENDING_COUNT)
    expect(subtitles.size).toBe(VISIBLE_ENDING_COUNT)
  })

  it('多变体家族的每个变体都有自己的状态摘要与报告段落', () => {
    for (const ending of Object.values(endings)) {
      if (ending.variants.length < 2) continue

      for (const variant of ending.variants) {
        expect(variant.statusLines?.length ?? 0).toBeGreaterThan(0)
        expect(variant.report?.length ?? 0).toBeGreaterThan(0)
      }

      // 同一家族里的状态摘要不能互相重复，否则玩家看不出区别。
      const rendered = ending.variants.map((variant) =>
        JSON.stringify(variant.statusLines ?? ending.report.statusLines),
      )

      expect(new Set(rendered).size).toBe(ending.variants.length)
    }
  })
})

describe('结局规则', () => {
  it('规则 ID 唯一，正式规则的优先级也唯一', () => {
    const ids = [...endingRules, ...endingFallbackRules].map((rule) => rule.id)
    const priorities = endingRules.map((rule) => rule.priority)

    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(priorities).size).toBe(priorities.length)
  })

  it('每条规则的家族与变体指向同一处', () => {
    for (const rule of [...endingRules, ...endingFallbackRules]) {
      const lookup = endingVariantIndex.get(rule.variantId)

      expect(lookup, `规则 ${rule.id} 引用了不存在的变体`).toBeDefined()
      expect(lookup?.ending.id).toBe(rule.endingId)
    }
  })

  it('每个玩家可见结局都至少有一条正式规则指向它', () => {
    const targets = new Set<EndingVariantId>(endingRules.map((rule) => rule.variantId))

    expect(targets).toEqual(new Set(endingVariantIndex.keys()))
  })

  it('镜像困局是唯一的最高优先级规则', () => {
    const sorted = [...endingRules].sort((a, b) => b.priority - a.priority)
    const mirrorRules = endingRules.filter((rule) => rule.variantId === 'mirror_trap')

    expect(mirrorRules).toHaveLength(1)
    expect(sorted[0]?.id).toBe(mirrorRules[0]?.id)
  })

  it('边界重建排在脆弱边界以前', () => {
    const rebuilt = endingRules.find((rule) => rule.variantId === 'symbiosis_rebuilt_boundary')
    const fragile = endingRules.find((rule) => rule.variantId === 'symbiosis_fragile_boundary')

    expect(rebuilt?.priority).toBeGreaterThan(fragile?.priority ?? Number.POSITIVE_INFINITY)
  })

  it('兜底只允许返回常规结局', () => {
    for (const rule of endingFallbackRules) {
      expect(FALLBACK_ALLOWED_VARIANT_IDS).toContain(rule.variantId)
    }

    expect(FALLBACK_ALLOWED_VARIANT_IDS).toContain(DEFAULT_FALLBACK_VARIANT_ID)
    expect(FALLBACK_ALLOWED_VARIANT_IDS).not.toContain('mirror_trap')

    for (const variantId of FALLBACK_ALLOWED_VARIANT_IDS) {
      expect(endingVariantIndex.get(variantId)?.ending.id).not.toBe('active_disconnection')
    }
  })

  it('强授权与边界收回名单都指向正式章节里真实存在的选择，且互不重叠', () => {
    const ids = allChoiceIds()

    for (const choiceId of [...STRONG_DELEGATION_CHOICE_IDS, ...BOUNDARY_RECOVERY_CHOICE_IDS]) {
      expect(ids, `选择 ${choiceId} 不在正式剧情中`).toContain(choiceId)
    }

    const strong = new Set<string>(STRONG_DELEGATION_CHOICE_IDS)

    for (const choiceId of BOUNDARY_RECOVERY_CHOICE_IDS) {
      expect(strong).not.toContain(choiceId)
    }
  })
})

describe('理论路径占比', () => {
  it('按玩家可见结局保存，键集合与变体索引一致', () => {
    expect(new Set(Object.keys(endingRates.rates))).toEqual(
      new Set(endingVariantIndex.keys()),
    )
  })

  it('每个值都在 0–1 之间，合计接近 1', () => {
    let total = 0

    for (const rate of Object.values(endingRates.rates)) {
      expect(rate).toBeGreaterThan(0)
      expect(rate).toBeLessThanOrEqual(1)
      total += rate
    }

    expect(Math.abs(total - 1)).toBeLessThan(0.01)
  })

  it('只声明为结构模拟，不冒充玩家达成率', () => {
    expect(endingRates.source).toBe('structural_estimate')
    expect('sampleSize' in endingRates).toBe(false)
  })

  it('除隐藏结局外，没有哪个结果只有极端罕见的路径能到达', () => {
    for (const [variantId, rate] of Object.entries(endingRates.rates)) {
      if (variantId === 'mirror_trap') continue

      expect(rate, `${variantId} 的理论占比过低`).toBeGreaterThan(0.03)
    }

    // 隐藏结局必须保持稀有。
    expect(endingRates.rates.mirror_trap).toBeLessThan(0.05)
  })
})

describe('存档结构版本', () => {
  it('结局清单与剧情清单使用同一个版本号', () => {
    expect(endingManifest.schemaVersion).toBe(storyManifest.schemaVersion)
  })

  it('结局系统改版后版本号已经推进到 3', () => {
    expect(storyManifest.schemaVersion).toBe(3)
  })
})
