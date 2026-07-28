import type { StoryChapter } from '../../../types/story'
import { prologue } from './prologue'
import { chapter1 } from './chapter1'
import { chapter2 } from './chapter2'
import { chapter3 } from './chapter3'
import { chapter4 } from './chapter4'
import { chapter5 } from './chapter5'

/** 章节数据按叙事顺序排列；顺序与 manifest.chapters 一致由验证脚本保证。 */
export const storyChapters: readonly StoryChapter[] = [
  prologue,
  chapter1,
  chapter2,
  chapter3,
  chapter4,
  chapter5,
]
