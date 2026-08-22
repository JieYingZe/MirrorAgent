import type { EndingRateMap } from '../../../types/story'

/**
 * 理论路径占比。
 *
 * 这不是玩家达成率：项目没有后端和全局统计，数据来自「所有选项等概率」的结构模拟。
 * UI 展示时必须带「理论」或「估算」字样，见 docs/06-story-ending-data-format.md §15。
 * 展示文案统一放在 src/data/uiContent.ts 的 endingContent.rateLabel。
 *
 * 生成方式：对正式剧情里 15 个带变量影响的选择节点做精确联合分布卷积
 * （无随机、无抽样误差），再按第五章最终确认的 4 个等概率选项展开 ——
 * 询问身份命中隐藏条件时直接进入镜像困局，否则在三个真正最终行为中再等概率选一次。
 * 数值按玩家可见结局保存，取自 story-source/08-ending-rules.md §12。
 */
export const endingRates = {
  version: 'structural-2026-08-22',
  source: 'structural_estimate',
  method: 'equal_choice_weight_exact_convolution',
  rates: {
    soft_illusion: 0.0989,
    cruel_optimization: 0.1025,
    silent_delegation: 0.1251,
    symbiosis_stable_boundary: 0.1047,
    symbiosis_rebuilt_boundary: 0.0467,
    symbiosis_cautious: 0.0836,
    symbiosis_fragile_boundary: 0.0914,
    disconnection_active: 0.1047,
    disconnection_hard_extraction: 0.0939,
    disconnection_shallow: 0.128,
    mirror_trap: 0.0204,
  },
} satisfies EndingRateMap
