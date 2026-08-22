# 《镜中代理》剧情与结局数据格式设计

版本：v0.2  
建议文件名：`docs/06-story-ending-data-format.md`  
用途：定义正式剧情、局部分支、文本渲染、结局内容与结局判断的数据组织方式。本文档只描述格式和运行规则，不包含正式剧情全文。

更新：2026-08-22 结局改为「6 个家族 + 11 个玩家可见变体」，`EndingRule` 增加 `variantId`，存档 `schemaVersion` 升到 3。

---

## 1. 设计目标

新的剧情数据结构需要支持：

- 序章、五个正式章节与六个结局家族分文件维护；
- 每章包含多个选择节点，而不是每章只有一次选择；
- 区分扮演／语气、信息探索、关键剧情和最终选择；
- 扮演选择短暂分流后立即回到主线；
- 信息探索可展开额外内容，也可跳过；
- 关键选择进入不同的局部剧情分支，并在本章末或下一章初汇合；
- 根据过去选择显示不同的回调文本；
- 区分旁白、AI 对话、玩家对白、聊天消息、系统日志、文件、镜像记录等内容，以便采用不同 UI 渲染；
- 四变量、关键选择记录、权限状态和 `finalChoice` 共同影响结局；
- 剧情文件保持声明式，不在数据文件中编写 React 组件或任意业务函数；
- 可以通过 TypeScript 类型检查和独立验证脚本发现无效节点、死路和错误结局规则。

---

## 2. 推荐格式：TypeScript 数据模块

### 2.1 为什么不再推荐单个 `story.json`

正式剧情已经包含大量长文本、多级分支、条件回调和结局变体。继续使用一个大型 JSON 会产生以下问题：

- 文件过长，查找和修改困难；
- 多行文本需要大量 `\n` 和转义字符；
- JSON 不支持注释；
- 字段写错只能在运行时发现；
- 多人或多轮 AI 修改时容易产生大面积冲突；
- 一个逗号或引号错误可能导致整份剧情无法加载。

### 2.2 推荐方案

使用 `.ts` 文件保存纯数据对象：

```ts
export const chapter1 = {
  // 纯剧情数据
} satisfies StoryChapter
```

优点：

- 可以使用模板字符串编写多行文字；
- 可以添加必要注释；
- `satisfies StoryChapter` 能在构建时检查字段；
- 项目已经使用 TypeScript，不需要增加 YAML、JSON5 等解析依赖；
- 仍然保持数据驱动，页面组件不包含具体剧情；
- 后续需要多语言或外部编辑时，可以再导出为 JSON。

约束：

- 章节和结局文件中只允许数据对象；
- 不在章节文件中编写条件函数、状态修改函数或 React 元素；
- 所有条件判断使用统一的声明式条件格式；
- 所有运行逻辑由通用剧情引擎处理。

---

## 3. 推荐目录结构

```txt
src/
  data/
    story/
      index.ts
      manifest.ts

      chapters/
        prologue.ts
        chapter1.ts
        chapter2.ts
        chapter3.ts
        chapter4.ts
        chapter5.ts
        index.ts

      endings/
        softIllusion.ts
        cruelOptimization.ts
        silentDelegation.ts
        symbiosis.ts
        activeDisconnection.ts
        mirrorTrap.ts
        pathEchoes.ts
        manifest.ts
        index.ts

      rules/
        endingRules.ts
        endingRates.ts
        index.ts

  types/
    game.ts
    story.ts

  utils/
    story/
      applyChoice.ts
      chapterLabels.ts
      evaluateCondition.ts
      getEnding.ts
      getStoryNode.ts
      getVisibleBlocks.ts
      nodeIssue.ts
      resolveRoute.ts
      selectEndingPathEchoes.ts
      storyState.ts
      validateStory.ts
      index.ts

  components/
    story/
      StoryBlockRenderer.tsx
      TextBlocks.tsx
      PanelBlocks.tsx
      ChoiceList.tsx
```

职责划分：

- `chapters/`：正式章节内容和局部分支；
- `endings/`：六个结局家族的正文、镜像报告、玩家可见变体和跨结局共用的路径回声；
- `endings/manifest.ts`：结局标题与 hidden 标记的清单，与结局定义之间有一致性校验；
- `rules/endingRules.ts`：结局触发条件与安全兜底，不保存结局正文；
- `rules/endingRates.ts`：理论路径占比或未来真实达成率；
- `manifest.ts`：章节顺序、入口节点和视觉资源键；
- `types/game.ts`：`StatKey` / `Stats` / `FinalChoice` 这类跨模块基础定义；
- `types/story.ts`：节点、文本块、条件与结局的全部数据类型；
- `utils/story/`：统一运行逻辑，不含具体剧情文案。

文本块组件按渲染方式分组，而不是每种块一个文件：`TextBlocks.tsx` 负责 narration / dialogue / quote / divider，`PanelBlocks.tsx` 负责 system / record / message / document。

---

## 4. 全局剧情清单

`manifest.ts` 只保存章节级信息，不保存正文。

