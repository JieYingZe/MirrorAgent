import type { StoryNodeId, StoryRoute, StoryState } from '../../types/story'
import { evaluateCondition } from './evaluateCondition'

/**
 * 解析路由目标。
 *
 * 简单路由直接返回节点 ID；条件路由按声明顺序取第一条满足条件的分支，
 * 全部不满足时返回 fallback，因此这个函数总能给出一个目标。
 * 目标节点是否真实存在由调用方检查，本函数不做兜底跳转。
 */
export function resolveRoute(route: StoryRoute, state: StoryState): StoryNodeId {
  if (typeof route === 'string') {
    return route
  }

  for (const branch of route.cases) {
    if (evaluateCondition(branch.when, state)) {
      return branch.nodeId
    }
  }

  return route.fallback
}

/** 路由静态可能到达的全部目标，供验证脚本做图分析。 */
export function listRouteTargets(route: StoryRoute): StoryNodeId[] {
  if (typeof route === 'string') {
    return [route]
  }

  return [...route.cases.map((branch) => branch.nodeId), route.fallback]
}
