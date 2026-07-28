import type { StoryCondition, StoryState } from '../../types/story'

/**
 * 声明式条件求值。
 *
 * 章节回调文本、选项可见性、路由分支和结局规则共用这一套实现，
 * 数据文件里不允许出现 `state => ...` 这样的函数。
 */
export function evaluateCondition(condition: StoryCondition, state: StoryState): boolean {
  switch (condition.op) {
    case 'all':
      return condition.conditions.every((child) => evaluateCondition(child, state))

    case 'any':
      return condition.conditions.some((child) => evaluateCondition(child, state))

    case 'not':
      return !evaluateCondition(condition.condition, state)

    case 'stat': {
      const value = state.stats[condition.stat]

      if (condition.eq !== undefined && value !== condition.eq) return false
      if (condition.gte !== undefined && value < condition.gte) return false
      if (condition.lte !== undefined && value > condition.lte) return false

      return true
    }

    case 'hasChoice':
      return state.choiceHistory.some((record) => record.choiceId === condition.choiceId)

    case 'choiceCount': {
      // 同一个选择 ID 只计一次，避免重复记录放大强授权次数。
      const selected = new Set(state.choiceHistory.map((record) => record.choiceId))
      const count = condition.choiceIds.filter((id) => selected.has(id)).length

      if (condition.gte !== undefined && count < condition.gte) return false
      if (condition.lte !== undefined && count > condition.lte) return false

      return true
    }

    case 'hasTag':
      return state.tags.includes(condition.tag)

    case 'flag':
      return state.flags[condition.key] === condition.equals

    case 'finalChoice':
      return state.finalChoice === condition.equals
  }
}