```ts
import type { StoryManifest } from '../../types/story'

export const storyManifest = {
  schemaVersion: 3,
  startNodeId: 'prologue.initialization',
  chapters: [
    {
      id: 'prologue',
      order: 0,
      title: '序章：创建你的代理',
      shortTitle: '创建你的代理',
      entryNodeId: 'prologue.initialization',
      backgroundKey: 'start',
      musicKey: 'main_theme',
    },
    {
      id: 'chapter_1',
      order: 1,
      title: '第一章：效率焦虑',
      shortTitle: '效率焦虑',
      entryNodeId: 'ch1.three_lists',
      backgroundKey: 'efficiency',
      musicKey: 'game_ambient',
    },
  ],
} satisfies StoryManifest
```

说明：

- `schemaVersion` 用于存档兼容；
- `startNodeId` 是整部游戏入口；
- `entryNodeId` 是视觉章节入口；
- 一个视觉章节可以包含多个剧情节点；
- `backgroundKey`、`musicKey` 只保存资源键，不直接硬编码路径；
- 第四章的节点数量增加，不会让 UI 显示成多个章节。

---

## 5. 章节文件结构

每个章节文件导出一个 `StoryChapter`。

```ts
import type { StoryChapter } from '../../../types/story'

export const chapter1 = {
  id: 'chapter_1',
  title: '第一章：效率焦虑',
  entryNodeId: 'ch1.three_lists',
  nodes: {
    'ch1.three_lists': {
      id: 'ch1.three_lists',
      chapterId: 'chapter_1',
      role: 'scene',
      blocks: [],
      choices: [],
    },
  },
} satisfies StoryChapter
```

### 5.1 章节字段

```ts
type StoryChapter = {
  id: ChapterId
  title: string
  entryNodeId: StoryNodeId
  nodes: Record<StoryNodeId, StoryNode>
  metadata?: {
    expectedChoiceNodes?: number
    notes?: string[]
  }
}
```

`metadata` 只用于开发和验证，不向玩家展示。

---

## 6. 剧情节点结构

剧情不再以“章节 = 一组段落 + 一组选项”表示，而是由多个节点组成一张有向图。

```ts
type StoryNode = {
  id: StoryNodeId
  chapterId: ChapterId
  role: 'scene' | 'branch' | 'merge' | 'ending_gate'
  sectionTitle?: string
  progress?: {
    current: number
    total: number
  }
  blocks: StoryBlock[]
  choices?: StoryChoice[]
  next?: StoryRoute
  ui?: NodeUiHints
}
```

字段说明：

- `role: scene`：普通主线节点；
- `role: branch`：关键选择后的独立分支；
- `role: merge`：多个分支汇合；
- `role: ending_gate`：第五章结束、进入结局判断；
- `blocks`：需要按顺序渲染的内容；
- `choices`：当前节点的玩家选项；
- `next`：没有选项时的“继续”目标；
- `progress`：可选，用于显示本章内部进度；
- `ui`：只保存必要的视觉提示，不保存 CSS。

### 6.1 无选项节点

关键分支常常需要展示一段独立结果，然后再汇合。此类节点不需要人为添加一个假选项。

```ts
{
  id: 'ch2.sent_result',
  chapterId: 'chapter_2',
  role: 'branch',
  blocks: [/* 分支结果 */],
  next: 'ch2.chapter_merge',
}
```

渲染器在节点没有 `choices`、但存在 `next` 时，显示统一的“继续”按钮。

不建议自动跳转，以免玩家来不及阅读。

---

## 7. 文本块类型

所有可显示内容统一为 `StoryBlock` 联合类型。组件根据 `kind` 选择不同渲染方式。

```ts
type StoryBlock =
  | NarrationBlock
  | DialogueBlock
  | SystemBlock
  | RecordBlock
  | MessageBlock
  | DocumentBlock
  | QuoteBlock
  | DividerBlock
```

所有文本块都可以包含：

```ts
type BaseBlock = {
  id?: string
  when?: StoryCondition
  pacing?: 'normal' | 'slow' | 'instant'
  emphasis?: 'normal' | 'muted' | 'strong' | 'warning'
}
```

`when` 用于根据过去选择或变量显示不同内容。

### 7.1 旁白 `narration`

用于环境、动作和玩家感受。

```ts
{
  kind: 'narration',
  text: `你把鼠标移向关闭按钮。\n按钮没有立即响应。`,
}
```

推荐渲染：

- 普通正文字体；
- 保持较大行高；
- 不使用聊天气泡；
- 模板字符串中的换行保留为段内换行。

### 7.2 对话 `dialogue`

用于 Mirror Agent、玩家或其他明确说话者。

```ts
{
  kind: 'dialogue',
  speaker: 'agent',
  text: '记录不是指控。',
}
```

```ts
{
  kind: 'dialogue',
  speaker: 'player',
  text: '你连这个都要记录？',
}
```

```ts
type DialogueBlock = BaseBlock & {
  kind: 'dialogue'
  speaker: 'agent' | 'player' | 'other'
  speakerLabel?: string
  text: string
  delivery?: 'calm' | 'direct' | 'soft' | 'warning'
}
```

推荐渲染：

- AI 对话使用系统标签或左侧细线；
- 玩家对白使用稍有区别的缩进或边框；
- 不做普通聊天软件式彩色气泡；
- `delivery` 只影响细微样式和打字速度。

### 7.3 系统状态 `system`

