import type {
  StoryBlock,
  StoryChoice,
  StoryNode,
  StoryNodeId,
  StoryState,
} from '../../types/story'
import { resolveRoute } from './resolveRoute'
import { getVisibleBlocks } from './getVisibleBlocks'
import { applyStatChanges, markVisited, mergeTags } from './storyState'

export type ApplyChoiceResult = {
  /** 事务完成后的完整状态，currentNodeId 已经推进到 next。 */
  state: StoryState
  /** 事务开始时所在的节点，用于在显示选项专属 response 时继续停留在原文。 */
  previousNodeId: StoryNodeId
  /** 已按新状态过滤过的选项专属回应；为空表示直接进入下一节点。 */
  response: StoryBlock[]
}

/**
 * 应用一次选择。
 *
 * 严格按照一次一致的状态事务处理：
 *
 *   应用 stats → 写入 tags / flags → 追加 choiceHistory → 写入 finalChoice → 基于新状态解析 next
 *
 * next 必须在新状态上解析，否则“刚刚选择的这一项”无法影响自己的条件路由。
 * 目标节点是否存在由调用方检查，这里不做兜底跳转。
 */
export function applyChoice(
  state: StoryState,
  node: StoryNode,
  choice: StoryChoice,
  selectedAt: Date = new Date(),
): ApplyChoiceResult {
  const effects = choice.effects

  const stats = applyStatChanges(state.stats, effects?.stats)
  const tags = mergeTags(state.tags, effects?.addTags)
  const flags = { ...state.flags, ...(effects?.setFlags ?? {}) }

  const choiceHistory = [
    ...state.choiceHistory,
    {
      choiceId: choice.id,
      nodeId: node.id,
      chapterId: node.chapterId,
      choiceType: choice.type,
      selectedAt: selectedAt.toISOString(),
    },
  ]

  const finalChoice = effects?.finalChoice ?? state.finalChoice

  const resolvedState: StoryState = {
    ...state,
    stats,
    tags,
    flags,
    choiceHistory,
    finalChoice,
  }

  const nextNodeId = resolveRoute(choice.next, resolvedState)

  const nextState: StoryState = {
    ...resolvedState,
    currentNodeId: nextNodeId,
    visitedNodeIds: markVisited(state.visitedNodeIds, nextNodeId),
  }

  return {
    state: nextState,
    previousNodeId: node.id,
    response: getVisibleBlocks(choice.response, nextState),
  }
}

/** 无选项节点的“继续”，同样在当前状态上解析路由。 */
export function advanceToNext(state: StoryState, node: StoryNode): StoryState | undefined {
  if (node.next === undefined) return undefined

  const nextNodeId = resolveRoute(node.next, state)

  return {
    ...state,
    currentNodeId: nextNodeId,
    visitedNodeIds: markVisited(state.visitedNodeIds, nextNodeId),
  }
}
