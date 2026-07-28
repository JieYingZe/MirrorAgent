import type { EndingEchoRule, StoryBlock, StoryState } from '../../types/story'
import { evaluateCondition } from './evaluateCondition'

/**
 * 路径回声选择。
 *
 * 五个结局共用同一份回声池（src/data/story/endings/pathEchoes.ts），
 * 由这里根据当前存档挑出要显示的几条。
 *
 * 规则：
 * 1. 同一个 group（一章）最多取一条，取 priority 最高的那条；
 * 2. 没有声明 group 的规则各自成组；
 * 3. 组间顺序按规则在数据文件里首次出现的顺序，也就是章节顺序。
 *    这里不写死章节名单，以后新增章节的回声不会被悄悄丢掉；
 * 4. 全程不做随机，保证相同存档得到完全相同的报告。
 */
export function selectEndingPathEchoes(
  rules: readonly EndingEchoRule[] | undefined,
  state: StoryState,
  options: { min?: number; max?: number } = {},
): StoryBlock[] {
  const min = options.min ?? 2
  const max = options.max ?? 4

  if (min < 0 || max < min) {
    throw new RangeError('路径回声的数量区间必须满足 0 <= min <= max。')
  }

  if (!rules) return []

  // 组首次出现的顺序即输出顺序：Map 保持插入顺序。
  const bestByGroup = new Map<string, EndingEchoRule>()

  for (const rule of rules) {
    if (!evaluateCondition(rule.when, state)) continue

    const group = rule.group ?? rule.id
    const current = bestByGroup.get(group)

    if (current === undefined || (rule.priority ?? 0) > (current.priority ?? 0)) {
      bestByGroup.set(group, rule)
    }
  }

  const selected = [...bestByGroup.values()].slice(0, max)

  if (selected.length < min) {
    console.warn(`[story] 命中的路径回声只有 ${selected.length} 条，少于期望的 ${min} 条。`)
  }

  return selected.map((rule) => rule.block)
}