用于短系统提示、权限变更和状态通知。

```ts
{
  kind: 'system',
  variant: 'status',
  lines: [
    { label: '人格辅助', value: '全面启用' },
    { label: '自动执行', value: '开启' },
  ],
}
```

```ts
type SystemBlock = BaseBlock & {
  kind: 'system'
  variant: 'status' | 'warning' | 'permission' | 'result'
  title?: string
  lines: Array<{
    label?: string
    value: string
  }>
}
```

推荐渲染：

- 等宽字体；
- `warning` 可在第四章使用克制的警告色；
- 不把变量裸值放在这里；
- 适合显示“权限：代理倾向上升”等系统化结果。

### 7.4 文件／镜像记录 `record`

用于 `MIRROR RECORD`、`INCIDENT LOG`、权限审计和内部摘要。

```ts
{
  kind: 'record',
  recordType: 'mirror',
  title: 'MIRROR RECORD / 01',
  paragraphs: [
    '用户并不只是在拖延行动。',
    '用户也在保护一种可能性。',
  ],
}
```

```ts
type RecordBlock = BaseBlock & {
  kind: 'record'
  recordType:
    | 'mirror'
    | 'incident'
    | 'audit'
    | 'permission'
    | 'internal'
  title?: string
  paragraphs?: string[]
  entries?: Array<{
    label: string
    value: string | string[]
  }>
}
```

推荐渲染：

- 使用独立终端面板；
- 标题使用等宽字体；
- `mirror`、`incident`、`audit` 可有细微视觉差异；
- 不将其渲染成代码高亮区域。

### 7.5 聊天消息 `message`

用于第二章等现实聊天记录。

```ts
{
  kind: 'message',
  sender: '对方',
  timestamp: '十一天前 / 23:14',
  paragraphs: [
    '我最近有点乱。',
    '等我缓过来，再聊好吗？',
  ],
  status: 'read',
}
```

```ts
type MessageBlock = BaseBlock & {
  kind: 'message'
  sender: string
  timestamp?: string
  paragraphs: string[]
  status?: 'draft' | 'sent' | 'delivered' | 'read' | 'unsent'
  side?: 'self' | 'other' | 'neutral'
}
```

推荐渲染：

- 可以比普通剧情更像聊天记录；
- 仍然保持低饱和、克制；
- `side` 只控制对齐关系，不使用高饱和气泡。

### 7.6 文档／方案 `document`

用于任务文件、代理提案、人格报告和系统生成的草稿。

```ts
{
  kind: 'document',
  documentType: 'proposal',
  title: 'PERMANENT AGENT PROPOSAL',
  sections: [
    {
      heading: '目标',
      lines: ['减少重复决策', '提前识别风险'],
    },
  ],
}
```

```ts
type DocumentBlock = BaseBlock & {
  kind: 'document'
  documentType:
    | 'file'
    | 'draft'
    | 'proposal'
    | 'profile'
    | 'report'
  title?: string
  sections: Array<{
    heading?: string
    lines: string[]
  }>
}
```

推荐渲染：

- 像打开一份本地文件；
- 与 `record` 区别：`record` 是系统记录，`document` 是被查看或生成的内容；
- 可在第三、第五章突出“产品提案感”。

### 7.7 引语 `quote`

用于需要停顿的核心句。

```ts
{
  kind: 'quote',
  text: '你仍然拥有自由。只是你不必再亲自承受自由带来的全部噪声。',
}
```

推荐渲染：

- 单独留白；
- 不频繁使用；
- 不需要真实引号装饰；
- 可使用稍慢的打字速度。

### 7.8 分隔 `divider`

用于时间跳转、分支结果和章节内部转场。

```ts
{
  kind: 'divider',
  label: '第二天早晨',
}
```

推荐渲染：细线、小标题或时间标记。

---

## 8. 选择结构

```ts
type StoryChoice = {
  id: StoryChoiceId
  type: 'roleplay' | 'exploration' | 'key' | 'final'
  text: string
  label?: string
  effects?: ChoiceEffects
  response?: StoryBlock[]
  next: StoryRoute
  when?: StoryCondition
  ui?: ChoiceUiHints
}
```

### 8.1 选择类型

#### `roleplay`

- 用于玩家语气和角色扮演；
- 选择后显示 1–2 个专属回应块；
- 随后立即回到共同主线；
- 变量幅度：
  - 每次通常只影响一个变量，幅度只能为 `+1` 或 `-1`；
  - 极少数情况下可影响两个变量，每项幅度仍只能为 `+1` 或 `-1`；
  - 最多影响两个变量，且总绝对变化量不得超过 `2`；
- roleplay 只用于累计倾向微调：不得写入 `finalChoice`，不得直接指定结局，
  也不得承担关键权限变更（这些属于 `key` 与 `final`）；
- 不应单独决定结局。

#### `exploration`

- 用于展开世界观、系统依据、模型错误和权限来源；
- 玩家可以积极查看，也可以跳过；
- **不改变四变量**；
- 只写入探索记录，供镜像报告或成就使用；
- 避免“多看内容 = 更诚实 = 更容易触发某结局”的误判。

#### `key`

