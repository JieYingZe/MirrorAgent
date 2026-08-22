import type {
  EndingDefinition,
  EndingId,
  EndingVariant,
  EndingVariantId,
} from '../../../types/story'
import { activeDisconnectionEnding } from './activeDisconnection'
import { cruelOptimizationEnding } from './cruelOptimization'
import { mirrorTrapEnding } from './mirrorTrap'
import { silentDelegationEnding } from './silentDelegation'
import { softIllusionEnding } from './softIllusion'
import { symbiosisEnding } from './symbiosis'

export { activeDisconnectionEnding } from './activeDisconnection'
export { cruelOptimizationEnding } from './cruelOptimization'
export { endingManifest } from './manifest'
export { mirrorTrapEnding } from './mirrorTrap'
export { pathEchoes } from './pathEchoes'
export { silentDelegationEnding } from './silentDelegation'
export { softIllusionEnding } from './softIllusion'
export { symbiosisEnding } from './symbiosis'

/**
 * 六个结局家族的定义索引。
 *
 * 结局触发条件不在这里，见 ../rules/endingRules.ts；
 * 路径回声是各家族共用的同一份池子，见 ./pathEchoes.ts。
 *
 * 这里显式标注 Record<EndingId, EndingDefinition>（而不是只用 satisfies），
 * 让 Object.values(endings) 得到统一的 EndingDefinition，
 * 否则可选字段（preludeVariants、report.variants）会在字面量类型上消失。
 */
export const endings: Record<EndingId, EndingDefinition> = {
  mirror_trap: mirrorTrapEnding,
  soft_illusion: softIllusionEnding,
  cruel_optimization: cruelOptimizationEnding,
  silent_delegation: silentDelegationEnding,
  symbiosis: symbiosisEnding,
  active_disconnection: activeDisconnectionEnding,
}

export const endingIds = Object.keys(endings) as EndingId[]

/**
 * 变体到家族的查表。
 *
 * 玩家可见结局是变体，正文与报告在家族上，因此结局页需要同时拿到两边。
 * 索引在模块加载时构建一次，重复的变体 ID 属于数据错误，由验证脚本报出。
 */
export const endingVariantIndex: ReadonlyMap<
  EndingVariantId,
  { ending: EndingDefinition; variant: EndingVariant }
> = new Map(
  Object.values(endings).flatMap((ending) =>
    ending.variants.map(
      (variant) =>
        [variant.id, { ending, variant }] as [
          EndingVariantId,
          { ending: EndingDefinition; variant: EndingVariant },
        ],
    ),
  ),
)

export const endingVariantIds = [...endingVariantIndex.keys()]
