import type { StoryChoice, StoryNode, StoryState } from '../../src/types/story'
import { advanceToNext, applyChoice } from '../../src/utils/story/applyChoice'
import { getStoryNode } from '../../src/utils/story/getStoryNode'
import { getVisibleChoices } from '../../src/utils/story/getVisibleBlocks'
import { createInitialStoryState } from '../../src/utils/story/storyState'

/**
 * 在正式剧情图上真的走一遍。
 *
 * 结局规则的单元测试可以直接构造状态，但「某条前置路径最终会通向哪个结局」
 * 这类断言必须走真实数据：只有这样，章节里改动一个关键选项的变量值，
 * 测试才会跟着失败，而不是继续验证一份手写的假状态。
 *
 * 选路方式：
 * - `picks` 里列出真正想要的关键选项，按顺序消费，走到哪个节点可见就选哪个；
 * - 其余节点统一取 `fallbackIndex` 指定的那一项，让路线保持确定；
 * - 需要在某个节点停下来单独检查时，用 `stopAtNodeId`。
 */
export type PlaythroughOptions = {
  picks?: readonly string[]
  fallbackIndex?: number
  stopAtNodeId?: string
}

export type Playthrough = {
  state: StoryState
  /** 依次经过的节点 ID，用于断言路由走向。 */
  visited: string[]
  /** 依次选中的选项 ID。 */
  picked: string[]
  /** 停下时所在的节点。 */
  node: StoryNode
}

const FIXED_TIMESTAMP = new Date('2026-08-22T00:00:00.000Z')
const MAX_STEPS = 200

function pickChoice(
  choices: StoryChoice[],
  wanted: Set<string>,
  fallbackIndex: number,
  nodeId: string,
): StoryChoice {
  const preferred = choices.find((choice) => wanted.has(choice.id))

  if (preferred) return preferred

  const fallback = choices[Math.min(fallbackIndex, choices.length - 1)]

  if (!fallback) throw new Error(`节点 ${nodeId} 没有可选的选项。`)

  return fallback
}

export function playStory(options: PlaythroughOptions = {}): Playthrough {
  const wanted = new Set(options.picks ?? [])
  const fallbackIndex = options.fallbackIndex ?? 0

  let state = createInitialStoryState()
  const visited: string[] = [state.currentNodeId]
  const picked: string[] = []

  for (let step = 0; step < MAX_STEPS; step += 1) {
    const node = getStoryNode(state.currentNodeId)

    if (!node) throw new Error(`找不到节点：${state.currentNodeId}。`)

    if (node.id === options.stopAtNodeId || node.role === 'ending_gate') {
      return { state, visited, picked, node }
    }

    const choices = getVisibleChoices(node.choices, state)
    let next: StoryState | undefined

    if (choices.length > 0) {
      const choice = pickChoice(choices, wanted, fallbackIndex, node.id)

      wanted.delete(choice.id)
      picked.push(choice.id)
      next = applyChoice(state, node, choice, FIXED_TIMESTAMP).state
    } else {
      next = advanceToNext(state, node)
    }

    if (!next) throw new Error(`节点 ${node.id} 无法继续。`)

    state = next
    visited.push(state.currentNodeId)
  }

  throw new Error(`走了 ${MAX_STEPS} 步仍未结束，剧情图可能存在循环。`)
}

/** 在已经走到的节点上再应用一次指定选择，用于单独检查某个选项的效果。 */
export function applyChoiceById(state: StoryState, node: StoryNode, choiceId: string) {
  const choice = node.choices?.find((candidate) => candidate.id === choiceId)

  if (!choice) throw new Error(`节点 ${node.id} 上没有选项 ${choiceId}。`)

  return { choice, result: applyChoice(state, node, choice, FIXED_TIMESTAMP) }
}