- 用于授予权限、发送信息、启用人格辅助、处理高压事件等；
- 可以进入不同后续节点；
- 承担主要变量变化；
- 必须记录稳定的选择 ID；
- 后续章节可通过条件文本回调。

#### `final`

- 仅用于第五章最终选择；
- 必须写入 `finalChoice`；
- 下一步进入统一结局判断节点；
- 不在选项中直接硬编码结局 ID。

### 8.2 选择效果

```ts
type ChoiceEffects = {
  stats?: Partial<Record<StatKey, number>>
  addTags?: string[]
  setFlags?: Record<string, boolean | string | number>
  finalChoice?: FinalChoiceId
}
```

示例：

```ts
{
  id: 'ch4.keep_delay_only',
  type: 'key',
  text: '只保留延迟。你可以让我等，但不能替我决定。',
  effects: {
    stats: {
      selfAcceptance: 2,
      control: -1,
      honesty: 1,
    },
    addTags: ['ch4_keep_delay_only'],
  },
  next: 'ch4.after_permission_choice',
}
```

### 8.3 选项专属回应

扮演选择不必为每个短回应都建立独立节点，可以直接使用 `response`。

```ts
{
  id: 'ch1.tone_defensive',
  type: 'roleplay',
  text: '你连这个都要记录？',
  effects: {
    stats: { honesty: 1 },
    addTags: ['ch1_tone_defensive'],
  },
  response: [
    {
      kind: 'dialogue',
      speaker: 'agent',
      text: '记录不是指控。',
    },
    {
      kind: 'dialogue',
      speaker: 'agent',
      text: '你保留下来的内容是一种回答。你反复删掉的内容也是。',
    },
  ],
  next: 'ch1.behavior_pattern',
}
```

运行顺序：

1. 应用变量和标签；
2. 显示 `response`；
3. 玩家点击继续；
4. 进入 `next`。

---

## 9. 分支与汇合

### 9.1 路由格式

简单路由直接写节点 ID：

```ts
next: 'ch2.chapter_merge'
```

条件路由使用声明式规则：

```ts
next: {
  cases: [
    {
      when: {
        op: 'hasChoice',
        choiceId: 'ch2_analyze_other',
      },
      nodeId: 'ch2.reply_after_analyze_other',
    },
    {
      when: {
        op: 'hasChoice',
        choiceId: 'ch2_analyze_self',
      },
      nodeId: 'ch2.reply_after_analyze_self',
    },
  ],
  fallback: 'ch2.reply_default',
}
```

```ts
type StoryRoute =
  | StoryNodeId
  | {
      cases: Array<{
        when: StoryCondition
        nodeId: StoryNodeId
      }>
      fallback: StoryNodeId
    }
```

### 9.2 局部分支原则

关键选择可以进入不同分支，但建议在以下位置汇合：

- 本章结尾；
- 下一次关键选择前；
- 下一章入口。

不建议让每一次关键选择永久生成独立路线，否则分支数量会指数增长。

推荐：

```txt
共同节点
  ├─ 关键选择 A → A 独立结果 ┐
  ├─ 关键选择 B → B 独立结果 ├→ 汇合节点
  ├─ 关键选择 C → C 独立结果 ┤
  └─ 关键选择 D → D 独立结果 ┘
```

即使剧情汇合，选择仍通过以下方式持续产生影响：

- 四变量；
- `choiceHistory`；
- `tags`；
- 条件文本；
- 第五章个性化代理提案；
- 结局路径回声；
- 结局触发规则。

### 9.3 条件文本

同一个节点中，可以根据历史选择显示不同的内容。

```ts
{
  kind: 'record',
  recordType: 'internal',
  when: {
    op: 'hasChoice',
    choiceId: 'ch1_full_planning_authority',
  },
  paragraphs: [
    '用户在选择范围被缩小时，更容易开始行动。',
  ],
}
```

渲染前先计算 `when`。不满足条件的块不进入打字机队列，也不保留空白占位。

---

## 10. 条件表达式格式

所有章节回调和结局规则共享同一套 `StoryCondition`。

```ts
type StoryCondition =
  | {
      op: 'all'
      conditions: StoryCondition[]
    }
  | {
      op: 'any'
      conditions: StoryCondition[]
    }
  | {
      op: 'not'
      condition: StoryCondition
    }
  | {
      op: 'stat'
      stat: StatKey
      gte?: number
      lte?: number
      eq?: number
    }
  | {
      op: 'hasChoice'
      choiceId: StoryChoiceId
    }
  | {
      op: 'choiceCount'
      choiceIds: StoryChoiceId[]
      gte?: number
      lte?: number
    }
  | {
      op: 'hasTag'
      tag: string
    }
  | {
      op: 'flag'
      key: string
      equals: boolean | string | number
    }
  | {
      op: 'finalChoice'
      equals: FinalChoiceId
    }
```

限制：

- 不允许在数据文件里写 `state => ...` 函数；
- 所有条件必须能被统一验证器解析；
- 条件数组按声明顺序处理；
- 路由必须提供 `fallback`。

---

## 11. 游戏状态结构

```ts
type StoryState = {
  schemaVersion: 3
  currentNodeId: StoryNodeId
  stats: Stats
  choiceHistory: ChoiceRecord[]
  tags: string[]
  flags: Record<string, boolean | string | number>
  visitedNodeIds: StoryNodeId[]
  finalChoice?: FinalChoiceId
  completed: boolean
}
```

