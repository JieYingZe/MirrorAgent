import type {
  ChoiceRecord,
  GameState,
  StatChanges,
  Stats,
  StoryChapter,
  StoryChoice,
} from '../types/game'
import { INITIAL_CHAPTER_ID, STAT_KEYS, createInitialStats } from '../data/initialGameState'

/**
 * 游戏状态的纯函数集合。
 *
 * 所有函数都不修改传入对象，一律返回新的对象，页面组件不应自行计算变量。
 */

export function createInitialGameState(): GameState {
  return {
    currentChapterId: INITIAL_CHAPTER_ID,
    stats: createInitialStats(),
    choices: [],
    finalChoice: undefined,
    completed: false,
  }
}

/** 累加变量影响；未出现在 effects 中的变量保持原值，本阶段不做上下限截断。 */
export function applyStatChanges(stats: Stats, effects: StatChanges): Stats {
  const next = { ...stats }

  for (const key of STAT_KEYS) {
    const delta = effects[key]
    if (delta !== undefined) {
      next[key] = next[key] + delta
    }
  }

  return next
}

export function createChoiceRecord(chapter: StoryChapter, choice: StoryChoice): ChoiceRecord {
  return {
    chapterId: chapter.id,
    choiceId: choice.id,
    choiceText: choice.text,
    effects: { ...choice.effects },
  }
}

/**
 * 应用一次选择：累计变量、追加选择记录、推进章节。
 *
 * 结束选项不再推进 currentChapterId，只把 completed 置为 true。
 * 调用方需要先确认 nextChapterId 有效，本函数不负责校验数据。
 */
export function applyChoice(
  state: GameState,
  chapter: StoryChapter,
  choice: StoryChoice,
): GameState {
  const endsGame = choice.endsGame === true

  return {
    currentChapterId: endsGame
      ? state.currentChapterId
      : (choice.nextChapterId ?? state.currentChapterId),
    stats: applyStatChanges(state.stats, choice.effects),
    choices: [...state.choices, createChoiceRecord(chapter, choice)],
    finalChoice: choice.finalChoice ?? state.finalChoice,
    completed: endsGame ? true : state.completed,
  }
}
