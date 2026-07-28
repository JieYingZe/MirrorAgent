import type {
  ConditionalBlockGroup,
  EndingEchoRule,
  StoryBlock,
  StoryChoice,
  StoryState,
} from '../../types/story'
import { evaluateCondition } from './evaluateCondition'

/**
 * 条件过滤。
 *
 * 不满足 `when` 的块和选项不进入渲染，也不保留空白占位；
 * 以后接入打字机（I01）时，同样不进入打字队列。
 */
export function getVisibleBlocks(
  blocks: readonly StoryBlock[] | undefined,
  state: StoryState,
): StoryBlock[] {
  if (!blocks) return []

  return blocks.filter((block) => block.when === undefined || evaluateCondition(block.when, state))
}

export function getVisibleChoices(
  choices: readonly StoryChoice[] | undefined,
  state: StoryState,
): StoryChoice[] {
  if (!choices) return []

  return choices.filter(
    (choice) => choice.when === undefined || evaluateCondition(choice.when, state),
  )
}

/** 展开满足条件的块组，按声明顺序拼接。 */
export function getVisibleGroupBlocks(
  groups: readonly ConditionalBlockGroup[] | undefined,
  state: StoryState,
): StoryBlock[] {
  if (!groups) return []

  return groups
    .filter((group) => evaluateCondition(group.when, state))
    .flatMap((group) => group.blocks)
}

/**
 * 路径回声：同一分组最多取一条，按 priority 从高到低选择。
 * 不做随机，保证相同存档得到稳定报告。
 */
export function selectPathEchoes(
  rules: readonly EndingEchoRule[] | undefined,
  state: StoryState,
  maxTotal = 4,
): StoryBlock[] {
  if (!rules) return []

  const bestByGroup = new Map<string, EndingEchoRule>()

  for (const rule of rules) {
    if (!evaluateCondition(rule.when, state)) continue

    const group = rule.group ?? rule.id
    const current = bestByGroup.get(group)

    if (current === undefined || (rule.priority ?? 0) > (current.priority ?? 0)) {
      bestByGroup.set(group, rule)
    }
  }

  return [...bestByGroup.values()]
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
    .slice(0, maxTotal)
    .map((rule) => rule.block)
}