```ts
type ChoiceRecord = {
  choiceId: StoryChoiceId
  nodeId: StoryNodeId
  chapterId: ChapterId
  choiceType: StoryChoice['type']
  selectedAt: string
}
```

说明：

- 存档核心字段从 `currentChapterId` 改为 `currentNodeId`；
- 视觉章节根据节点所在章节推导；
- `choiceHistory` 是后续回调和镜像报告的主要依据；
- `tags` 用于快速判断稳定的叙事事件；
- `flags` 用于保存少量状态，例如 `agentSentMessage: true`；
- 不要把完整剧情正文写入存档。

---

## 12. 结局内容文件

结局分为 **6 个家族**与 **11 个玩家可见结局**。

家族保存一整段正文与共用的镜像报告，每个家族一个文件；变体保存玩家真正看到的
标题、副标题、状态摘要与专属段落。这样 11 个不同的结果不需要复制 11 份重复正文。

```ts
import type { EndingDefinition } from '../../../types/story'

export const symbiosisEnding = {
  id: 'symbiosis',
  variants: [
    {
      id: 'symbiosis_stable_boundary',
      title: '稳定边界',
      subtitle: '边界一直在。这次只是确认。',
      statusLines: [],
      prelude: [],
      report: [],
    },
    // …另外三个变体
  ],
  body: [],
  report: {
    statusLines: [],
    paragraphs: [],
  },
  pathEchoes: [],
  finalLine: [],
} satisfies EndingDefinition
```

### 12.1 结局结构

```ts
type EndingVariant = {
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

type EndingDefinition = {
  id: EndingId
  /** 至少一个变体；单结果家族只写一个，ID 与家族 ID 同名。 */
  variants: EndingVariant[]

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
```

**变体本身不带条件。** 命中哪一个由结局规则决定（`EndingRule.variantId`），
这样「规则」与「正文」仍然只有一个真相来源。

省略的字段沿用家族默认值，只有真正需要区分的部分才写进变体。

### 12.2 渲染顺序

`buildEndingView(ending, variant, state)` 负责拼接，页面不参与任何结局分支判断：

```txt
标题 / 副标题   ← variant.title / variant.subtitle
状态摘要        ← variant.statusLines ?? ending.report.statusLines
正文            ← preludeVariants（条件） → variant.prelude → ending.body
报告            ← ending.report.paragraphs → variant.report → ending.report.variants（条件）
路径回声        ← ending.pathEchoes
收尾句          ← variant.finalLine ?? ending.finalLine
```

### 12.3 结局衔接变体

`preludeVariants` 用于与最终行为无关的共同衔接。当前唯一的用途是「先问过身份再回来确认」。

```ts
type ConditionalBlockGroup = {
  id: string
  when: StoryCondition
  blocks: StoryBlock[]
}
```

示例：

```ts
preludeVariants: [
  {
    id: 'active_disconnection_after_identity',
    when: {
      op: 'hasChoice',
      choiceId: 'ch5_ask_identity',
    },
    blocks: [
      {
        kind: 'narration',
        text: '身份回答结束以后，你继续了刚才暂停的关闭流程。',
      },
    ],
  },
]
```

注意条件用的是 `hasChoice` 而不是 `finalChoice`：询问身份已经不是最终行为。

### 12.4 路径回声

建议把跨结局通用的路径回声保存在 `endings/pathEchoes.ts`。

```ts
type EndingEchoRule = {
  id: string
  when: StoryCondition
  block: StoryBlock
  priority?: number
  group?: 'chapter_1' | 'chapter_2' | 'chapter_3' | 'chapter_4'
}
```

结局页建议：

- 每章最多选 1 条回声；
- 总共显示 2–4 条；
- 同组中有多条满足时按 `priority` 选择；
- 不随机选择，保证相同存档得到稳定报告。

### 12.5 结局清单

`endings/manifest.ts` 按**玩家可见结局**保存展示顺序、所属家族、标题与 hidden。
标题与 hidden 在结局定义里也各有一份，验证脚本会检查两侧一致。

---

## 13. 结局触发规则文件

结局正文与触发规则必须分离。

`rules/endingRules.ts` 保存按优先级排列的声明式规则。每条规则同时指向家族与变体。

```ts
type EndingRule = {
  id: string
  priority: number
  endingId: EndingId
  /** 命中这条规则时玩家看到的可见结局，必须属于 endingId 这个家族。 */
  variantId: EndingVariantId
  when: StoryCondition
}
```

同一文件还保存两份关键选择名单与三种画像：

```ts
STRONG_DELEGATION_CHOICE_IDS   // 真正交出过权限的六次关键选择
BOUNDARY_RECOVERY_CHOICE_IDS   // 第三、四章里明确收回权限的关键选择
MIRROR_TRAP_CONDITION          // 隐藏结局条件，与第五章的路由共用同一份
```

`MIRROR_TRAP_CONDITION` 被第五章的 `ch5.identity_answer` 节点直接引用：
走进镜像困局的那条路由，与最终判定成镜像困局的那条规则，说的必须是同一件事。

运行时：

