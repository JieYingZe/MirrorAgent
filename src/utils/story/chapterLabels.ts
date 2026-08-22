import type { StoryChapterMeta } from '../../types/story'

/**
 * 章节顶部标签。
 *
 * 只根据章节元信息推导，不针对具体节点 ID 做特判。
 *
 * 这里曾经还有一个 getChapterProgressLabel()，在顶栏显示 `01 / 04` 这样的进度。
 * 它读的是节点上的 progress（没有时退回「第几章 / 共几章」），而剧情是分支图，
 * 不同路径经过的节点数不一样，那个分母本来就说不准，玩家看到的数字经常对不上。
 * 顶栏已经有章节标记与章节标题，进度这一项去掉之后没有信息损失。
 */

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

export function getChapterPhaseLabel(chapter: StoryChapterMeta): string {
  return chapter.order === 0
    ? `PROLOGUE / ${chapter.shortTitle}`
    : `CHAPTER ${pad2(chapter.order)} / ${chapter.shortTitle}`
}
