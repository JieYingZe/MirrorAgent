import type { StoryState } from '../../types/story'
import type { EndingResolution } from './getEnding'
import { STAT_KEYS } from '../../data/initialGameState'

/**
 * 结局的开发验证输出。
 *
 * 曾经是结局页上一块可见的「开发验证 / DEV SUMMARY」面板。它的信息是给开发者
 * 核对用的 —— 变量裸数字、规则 ID、节点／选项 ID —— 出现在结局页上会把
 * 一次安静的收尾直接拆穿，所以整块从页面挪到了控制台。
 *
 * 它是这个项目里唯一允许出现变量裸数字和规则 ID 的地方；面板与结局文案一律
 * 只显示状态描述（见 utils/aiStatus.ts）。
 *
 * 不按环境开关：打包后的站点也照常打印，这样线上验收同样可以打开开发者工具核对。
 * 输出用折叠分组，不主动展开，正常游玩时控制台只多一行标题。
 */
export function logEndingSummary(
  resolution: EndingResolution,
  state: StoryState,
  /** 理论路径占比（0–1）。不是玩家达成率，见 docs/06 §15。 */
  rate: number,
): void {
  if (typeof console === 'undefined') return

  const group = console.groupCollapsed ?? console.log
  const groupEnd = console.groupEnd ?? (() => {})

  group.call(console, `[ending] ${resolution.variantId} / ${resolution.ruleId}`)

  console.log('规则', {
    endingId: resolution.endingId,
    variantId: resolution.variantId,
    ruleId: resolution.ruleId,
    usedFallback: resolution.usedFallback,
    理论路径占比: `${(rate * 100).toFixed(1)}%`,
    finalChoice: state.finalChoice ?? null,
  })

  console.log(
    '变量',
    Object.fromEntries(STAT_KEYS.map((key) => [key, state.stats[key]])),
  )

  console.log('标签 / flags', {
    tags: state.tags,
    flags: state.flags,
    visitedNodes: state.visitedNodeIds.length,
    schemaVersion: state.schemaVersion,
  })

  // 选择路径用表格：一行一次选择，比一长串字符串好核对。
  const path = state.choiceHistory.map((record) => ({
    node: record.nodeId,
    choice: record.choiceId,
    type: record.choiceType,
  }))

  if (console.table) {
    console.log(`选择路径（${path.length}）`)
    console.table(path)
  } else {
    console.log(`选择路径（${path.length}）`, path)
  }

  groupEnd.call(console)
}
