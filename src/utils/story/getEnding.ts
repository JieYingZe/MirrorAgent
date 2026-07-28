import type { EndingDefinition, EndingId, EndingRule, StoryState } from '../../types/story'
import {
  DEFAULT_FALLBACK_ENDING_ID,
  endingFallbackRules,
  endingRules,
  endings,
} from '../../data/story'
import { evaluateCondition } from './evaluateCondition'
import { getVisibleBlocks, getVisibleGroupBlocks } from './getVisibleBlocks'
import { selectEndingPathEchoes } from './selectEndingPathEchoes'

export type EndingResolution = {
  endingId: EndingId
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
 * 2. 正式规则全部依赖 finalChoice，因此只有缺失 finalChoice 的异常存档才会落到兜底；
 * 3. 兜底链只允许返回常规结局，永远不会返回 mirror_trap 或 active_disconnection。
 *
 * 条件求值统一走 evaluateCondition，与选项可见性、条件路由共用同一套实现。
 */
export function getEnding(state: StoryState): EndingResolution {
  for (const rule of sortedRules) {
    if (evaluateCondition(rule.when, state)) {
      return { endingId: rule.endingId, ruleId: rule.id, usedFallback: false }
    }
  }

  console.warn(
    '[story] 未命中任何正式结局规则，进入安全兜底。finalChoice =',
    state.finalChoice ?? '(缺失)',
  )

  for (const rule of sortedFallbackRules) {
    if (evaluateCondition(rule.when, state)) {
      return { endingId: rule.endingId, ruleId: rule.id, usedFallback: true }
    }
  }

  return {
    endingId: DEFAULT_FALLBACK_ENDING_ID,
    ruleId: 'default_fallback',
    usedFallback: true,
  }
}

/** 找不到结局定义时返回 undefined，由页面显示数据损坏状态。 */
export function getEndingDefinition(endingId: EndingId): EndingDefinition | undefined {
  return endings[endingId]
}

export type EndingView = {
  ending: EndingDefinition
  bodyBlocks: ReturnType<typeof getVisibleBlocks>
  reportBlocks: ReturnType<typeof getVisibleBlocks>
  echoBlocks: ReturnType<typeof getVisibleBlocks>
  finalLineBlocks: ReturnType<typeof getVisibleBlocks>
}

/** 把结局定义和当前状态合成为可直接渲染的块序列。 */
export function buildEndingView(ending: EndingDefinition, state: StoryState): EndingView {
  return {
    ending,
    bodyBlocks: [
      ...getVisibleGroupBlocks(ending.preludeVariants, state),
      ...getVisibleBlocks(ending.body, state),
    ],
    reportBlocks: [
      ...getVisibleBlocks(ending.report.paragraphs, state),
      ...getVisibleGroupBlocks(ending.report.variants, state),
    ],
    echoBlocks: selectEndingPathEchoes(ending.pathEchoes, state),
    finalLineBlocks: getVisibleBlocks(ending.finalLine, state),
  }
}
