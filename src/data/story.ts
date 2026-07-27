import type { StoryChapter } from '../types/game'
import storyData from './story.json'
import { validateStoryData } from './validateStory'

/**
 * 剧情数据的唯一入口。
 *
 * 页面组件只通过这里读取章节，不直接遍历 story.json。
 * 章节映射在模块加载时构建一次，不在渲染中重复构建。
 */

const rawChapters: Record<string, unknown> = storyData.chapters

/** 开发期数据完整性检查结果；生产构建中恒为空数组。 */
export const storyDataErrors: readonly string[] = import.meta.env.DEV
  ? validateStoryData(rawChapters)
  : []

if (import.meta.env.DEV && storyDataErrors.length > 0) {
  console.error('[story] 剧情数据未通过完整性检查：')
  for (const message of storyDataErrors) {
    console.error(`[story] - ${message}`)
  }
}

// 结构已由 validateStoryData 在开发期覆盖，这里是整个项目中唯一一次断言 JSON 形状。
const chapters = rawChapters as Record<string, StoryChapter>

/** 按 order 排序的章节列表，供进度或调试使用。 */
export const chapterList: readonly StoryChapter[] = Object.values(chapters).sort(
  (a, b) => a.order - b.order,
)

/** 找不到章节时返回 undefined，由调用方决定如何提示，不静默回退到其他章节。 */
export function getChapterById(id: string): StoryChapter | undefined {
  return Object.prototype.hasOwnProperty.call(chapters, id) ? chapters[id] : undefined
}
