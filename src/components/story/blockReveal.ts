import type { BlockRevealPlan, SequencePlan } from '../../utils/story'

/**
 * 展示层的揭示进度。
 *
 * 组件只读这里的数字决定「画多少」，不参与调度，也不知道 timer 的存在。
 * 不传 reveal 时一律完整渲染，结局页等场景保持原有行为。
 */

export type BlockRevealState = {
  plan: BlockRevealPlan
  /** 已揭示的项数：chars 模式是 grapheme 数，units 模式是语义单元数。 */
  revealed: number
  complete: boolean
}

export type SequenceRevealState = {
  plan: SequencePlan
  blockIndex: number
  revealed: number
  blockComplete: boolean
  /** 整段完成后全部块完整显示，也不再是「正在阅读」的那一段。 */
  sequenceComplete: boolean
}

/** 结构化块当前应该显示多少个语义单元。 */
export function revealedUnitCount(reveal: BlockRevealState | undefined, total: number): number {
  if (!reveal || reveal.complete || reveal.plan.mode !== 'units') return total

  return Math.min(Math.max(reveal.revealed, 0), total)
}

/**
 * 未揭示单元的标记属性。
 *
 * 这些元素仍然参与布局并保留完整高度，只是不可见、不进无障碍树、不响应鼠标，
 * 所以逐条显示的过程中不会出现布局抖动。样式见 global.css 的 `[data-pending]`。
 */
export function pendingAttr(unit: number, revealed: number): 'true' | undefined {
  return unit < revealed ? undefined : 'true'
}
