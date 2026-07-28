import type { StoryNode, StoryState } from '../../types/story'
import { getVisibleChoices } from './getVisibleBlocks'
import { resolveRoute } from './resolveRoute'
import { getStoryNode } from './getStoryNode'

/**
 * 运行时节点自检。
 *
 * 返回 undefined 表示节点可以正常渲染，否则返回一条面向开发者的描述，
 * 由页面转成统一的“实验数据损坏”状态。这里不做任何自动修复。
 */
export function describeNodeIssue(node: StoryNode, state: StoryState): string | undefined {
  const visibleChoices = getVisibleChoices(node.choices, state)

  if (visibleChoices.length > 0) {
    for (const choice of visibleChoices) {
      const targetId = resolveRoute(choice.next, state)

      if (getStoryNode(targetId) === undefined) {
        return `选项 ${choice.id} 指向的节点不存在：${targetId}。`
      }
    }

    return undefined
  }

  if (node.next !== undefined) {
    const targetId = resolveRoute(node.next, state)

    if (getStoryNode(targetId) === undefined) {
      return `节点 ${node.id} 的 next 指向不存在的节点：${targetId}。`
    }

    return undefined
  }

  if (node.role === 'ending_gate') {
    return undefined
  }

  return `节点 ${node.id} 既没有可用选项，也没有 next，且不是结局门。`
}
