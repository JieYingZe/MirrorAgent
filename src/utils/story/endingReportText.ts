import type { Stats } from '../../types/game'
import { deriveAiStatusMeters } from '../aiStatus'
import { blocksToPlainText } from './blockText'
import type { EndingView } from './getEnding'

/** 复制文本里各段的固定标题，与界面文案分开：这是要被粘贴出去的内容。 */
export type EndingReportLabels = {
  /** 第一行，作品名。 */
  heading: string
  endingLabel: string
  reportLabel: string
  statusLabel: string
}

/**
 * 「复制我的镜像报告」的纯文本（S01）。
 *
 * 结构照 docs/03-interaction-design.md §6.2：作品名 → 我的结局 → 镜像报告
 * → 状态记录 → 结尾句。玩家会把它粘到聊天框或笔记里，所以是纯文本，
 * 没有 Markdown 标记，也没有缩进。
 *
 * 内容全部来自已经渲染在页面上的那些块（EndingView）与四个变量的状态映射 ——
 * 这里不重新判定结局、不读存档、不碰变量数值。复制出去的东西
 * 与玩家在页面上看到的一致，不多也不少：
 * - 规则 ID、节点 ID、变量裸数字一律不出现（那些只进控制台，见 endingSummaryLog）；
 * - 状态记录用的是面板上的同一批文案（utils/aiStatus.ts）。
 *
 * 纯函数：同样的输入永远得到同样的字符串，方便直接单测。
 */
export function buildEndingReportText(
  view: EndingView,
  stats: Stats,
  labels: EndingReportLabels,
): string {
  const sections: string[] = [labels.heading]

  // 结局名用玩家看到的那个（变体标题），不是家族名。
  sections.push(`${labels.endingLabel}${view.title}`)

  const report = blocksToPlainText(view.reportBlocks)

  if (report !== '') {
    sections.push(`${labels.reportLabel}\n${report}`)
  }

  const echoes = blocksToPlainText(view.echoBlocks)

  if (echoes !== '') {
    sections.push(echoes)
  }

  // 状态记录用「- 标签：状态」的列表，和 §6.2 的示例一致。
  const status = deriveAiStatusMeters(stats)
    .map((item) => `- ${item.label}：${item.value}`)
    .join('\n')

  sections.push(`${labels.statusLabel}\n${status}`)

  const finalLine = blocksToPlainText(view.finalLineBlocks)

  if (finalLine !== '') {
    sections.push(finalLine)
  }

  return sections.join('\n\n')
}
