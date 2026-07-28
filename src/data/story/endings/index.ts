import type { EndingDefinition, EndingId } from '../../../types/story'
import { softIllusionEnding } from './softIllusion'
import { cruelOptimizationEnding } from './cruelOptimization'
import { symbiosisEnding } from './symbiosis'
import { activeDisconnectionEnding } from './activeDisconnection'
import { mirrorTrapEnding } from './mirrorTrap'

/**
 * 五个结局的定义索引。
 *
 * 全部为 ENGINE TEST PLACEHOLDER：只有标题和骨架，正文录入属于 C02。
 * 结局触发条件不在这里，见 ../rules/endingRules.ts。
 */
export const endings: Record<EndingId, EndingDefinition> = {
  soft_illusion: softIllusionEnding,
  cruel_optimization: cruelOptimizationEnding,
  symbiosis: symbiosisEnding,
  active_disconnection: activeDisconnectionEnding,
  mirror_trap: mirrorTrapEnding,
}

export const endingIds = Object.keys(endings) as EndingId[]
