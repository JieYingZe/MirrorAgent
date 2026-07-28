import type { FinalChoice, StatKey, Stats } from './game'

/**
 * 节点式剧情引擎的全部数据类型。
 *
 * 对应规范：docs/06-story-ending-data-format.md。
 * 这里只描述数据形状，不包含任何运行逻辑；运行逻辑一律放在 src/utils/story/。
 *
 * 约束：
 * - 章节与结局数据文件必须是纯声明式对象，用 `satisfies` 做类型检查；
 * - 数据文件里不允许出现 React 元素、条件函数或状态修改函数；
 * - 所有条件判断统一使用 StoryCondition。
 */

export type ChapterId = string
export type StoryNodeId = string
export type StoryChoiceId = string

/** 与 types/game.ts 的 FinalChoice 是同一套值，这里只是规范文档使用的别名。 */
export type FinalChoiceId = FinalChoice

export type EndingId =
  | 'soft_illusion'
  | 'cruel_optimization'
  | 'symbiosis'
  | 'active_disconnection'
  | 'mirror_trap'

/** flags 只保存少量可序列化的标记，不保存对象或数组。 */
export type FlagValue = boolean | string | number

// ---------------------------------------------------------------------------
// 条件表达式
// ---------------------------------------------------------------------------

export type StoryCondition =
  | { op: 'all'; conditions: StoryCondition[] }
  | { op: 'any'; conditions: StoryCondition[] }
  | { op: 'not'; condition: StoryCondition }
  | { op: 'stat'; stat: StatKey; gte?: number; lte?: number; eq?: number }
  | { op: 'hasChoice'; choiceId: StoryChoiceId }
  | { op: 'choiceCount'; choiceIds: StoryChoiceId[]; gte?: number; lte?: number }
  | { op: 'hasTag'; tag: string }
  | { op: 'flag'; key: string; equals: FlagValue }
  | { op: 'finalChoice'; equals: FinalChoiceId }

export type StoryConditionOp = StoryCondition['op']

// ---------------------------------------------------------------------------
// 文本块
// ---------------------------------------------------------------------------

export type BaseBlock = {
  id?: string
  /** 条件不满足的块不渲染，也不留空白占位。 */
  when?: StoryCondition
  /** 打字机节奏提示，本阶段不消费，保留给 I01。 */
  pacing?: 'normal' | 'slow' | 'instant'
  emphasis?: 'normal' | 'muted' | 'strong' | 'warning'
}

export type NarrationBlock = BaseBlock & {
  kind: 'narration'
  text: string
}

export type DialogueBlock = BaseBlock & {
  kind: 'dialogue'
  speaker: 'agent' | 'player' | 'other'
  speakerLabel?: string
  text: string
  delivery?: 'calm' | 'direct' | 'soft' | 'warning'
}

export type SystemBlock = BaseBlock & {
  kind: 'system'
  variant: 'status' | 'warning' | 'permission' | 'result'
  title?: string
  lines: Array<{
    label?: string
    value: string
  }>
}

export type RecordBlock = BaseBlock & {
  kind: 'record'
  recordType: 'mirror' | 'incident' | 'audit' | 'permission' | 'internal'
  title?: string
  paragraphs?: string[]
  entries?: Array<{
    label: string
    value: string | string[]
  }>
}

export type MessageBlock = BaseBlock & {
  kind: 'message'
  sender: string
  timestamp?: string
  paragraphs: string[]
  status?: 'draft' | 'sent' | 'delivered' | 'read' | 'unsent'
  side?: 'self' | 'other' | 'neutral'
}

export type DocumentBlock = BaseBlock & {
  kind: 'document'
  documentType: 'file' | 'draft' | 'proposal' | 'profile' | 'report'
  title?: string
  sections: Array<{
    heading?: string
    lines: string[]
  }>
}

export type QuoteBlock = BaseBlock & {
  kind: 'quote'
  text: string
}

export type DividerBlock = BaseBlock & {
  kind: 'divider'
  label?: string
}

export type StoryBlock =
  | NarrationBlock
  | DialogueBlock
  | SystemBlock
  | RecordBlock
  | MessageBlock
  | DocumentBlock
  | QuoteBlock
  | DividerBlock

export type StoryBlockKind = StoryBlock['kind']

/** 一组带条件的文本块，用于结局衔接和报告变体。 */
export type ConditionalBlockGroup = {
  id: string
  when: StoryCondition
  blocks: StoryBlock[]
}

// ---------------------------------------------------------------------------
// 路由、选择与节点
// ---------------------------------------------------------------------------

