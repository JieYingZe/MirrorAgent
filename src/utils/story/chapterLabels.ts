import type { StoryChapterMeta, StoryNode } from '../../types/story'
import { chapterMetaList } from '../../data/story'

/**
 * 章节顶部标签。
 *
 * 只根据章节元信息和节点的 progress 推导，不针对具体节点 ID 做特判。
 */

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

export function getChapterPhaseLabel(chapter: StoryChapterMeta): string {
  return chapter.order === 0
    ? `PROLOGUE / ${chapter.shortTitle}`
    : `CHAPTER ${pad2(chapter.order)} / ${chapter.shortTitle}`
}

/** 优先显示节点内部进度，没有时退回“第几章 / 共几章”。 */
export function getChapterProgressLabel(chapter: StoryChapterMeta, node: StoryNode): string {
  if (node.progress) {
    return `${pad2(node.progress.current)} / ${pad2(node.progress.total)}`
  }

  return `${pad2(chapter.order + 1)} / ${pad2(chapterMetaList.length)}`
}
