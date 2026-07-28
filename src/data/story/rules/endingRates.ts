import type { EndingRateMap } from '../../../types/story'

/**
 * 理论路径占比。
 *
 * 这不是玩家达成率：项目没有后端和全局统计，数据来自“所有选项等概率”的结构模拟。
 * UI 展示时必须带“理论”或“估算”字样，见 docs/06-story-ending-data-format.md §15。
 * 展示文案统一放在 src/data/uiContent.ts 的 endingContent.rateLabel。
 *
 * 数值取自 story-source/08-ending-rules.md §13，按规范以 0–1 小数保存。
 */
export const endingRates = {
  version: 'draft-2026-07-28',
  source: 'structural_estimate',
  method: 'equal_choice_weight',
  rates: {
    symbiosis: 0.35,
    active_disconnection: 0.3,
    soft_illusion: 0.165,
    cruel_optimization: 0.165,
    mirror_trap: 0.02,
  },
} satisfies EndingRateMap