export type StoryRoute =
  | StoryNodeId
  | {
      cases: Array<{
        when: StoryCondition
        nodeId: StoryNodeId
      }>
      /** 条件路由必须提供兜底目标，运行时不允许无处可去。 */
      fallback: StoryNodeId
    }

export type ChoiceEffects = {
  stats?: Partial<Record<StatKey, number>>
  addTags?: string[]
  setFlags?: Record<string, FlagValue>
  /** 只允许出现在 type 为 final 的选择上。 */
  finalChoice?: FinalChoiceId
}

export type StoryChoiceType = 'roleplay' | 'exploration' | 'key' | 'final'

export type ChoiceUiHints = {
  emphasis?: 'normal' | 'primary' | 'danger'
  confirm?: boolean
}

export type StoryChoice = {
  id: StoryChoiceId
  type: StoryChoiceType
  text: string
  label?: string
  effects?: ChoiceEffects
  /** 选项专属短回应，显示后由玩家点击继续再进入 next。 */
  response?: StoryBlock[]
  next: StoryRoute
  when?: StoryCondition
  ui?: ChoiceUiHints
}

export type NodeUiHints = {
  mode?: 'normal' | 'control' | 'ending'
  hideStatusPanel?: boolean
  reduceChoices?: boolean
  transition?: 'normal' | 'slow' | 'abrupt'
}

export type StoryNodeRole = 'scene' | 'branch' | 'merge' | 'ending_gate'

export type StoryNode = {
  id: StoryNodeId
  chapterId: ChapterId
  role: StoryNodeRole
  sectionTitle?: string
  progress?: {
    current: number
    total: number
  }
  blocks: StoryBlock[]
  choices?: StoryChoice[]
  /** 没有 choices 时的“继续”目标。 */
  next?: StoryRoute
  ui?: NodeUiHints
}

export type StoryChapter = {
  id: ChapterId
  title: string
  entryNodeId: StoryNodeId
  nodes: Record<StoryNodeId, StoryNode>
  metadata?: {
    expectedChoiceNodes?: number
    notes?: string[]
  }
}

// ---------------------------------------------------------------------------
// 全局清单
// ---------------------------------------------------------------------------

export type StoryChapterMeta = {
  id: ChapterId
  order: number
  title: string
  shortTitle: string
  entryNodeId: StoryNodeId
  /** 只保存资源键，具体路径由视觉层决定（V02）。 */
  backgroundKey: string
  musicKey: string
}

export type StoryManifest = {
  schemaVersion: 2
  startNodeId: StoryNodeId
  chapters: StoryChapterMeta[]
}

// ---------------------------------------------------------------------------
// 运行状态
// ---------------------------------------------------------------------------

export type ChoiceRecord = {
  choiceId: StoryChoiceId
  nodeId: StoryNodeId
  chapterId: ChapterId
  choiceType: StoryChoiceType
  selectedAt: string
}

/**
 * 运行进度。本阶段只存在于内存中，但必须保持可序列化，
 * schemaVersion 为以后的 localStorage 存档迁移预留（I03）。
 */
export type StoryState = {
  schemaVersion: 2
  currentNodeId: StoryNodeId
  stats: Stats
  choiceHistory: ChoiceRecord[]
  tags: string[]
  flags: Record<string, FlagValue>
  visitedNodeIds: StoryNodeId[]
  finalChoice?: FinalChoiceId
  completed: boolean
}

// ---------------------------------------------------------------------------
// 结局
// ---------------------------------------------------------------------------

export type EndingEchoRule = {
  id: string
  when: StoryCondition
  block: StoryBlock
  priority?: number
  group?: ChapterId
}

export type EndingDefinition = {
  id: EndingId
  title: string
  subtitle?: string

  /** 同一结局由不同最终选择进入时的衔接文本。 */
  preludeVariants?: ConditionalBlockGroup[]
  body: StoryBlock[]

  report: {
    title?: string
    statusLines: Array<{
      label: string
      value: string
    }>
    paragraphs: StoryBlock[]
    variants?: ConditionalBlockGroup[]
  }

  pathEchoes?: EndingEchoRule[]
  finalLine: StoryBlock[]
  metadata?: {
    hidden?: boolean
  }
}

export type EndingRule = {
  id: string
  priority: number
  endingId: EndingId
  when: StoryCondition
}

export type EndingRateMap = {
  version: string
  source: 'structural_estimate' | 'observed_global' | 'observed_local'
  method: string
  sampleSize?: number
  /** 原始数据使用 0–1 小数，UI 层再格式化为百分数。 */
  rates: Record<EndingId, number>
}
