import type { StatChanges, Stats } from '../../types/game'
import type { StoryNodeId, StoryState } from '../../types/story'
import { STAT_KEYS, createInitialStats } from '../../data/initialGameState'
import { storyManifest } from '../../data/story'

/**
 * 运行状态的纯函数集合。
 *
 * 所有函数都不修改传入对象，一律返回新对象；页面组件不应自行计算变量。
 * 本阶段状态只存在于内存中，但结构必须保持可序列化，
 * schemaVersion 为以后的 localStorage 存档迁移预留（I03）。
 */

export function createInitialStoryState(): StoryState {
  return {
    schemaVersion: 2,
    currentNodeId: storyManifest.startNodeId,
    stats: createInitialStats(),
    choiceHistory: [],
    tags: [],
    flags: {},
    finalChoice: undefined,
    visitedNodeIds: [storyManifest.startNodeId],
    completed: false,
  }
}

/** 累加变量影响；未出现在 changes 中的变量保持原值，不做上下限截断。 */
export function applyStatChanges(stats: Stats, changes: StatChanges | undefined): Stats {
  if (!changes) return { ...stats }

  const next = { ...stats }

  for (const key of STAT_KEYS) {
    const delta = changes[key]
    if (delta !== undefined) {
      next[key] = next[key] + delta
    }
  }

  return next
}

/** 标签去重，保持首次出现顺序。 */
export function mergeTags(tags: readonly string[], added: readonly string[] | undefined): string[] {
  if (!added || added.length === 0) return [...tags]

  const merged = [...tags]

  for (const tag of added) {
    if (!merged.includes(tag)) {
      merged.push(tag)
    }
  }

  return merged
}

/** 访问过的节点 ID 去重，保持首次访问顺序。 */
export function markVisited(visited: readonly string[], nodeId: StoryNodeId): StoryNodeId[] {
  return visited.includes(nodeId) ? [...visited] : [...visited, nodeId]
}
