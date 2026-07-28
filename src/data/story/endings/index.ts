import type { EndingDefinition, EndingId } from '../../../types/story'
import { activeDisconnectionEnding } from './activeDisconnection'
import { cruelOptimizationEnding } from './cruelOptimization'
import { mirrorTrapEnding } from './mirrorTrap'
import { softIllusionEnding } from './softIllusion'
import { symbiosisEnding } from './symbiosis'

export { activeDisconnectionEnding } from './activeDisconnection'
export { cruelOptimizationEnding } from './cruelOptimization'
export { endingManifest } from './manifest'
export { mirrorTrapEnding } from './mirrorTrap'
export { pathEchoes } from './pathEchoes'
export { softIllusionEnding } from './softIllusion'
export { symbiosisEnding } from './symbiosis'

/**
 * 五个结局的定义索引。
 *
 * 结局触发条件不在这里，见 ../rules/endingRules.ts；
 * 路径回声是五个结局共用的同一份池子，见 ./pathEchoes.ts。
 *
 * 这里显式标注 Record<EndingId, EndingDefinition>（而不是只用 satisfies），
 * 让 Object.values(endings) 得到统一的 EndingDefinition，
 * 否则可选字段（preludeVariants、report.variants）会在字面量类型上消失。
 */
export const endings: Record<EndingId, EndingDefinition> = {
  soft_illusion: softIllusionEnding,
  cruel_optimization: cruelOptimizationEnding,
  symbiosis: symbiosisEnding,
  active_disconnection: activeDisconnectionEnding,
  mirror_trap: mirrorTrapEnding,
}

export const endingIds = Object.keys(endings) as EndingId[]
