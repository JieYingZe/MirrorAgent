/** 四个核心隐藏变量。不要在这里加入其他字段。 */
export type StatKey = 'gentleness' | 'honesty' | 'control' | 'selfAcceptance'

export type Stats = Record<StatKey, number>

/** 单个选项对变量的影响，未出现的变量保持原值。 */
export type StatChanges = Partial<Record<StatKey, number>>

export type FinalChoice = 'close_agent' | 'ask_identity' | 'permanent_agent' | 'tool_only'

export type StoryChoice = {
  id: string
  text: string
  /** 可选的语气标签，例如“交给 AI”“保留边界”。 */
  label?: string
  effects: StatChanges
  nextChapterId?: string
  endsGame?: boolean
  finalChoice?: FinalChoice
}

export type StoryChapter = {
  id: string
  order: number
  phaseLabel: string
  progressLabel: string
  title: string
  paragraphs: string[]
  choices: StoryChoice[]
}

export type ChoiceRecord = {
  chapterId: string
  choiceId: string
  choiceText: string
  effects: StatChanges
}

export type GameState = {
  currentChapterId: string
  stats: Stats
  choices: ChoiceRecord[]
  finalChoice?: FinalChoice
  completed: boolean
}
