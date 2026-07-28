/** 四个核心隐藏变量。不要在这里加入其他字段。 */
export type StatKey = 'gentleness' | 'honesty' | 'control' | 'selfAcceptance'

export type Stats = Record<StatKey, number>

/** 单个选项对变量的影响，未出现的变量保持原值。 */
export type StatChanges = Partial<Record<StatKey, number>>

/** 第五章最终选择，决定结局叙事方向。 */
export type FinalChoice = 'close_agent' | 'ask_identity' | 'permanent_agent' | 'tool_only'

/**
 * 剧情节点、文本块、条件与结局的类型都在 `src/types/story.ts`。
 * 本文件只保留变量与最终选择这类跨模块共享的基础定义，避免出现两套同义类型。
 */