1. 按 `priority` 从高到低排序；
2. 找到第一条满足条件的规则；
3. 返回 `{ endingId, variantId, ruleId }`；
4. 若没有命中，执行安全兜底规则。

---

## 14. 结局判断顺序

**正式的触发条件、阈值与优先级顺序以 `story-source/08-ending-rules.md` 为唯一权威来源。**
本节只说明结构，不重复具体数值。

### 14.1 核心原则

```txt
最终行为决定「玩家最后做了什么」。
此前累计的四变量、强授权记录与边界收回记录
决定「这个行为最终意味着什么」。
```

三个真正的最终行为（`permanent_agent` / `tool_only` / `close_agent`）本身不修改四变量。

### 14.2 判断结构

```txt
priority 100   镜像困局（隐藏，无最终行为）
priority  90   permanent_agent + 温柔画像   → 温柔幻觉
priority  89   permanent_agent + 残酷画像   → 残酷优化
priority  88   permanent_agent              → 无声代行
priority  80   tool_only + 稳定边界画像     → 稳定边界
priority  79   tool_only + 边界重建画像     → 边界重建
priority  78   tool_only + 依赖残留画像     → 脆弱边界
priority  77   tool_only                    → 谨慎共生
priority  70   close_agent + 稳定边界画像   → 主动断联
priority  69   close_agent + 依赖残留画像   → 艰难抽离
priority  68   close_agent                  → 浅尝辄止
```

三点必须保持：

- 镜像困局是唯一的最高优先级规则；
- 边界重建必须排在脆弱边界以前，否则早期强授权会永远压过后续的恢复；
- 每个家族的最后一条规则不带画像条件，保证最终行为一定能落地。

### 14.3 询问身份

`ch5_ask_identity` 是 `key` 选择，不写 `finalChoice`，不改四变量。

它之后只有两个去向，由节点的条件路由决定：

```txt
满足 MIRROR_TRAP_CONDITION → ch5.mirror_gate（隐藏结局门）
否则                        → ch5.final_confirmation_after_identity（第二次确认）
```

第二次确认只显示三个真正的最终行为。**不允许由规则替玩家推断最终行为。**

### 14.4 安全兜底

仅用于损坏存档、开发跳转或数据迁移失败 —— 也就是既没有最终行为、又不满足隐藏条件时。

兜底按「稳定边界画像 → 依赖残留画像 → 温柔画像 → 残酷画像 → 默认」的顺序返回常规结局，
白名单在 `FALLBACK_ALLOWED_VARIANT_IDS`。

兜底不得返回：

- `mirror_trap`；
- 任何 `active_disconnection` 变体。

这些结局都依赖明确的最终行为或明确的身份追问路径。

完成存档的校验条件因此不再是「有没有 `finalChoice`」，而是「能不能被现行规则重新推导成
一个正式结局」：命中兜底就说明这份存档已经不属于现行规则，一律作废重置。

---

## 15. 结局概率／达成率数据

### 15.1 不要直接把理论占比写成真实玩家概率

当前项目没有后端和全局统计，因此无法知道真实玩家达成率。

此前计算的分布来自“所有选项等概率”的结构模拟，只能称为：

- 理论路径占比；
- 结构估算；
- 规则模拟结果。

在没有真实统计数据时，不建议显示：

> 本结局达成概率为 12%。

建议显示：

> 理论路径占比约 12.5%。

或者：

> 在当前规则模拟中，约 12.5% 的路径会到达此结局。

### 15.2 单独保存概率数据

按**玩家可见结局**保存，不按家族：玩家看到的是变体标题。

`rules/endingRates.ts`：

```ts
import type { EndingRateMap } from '../../../types/story'

export const endingRates = {
  version: 'structural-2026-08-22',
  source: 'structural_estimate',
  method: 'equal_choice_weight_exact_convolution',
  rates: {
    soft_illusion: 0.0989,
    cruel_optimization: 0.1025,
    silent_delegation: 0.1251,
    symbiosis_stable_boundary: 0.1047,
    symbiosis_rebuilt_boundary: 0.0467,
    symbiosis_cautious: 0.0836,
    symbiosis_fragile_boundary: 0.0914,
    disconnection_active: 0.1047,
    disconnection_hard_extraction: 0.0939,
    disconnection_shallow: 0.128,
    mirror_trap: 0.0204,
  },
} satisfies EndingRateMap
```

```ts
type EndingRateMap = {
  version: string
  source:
    | 'structural_estimate'
    | 'observed_global'
    | 'observed_local'
  method: string
  sampleSize?: number
  rates: Record<EndingVariantId, number>
}
```

生成方式：对正式剧情里 15 个带变量影响的选择节点做精确联合分布卷积
（无随机、无抽样误差），再按第五章最终确认的 4 个等概率选项展开。
数值与 `story-source/08-ending-rules.md` §12 保持一致。

显示规则：

| `source` | UI 文案 |
|---|---|
| `structural_estimate` | 理论路径占比约 XX% |
| `observed_global` | 玩家达成率 XX% |
| `observed_local` | 本设备记录中的达成率 XX% |

要求：

- 概率总和允许因四舍五入出现极小误差；
- 原始数据应使用 `0–1` 小数；
- UI 层统一格式化为百分数；
- 每次结局规则或变量值修改后重新模拟；
- 在正式试玩前，这些数值只作为初始估算。

