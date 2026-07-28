import type {
  ChapterId,
  StoryChapter,
  StoryChapterMeta,
  StoryNode,
  StoryNodeId,
} from '../../types/story'
import { storyManifest } from './manifest'
import { storyChapters } from './chapters'

/**
 * 剧情数据的唯一入口。
 *
 * 页面和引擎只从这里读取节点与章节元信息，不直接遍历各章节文件。
 * 索引在模块加载时构建一次，不在渲染中重复构建。
 *
 * 这里只负责“把声明式数据整理成可查表”，不做完整性校验。
 * 重复 ID、断链、死路等问题由 npm run validate:story 负责。
 */

function buildNodeIndex(chapters: readonly StoryChapter[]): Map<StoryNodeId, StoryNode> {
  const index = new Map<StoryNodeId, StoryNode>()

  for (const chapter of chapters) {
    for (const node of Object.values(chapter.nodes)) {
      // 重复 ID 会被后写入的节点覆盖，这属于数据错误，由验证脚本报出。
      index.set(node.id, node)
    }
  }

  return index
}

function buildChapterMetaIndex(
  chapters: readonly StoryChapterMeta[],
): Map<ChapterId, StoryChapterMeta> {
  return new Map(chapters.map((chapter) => [chapter.id, chapter]))
}

export const nodeIndex: ReadonlyMap<StoryNodeId, StoryNode> = buildNodeIndex(storyChapters)

export const chapterMetaIndex: ReadonlyMap<ChapterId, StoryChapterMeta> = buildChapterMetaIndex(
  storyManifest.chapters,
)

/** 按 order 排序的章节元信息，供顶部标题与进度显示使用。 */
export const chapterMetaList: readonly StoryChapterMeta[] = [...storyManifest.chapters].sort(
  (a, b) => a.order - b.order,
)

export { storyManifest } from './manifest'
export { storyChapters } from './chapters'
export { endings, endingIds, endingManifest, pathEchoes } from './endings'
export {
  endingRules,
  endingFallbackRules,
  DEFAULT_FALLBACK_ENDING_ID,
  FALLBACK_ALLOWED_ENDING_IDS,
  STRONG_DELEGATION_CHOICE_IDS,
} from './rules/endingRules'
export { endingRates } from './rules/endingRates'
