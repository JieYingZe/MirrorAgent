/** 四个核心隐藏变量。不要在这里加入其他字段。 */
export type StatKey = 'gentleness' | 'honesty' | 'control' | 'selfAcceptance'

export type Stats = Record<StatKey, number>

/** 单个选项对变量的影响，未出现的变量保持原值。 */
export type StatChanges = Partial<Record<StatKey, number>>

/**
 * 第五章真正的最终行为。
 *
 * 只有三个值：它们决定「玩家最后做了什么」，不决定「这件事最终意味着什么」。
 * 后者由此前累计的四变量、强授权历史与边界收回记录决定，
 * 规则见 story-source/08-ending-rules.md。
 *
 * 三个最终行为都不修改四变量：最后一次点击只记录行为，不再补一笔画像。
 *
 * 「在关闭以前，告诉我：你到底是谁？」不在这里 —— 它是一次 key 选择，
 * 只记录选择、标签与 flag，之后要么进入镜像困局，
 * 要么把最终选择权原样交还给玩家。
 */
export type FinalChoice = 'permanent_agent' | 'tool_only' | 'close_agent'

/**
 * 剧情节点、文本块、条件与结局的类型都在 `src/types/story.ts`。
 * 本文件只保留变量与最终选择这类跨模块共享的基础定义，避免出现两套同义类型。
 */