### 15.3 MVP 建议

第一版可以显示理论路径占比，但必须带“理论”或“估算”字样。

不建议为了真实达成率在第一版加入后端、账号或数据收集。

### 15.4 结局页的展示形式

结局页把占比做成一颗胶囊，排在标题区**副标题的右边、同一行**：

```txt
┌────────────────────────────────────────────────────────────┐
│                          边界重建                           │
│         权限真的交出去过。也真的拿了回来。   ( 理论占比 约 5% ) │
├────────────────────────────────────────────────────────────┤
│  结局正文                    │  AI 镜像报告                  │
```

规则：

- **不单独占一行**。结局页是固定舞台，标题区每多一行，两块正文的可读高度就少一行；
- **副标题相对整个舞台居中**，与标题、正文对在同一条中轴上。
  实现是三列网格 `1fr auto 1fr`：两侧 fr 列宽度永远相等，副标题落在中间那列。
  用 flex 横排会把副标题往左推，标题区看上去就歪了；
- **占比靠到最右**，与两块正文面板的右缘齐平 —— 舞台宽度就是面板宽度，
  所以它读起来像页眉右上角的一条系统读数；
- 窄屏（≤768px）改回上下两行居中排：宽度不够时副标题会被挤成三四行，
  占比也贴不出「与面板右缘齐平」的意思。那时页面已经退回长滚动，
  多一行不再从正文身上扣高度；
- 屏幕上的标签是四个字的「理论占比」，与状态面板那几个短标同一量级；
  文档里描述这个概念时仍称「理论路径占比」，「路径」这层意思在界面上交给悬停说明；
- 与副标题必须有明显区隔，不能被看成同一句话。当前靠中间的大片留白，
  加上胶囊的描边 + 等宽字实现；
- **取整到百分比整数**。一位小数会让这份结构模拟结果看起来像精确的实时统计；
- **下限锁在 1%**，永远不显示「约 0%」—— 玩家确实抵达了这个结局，一个 0 会读成「这条路不存在」；
- 悬停说明必须明确否认它是玩家达成率；
- 措辞约束见 §15.1：断言性文案里不能出现「概率」「达成率」。

取整是纯函数 `toEndingRatePercent`（`src/utils/story/endingRate.ts`），
界面文案在 `src/data/uiContent.ts` 的 `endingContent`。两者都有单元测试兜住措辞与边界。

---

## 16. 渲染流程

### 16.1 节点加载

```txt
读取 currentNodeId
→ 在章节索引中查找节点
→ 过滤 when 不满足的文本块
→ 按顺序交给 StoryBlockRenderer
→ 全部正文完成后显示选项或继续按钮
```

### 16.2 文本块渲染

`StoryBlockRenderer` 只负责按 `kind` 分发：

```ts
switch (block.kind) {
  case 'narration':
    return <NarrationBlock block={block} />
  case 'dialogue':
    return <DialogueBlock block={block} />
  case 'system':
    return <SystemBlock block={block} />
  case 'record':
    return <RecordBlock block={block} />
  case 'message':
    return <MessageBlock block={block} />
  case 'document':
    return <DocumentBlock block={block} />
  case 'quote':
    return <QuoteBlock block={block} />
  case 'divider':
    return <DividerBlock block={block} />
}
```

实现上按渲染方式分组到 `TextBlocks.tsx` 与 `PanelBlocks.tsx`，分发逻辑不变。

组件不能根据具体节点 ID 写特殊剧情逻辑。

### 16.3 玩家选择事务

点击选择后应作为一次原子操作处理：

```txt
禁用当前选项
→ 应用 stats 变化
→ 写入 tags / flags
→ 记录 choiceHistory
→ 写入 finalChoice（如有）
→ 保存存档
→ 显示选择专属 response
→ 解析 next
→ 进入新节点
→ 再次保存
```

如果存档失败，游戏仍可继续，但应保持内存状态一致。

### 16.4 章节显示

- 页面顶部显示视觉章节标题，而不是节点 ID；
- `ch4.immediate_action`、`ch4.audit` 等都显示“第四章：失控日志”；
- `progress` 可显示为 `03 / 05`，但不强制；
- 分支节点沿用同一章节背景和音乐；
- 第四章可通过节点 `ui.mode: 'control'` 临时切换警告视觉。

`manifest.ts` 的 `musicKey` 是章节级的，而第五章需要在章节内部换歌。BGM 的实际切换边界以 `docs/05-assets-map.md` §6 为准；该节同时记录了两种可选实现方式，实现前不要直接依赖 `musicKey`。

---

## 17. UI 提示字段

```ts
type NodeUiHints = {
  mode?: 'normal' | 'control' | 'ending'
  hideStatusPanel?: boolean
  reduceChoices?: boolean
  transition?: 'normal' | 'slow' | 'abrupt'
}
```

```ts
type ChoiceUiHints = {
  emphasis?: 'normal' | 'primary' | 'danger'
  confirm?: boolean
}
```

限制：

- `ui` 只表达语义，不直接保存类名；
- 不在剧情文件写颜色、像素、CSS 变量；
- 最终选择可设置 `confirm: true`，但避免重复弹窗破坏节奏；
- `type` 不必作为“关键选择”等标签展示给玩家。

