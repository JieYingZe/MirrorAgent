import type { ChapterId, StoryChapterMeta, StoryNode, StoryNodeId } from '../../types/story'
import { chapterMetaIndex, nodeIndex } from '../../data/story'

/** 找不到节点时返回 undefined，由调用方决定如何提示，不静默回退到其他节点。 */
export function getStoryNode(nodeId: StoryNodeId): StoryNode | undefined {
  return nodeIndex.get(nodeId)
}

/** 视觉章节由节点的 chapterId 推导，节点 ID 不直接出现在界面上。 */
export function getChapterMeta(chapterId: ChapterId): StoryChapterMeta | undefined {
  return chapterMetaIndex.get(chapterId)
}
