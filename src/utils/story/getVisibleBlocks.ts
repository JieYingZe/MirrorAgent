import type {
  ConditionalBlockGroup,
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

/* 路径回声的选择逻辑见 ./selectEndingPathEchoes.ts，不在这里重复实现。 */
