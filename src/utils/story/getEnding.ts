import type {
  EndingDefinition,
  EndingId,
  EndingRule,
  EndingStatusLine,
  EndingVariant,
  EndingVariantId,
  StoryState,
} from '../../types/story'
import {
  DEFAULT_FALLBACK_VARIANT_ID,
  endingFallbackRules,
  endingRules,
  endingVariantIndex,
} from '../../data/story'
import { evaluateCondition } from './evaluateCondition'
import { getVisibleBlocks, getVisibleGroupBlocks } from './getVisibleBlocks'
import { selectEndingPathEchoes } from './selectEndingPathEchoes'

export type EndingResolution = {
  /** 结局家族：决定正文与共用报告。 */
  endingId: EndingId
  /** 玩家可见结局：决定标题、副标题、状态摘要与变体段落。 */
  variantId: EndingVariantId
  /** 命中的规则 ID，开发期用于核对判断路径。 */
  ruleId: string
  /** 是否走了安全兜底：正常流程中不应出现。 */
  usedFallback: boolean
}

function byPriorityDesc(a: EndingRule, b: EndingRule): number {
  return b.priority - a.priority
}

// 排序只在模块加载时做一次。
const sortedRules: readonly EndingRule[] = [...endingRules].sort(byPriorityDesc)
const sortedFallbackRules: readonly EndingRule[] = [...endingFallbackRules].sort(byPriorityDesc)

/**
 * 统一结局判断。
 *
 * 规则见 story-source/08-ending-rules.md：
 * 1. 按 priority 从高到低取第一条命中的正式规则；
 * 2. 镜像困局排在最前，且不依赖 finalChoice —— 它的前提是玩家从未完成最终行为；
 * 3. 其余正式规则都依赖 finalChoice，因此只有缺失最终行为的异常存档才会落到兜底；
 * 4. 兜底链只允许返回常规结局，永远不会返回镜像困局或任何永久关闭变体。
 *
 * 条件求值统一走 evaluateCondition，与选项可见性、条件路由共用同一套实现。
 */
export function getEnding(state: StoryState): EndingResolution {
  for (const rule of sortedRules) {
    if (evaluateCondition(rule.when, state)) {
      return {
        endingId: rule.endingId,
        variantId: rule.variantId,
        ruleId: rule.id,
        usedFallback: false,
      }
    }
  }

  console.warn(
    '[story] 未命中任何正式结局规则，进入安全兜底。finalChoice =',
    state.finalChoice ?? '(缺失)',
  )

  for (const rule of sortedFallbackRules) {
    if (evaluateCondition(rule.when, state)) {
      return {
        endingId: rule.endingId,
        variantId: rule.variantId,
        ruleId: rule.id,
        usedFallback: true,
      }
    }
  }

  const fallback = endingVariantIndex.get(DEFAULT_FALLBACK_VARIANT_ID)

  return {
    // 默认兜底变体一定存在，验证脚本会检查；这里的兜底家族只为类型收敛。
    endingId: fallback?.ending.id ?? 'symbiosis',
    variantId: DEFAULT_FALLBACK_VARIANT_ID,
    ruleId: 'default_fallback',
    usedFallback: true,
  }
}

export type EndingLookup = {
  ending: EndingDefinition
  variant: EndingVariant
}

/** 找不到变体时返回 undefined，由页面显示数据损坏状态。 */
export function getEndingDefinition(variantId: EndingVariantId): EndingLookup | undefined {
  return endingVariantIndex.get(variantId)
}

export type EndingView = {
  ending: EndingDefinition
  variant: EndingVariant
  /** 玩家可见标题与副标题，一律来自变体。 */
  title: string
  subtitle: string
  statusLines: readonly EndingStatusLine[]
  bodyBlocks: ReturnType<typeof getVisibleBlocks>
  reportBlocks: ReturnType<typeof getVisibleBlocks>
  echoBlocks: ReturnType<typeof getVisibleBlocks>
  finalLineBlocks: ReturnType<typeof getVisibleBlocks>
}

/**
 * 把结局家族、命中的变体和当前状态合成为可直接渲染的块序列。
 *
 * 拼接顺序固定，页面不再自己判断任何结局分支：
 * - 正文：共同衔接（例如「先问过身份」）→ 变体衔接 → 家族正文；
 * - 报告：家族报告段落 → 变体报告段落 → 家族条件补充段落。
 */
export function buildEndingView(
  ending: EndingDefinition,
  variant: EndingVariant,
  state: StoryState,
): EndingView {
  return {
    ending,
    variant,
    title: variant.title,
    subtitle: variant.subtitle,
    statusLines: variant.statusLines ?? ending.report.statusLines,
    bodyBlocks: [
      ...getVisibleGroupBlocks(ending.preludeVariants, state),
      ...getVisibleBlocks(variant.prelude, state),
      ...getVisibleBlocks(ending.body, state),
    ],
    reportBlocks: [
      ...getVisibleBlocks(ending.report.paragraphs, state),
      ...getVisibleBlocks(variant.report, state),
      ...getVisibleGroupBlocks(ending.report.variants, state),
    ],
    echoBlocks: selectEndingPathEchoes(ending.pathEchoes, state),
    finalLineBlocks: getVisibleBlocks(variant.finalLine ?? ending.finalLine, state),
  }
}
