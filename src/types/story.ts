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

/**
 * 结局家族。
 *
 * 家族只是正文容器：它保存一整段结局叙事与共用的镜像报告。
 * 玩家真正看到的标题、副标题与状态摘要来自变体（EndingVariantId），
 * 一个家族可以带多个变体，避免为了几段差异复制整篇正文。
 */
export type EndingId =
  | 'mirror_trap'
  | 'soft_illusion'
  | 'cruel_optimization'
  | 'silent_delegation'
  | 'symbiosis'
  | 'active_disconnection'

/**
 * 玩家可见结局，共 11 个。
 *
 * 每次结局判断都恰好命中一个变体：单结果家族的变体 ID 与家族 ID 同名，
 * 工具模式家族有 4 个，永久关闭家族有 3 个。
 * 触发条件全部在 src/data/story/rules/endingRules.ts，变体本身不带条件。
 */
export type EndingVariantId =
  | 'mirror_trap'
  | 'soft_illusion'
  | 'cruel_optimization'
  | 'silent_delegation'
  | 'symbiosis_stable_boundary'
  | 'symbiosis_rebuilt_boundary'
  | 'symbiosis_cautious'
  | 'symbiosis_fragile_boundary'
  | 'disconnection_active'
  | 'disconnection_hard_extraction'
  | 'disconnection_shallow'

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
  /**
   * 阅读节奏提示（I01）。
   *
   * `slow` 放慢逐字速度，`instant` 让整块立即显示。
   * 消费点在 utils/story/readingPlan.ts，只影响展示层。
   */
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
  schemaVersion: 3
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
 * schemaVersion 用于让不兼容的旧存档安全失效（I03）。
 *
 * v2 → v3：FinalChoice 去掉了 `ask_identity`，第五章增加了身份回答与第二次确认，
 * 结局从 5 个家族改为 6 家族 11 变体。v2 存档按新规则重新推导会得到错误结果，
 * 因此一律作废重置，不做迁移。
 */
export type StoryState = {
  schemaVersion: 3
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

export type EndingStatusLine = {
  label: string
  value: string
}

/**
 * 玩家可见结局。
 *
 * 变体只保存内容，不保存条件：命中哪一个由结局规则决定（EndingRule.variantId），
 * 这样「规则」与「正文」仍然只有一个真相来源。
 *
 * 省略的字段沿用家族默认值，只有真正需要区分的部分才写在变体里。
 */
export type EndingVariant = {
  id: EndingVariantId
  title: string
  subtitle: string
  /** 覆盖家族的状态摘要；省略时沿用 report.statusLines。 */
  statusLines?: EndingStatusLine[]
  /** 变体专属衔接，排在家族正文以前。 */
  prelude?: StoryBlock[]
  /** 变体专属报告段落，排在家族报告段落以后。 */
  report?: StoryBlock[]
  /** 覆盖家族的收尾句；省略时沿用 finalLine。 */
  finalLine?: StoryBlock[]
}

export type EndingDefinition = {
  id: EndingId
  /** 至少一个变体；单结果家族只写一个，ID 与家族 ID 同名。 */
  variants: EndingVariant[]

  /** 与最终行为无关的共同衔接，例如「先问过身份再回来确认」。 */
  preludeVariants?: ConditionalBlockGroup[]
  body: StoryBlock[]

  report: {
    title?: string
    statusLines: EndingStatusLine[]
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
  /** 命中这条规则时玩家看到的可见结局，必须属于 endingId 这个家族。 */
  variantId: EndingVariantId
  when: StoryCondition
}

export type EndingRateMap = {
  version: string
  source: 'structural_estimate' | 'observed_global' | 'observed_local'
  method: string
  sampleSize?: number
  /**
   * 按玩家可见结局保存，不按家族：玩家看到的是变体标题。
   * 原始数据使用 0–1 小数，UI 层再格式化为百分数。
   */
  rates: Record<EndingVariantId, number>
}