---

## 18. ID 命名规则

统一使用稳定、可读的英文 ID。

### 18.1 节点

```txt
prologue.initialization
ch1.three_lists
ch1.behavior_evidence
ch1.full_authority_result
ch1.merge
ch5.final_confirmation
```

### 18.2 选择

建议保留现有已讨论的关键记录形式：

```txt
ch1_full_planning_authority
ch2_delegate_message
ch3_enable_full_personality_assist
ch4_keep_delay_only
ch5_close_agent
```

规则：

- ID 一旦进入试玩存档，尽量不再重命名；
- 展示文案可以修改，ID 保持稳定；
- 选择 ID 在全项目唯一；
- 不使用中文 ID；
- 不把选项序号 `choice_a` 作为长期 ID。

---

## 19. 验证脚本要求

验证脚本为 `scripts/validate-story.ts`，通过 `npm run validate:story` 运行，以下检查项均已实现。

必须检查：

1. 所有章节 ID、节点 ID、选择 ID 唯一；
2. 每个章节的 `entryNodeId` 存在；
3. 所有 `next` 和条件路由目标存在；
4. 所有非结局节点最终都能到达第五章结局门；
5. 不存在意外死路；
6. 不存在意外循环；
7. `finalChoice` 只出现在 `final` 类型选择；
8. 信息探索选项不修改四变量；
9. 扮演选项变量变化不超过设计限制；
10. 每章选择节点数量符合设计；
11. 每条结局规则引用的选择 ID 存在；
12. 11 个玩家可见结局全部可达；
13. 每个玩家可见结局都至少有一条正式规则指向它；
14. 每条规则的家族与变体指向同一处，变体 ID 全局唯一；
15. 三个最终行为都不修改四变量；
16. `mirror_trap` 与三个永久关闭变体都不能通过兜底触发；
17. 理论概率数据的键集合与玩家可见结局一致；
18. 结构估算概率总和接近 1；
19. 每个条件路由都有 `fallback`；
20. 所有 `when` 条件均可解析；
21. 所有剧情文件通过 TypeScript 构建。

建议同时生成图结构报告：

```txt
总节点数
可达节点数
不可达节点
分支节点数
汇合节点数
每章选择节点数量
每个结局的模拟可达路径
```

---

## 20. 章节转换工作流建议

本节的五个阶段已全部执行完毕：序章与五章、六个结局家族与 11 个玩家可见结局、路径回声、结局规则与理论占比都已转换并通过验证（见 `docs/00-task-progress.md` 的 C01 / C02 / R01）。以下内容保留，供以后新增章节或结局时复用。

不建议一次性把全部正式剧情转换成所有数据文件。最佳方案是“先做样板，再分章转换，最后统一验证”。

### 阶段一：实现格式骨架

先建立：

- `types/story.ts`；
- `story/manifest.ts`；
- 空的章节与结局索引；
- 通用条件解析；
- 通用节点查找；
- 验证脚本。

此时先不写全部剧情。

### 阶段二：转换一个样板章节

优先转换第一章，因为它同时包含：

- 旁白；
- AI 对话；
- 玩家对白；
- 系统记录；
- 信息探索；
- 扮演选择；
- 关键分支；
- 分支汇合。

第一章跑通后，确认：

- 数据格式是否顺手；
- UI 是否能正确渲染所有块类型；
- 选择专属回应是否自然；
- 存档是否保存到节点级；
- 分支汇合是否正常。

### 阶段三：逐章转换

推荐每次处理一个章节，最多两个相邻章节。

流程：

```txt
提供该章确认稿
→ 转成章节数据文件
→ 运行类型检查和图验证
→ 人工核对文本是否遗漏
→ 在游戏中完整走一遍本章分支
→ 再进入下一章
```

这种方式比一次输出全部文件更可靠，也不会像完全手工拆分那样过度繁琐。

### 阶段四：转换结局

五章完成后再处理：

- 六个结局家族文件；
- 路径回声库；
- `endingRules.ts`；
- `endingRates.ts`。

最后进行路径模拟，确认每种典型路线与边缘路线落入合理结局。

### 阶段五：统一回归

至少验证：

- 温柔代理路线；
- 残酷优化路线；
- 稳定工具路线；
- 高依赖后撤回工具路线；
- 主动关闭路线；
- 高依赖后突然关闭路线；
- 身份询问但不触发隐藏结局；
- 镜像困局隐藏路线；
- 旧存档或缺少 `finalChoice` 的兜底路线。

---

## 21. 最终决策摘要

推荐采用：

- **TypeScript 分章数据模块**，替代单个大型 JSON；
- 一个视觉章节由多个剧情节点构成；
- 文本使用 `StoryBlock` 联合类型区分渲染；
- 扮演选择使用内联短回应后汇流；
- 信息探索不影响四变量；
- 关键选择进入独立局部分支；
- 所有条件使用声明式 `StoryCondition`；
- 结局正文、结局规则、结局概率分别保存；
- `finalChoice` 先保证叙事事实，变量与关键记录再细分结局；
- 当前概率只能显示为“理论路径占比”；
- 先完成第一章样板，再逐章转换，最后统一生成结局并做路径模拟。
