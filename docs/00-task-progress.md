# 《镜中代理》任务进度表

用途：供开发期间维护进度。建议每完成一个任务，就更新“状态”和“备注”。

状态建议：`未开始` / `进行中` / `待验收` / `已完成` / `延后`

| 阶段 | 任务 ID | 任务名称 | 产出物 | 优先级 | 状态 | 验收标准 | 备注 |
|---|---:|---|---|---|---|---|---|
| 前期文档 | D01 | 需求文档 | `docs/01-requirements.md` | P0 | 已完成 | 项目目标、范围、功能、非功能要求清楚 | 本文档包已生成 |
| 前期文档 | D02 | 游戏设计文档 | `docs/02-game-design.md` | P0 | 已完成 | 核心玩法、变量、章节、结局清楚 | 本文档包已生成 |
| 前期文档 | D03 | 交互设计文档 | `docs/03-interaction-design.md` | P0 | 已完成 | 页面流程、交互状态、存档、移动端规则清楚 | 本文档包已生成 |
| 前期文档 | D04 | UI 与视觉效果文档 | `docs/04-ui-visual-spec.md` | P0 | 已完成 | 视觉方向、字体、图标库、页面效果、素材需求清楚 | 本文档包已生成 |
| 前期准备 | P01 | 生成页面 UI 效果图 | `/design/ui/*.png` 或 `/docs/ui-mockups.md` | P1 | 已完成 | 开始页、游戏页、结局页至少各 1 张 | 已用chatGPT生成 |
| 前期准备 | P02 | 生成背景图与插画 | `src/assets/backgrounds/*` | P1 | 已完成 | 至少 6 张统一风格背景图 | 已用chatGPT生成 |
| 工程基础 | E01 | 初始化项目 | Vite + React + TypeScript 项目 | P0 | 已完成 | `npm install`、`npm run dev`、`npm run build` 成功 | Vite + React + TypeScript 已初始化，`npm run build` 已通过；未接真实 AI API，GitHub Pages base 路径留到部署阶段 |
| 工程基础 | E02 | 建立基础页面 | Start/Game/Ending 三个页面 | P0 | 已完成 | 能从开始页进入游戏页，再进入结局页 | 三页基础流转已打通，占位内容放在 `src/data/demoFlow.ts`；正式章节、变量、结局与存档等游戏系统将在后续阶段实现 |
| 数据系统 | G01 | 剧情数据结构 | `src/data/story.json`、类型定义 | P0 | 已完成 | 章节、文本、选项、变量影响可从数据驱动 | 已在 `src/types/game.ts` 建立剧情与选项类型；已建立本地 `story.json` 数据；章节、段落、选项和变量影响完全由数据驱动，组件不再持有剧情文案；当前为开发阶段示例内容（序章 + 2 章），正式剧情留待 C01 |
| 数据系统 | G02 | 状态与变量系统 | `Stats`、选择记录、当前章节 | P0 | 已完成 | 点击选择后变量正确变化 | 已建立四变量初始状态（全部为 0）；已通过 `src/utils/gameState.ts` 实现不可变累计更新；已记录选择路径、当前章节与 `finalChoice`；当前状态仅存于内存，localStorage 留待 I03；两条验证路径变量结果均与数据一致 |
| 数据系统 | G03 | 新剧情引擎骨架 | `src/types/story.ts`、`src/data/story/`、`src/utils/story/`、`src/components/story/` | P0 | 已完成 | 节点式数据、条件、分支、渲染与结局规则接口可运行 | 详见下方“G03 说明” |
| 内容实现 | C01 | 写入正式剧情 | 序章 + 五章剧情 | P0 | 未开始 | 每章 3–6 段文本、3–4 个选项 | 文风克制、心理寓言感；`story-source/01`–`07` 尚未转换成运行时数据，当前 `src/data/story/chapters/` 只有引擎测试占位 |
| 内容实现 | C02 | 结局文案 | 5 个结局 | P0 | 未开始 | 每个结局都有标题、正文、AI 镜像报告 | 结局是传播重点；`src/data/story/endings/` 五个文件目前只有标注为 ENGINE TEST PLACEHOLDER 的骨架 |
| 规则实现 | R01 | 结局判断逻辑 | `src/utils/story/getEnding.ts`、`src/data/story/rules/endingRules.ts` | P0 | 已完成 | 不同路径能触发不同结局 | 已按 `story-source/08-ending-rules.md` 实现：mirror_trap 最高优先级、强授权去重计数、`ask_identity` 四种去向、缺失 finalChoice 的安全兜底；兜底不会返回 mirror_trap 或 active_disconnection。判断规则已完成，结局**正文**仍属 C02 |
| 交互体验 | I01 | 打字机效果 | `TypewriterText` | P1 | 未开始 | 文本逐字显示，可点击跳过当前段 | 不影响阅读 |
| 交互体验 | I02 | AI 状态面板 | `AiStatusPanel` | P1 | 未开始 | 不直接显示数字，而显示状态描述 | 营造系统感 |
| 交互体验 | I03 | 本地存档 | localStorage | P1 | 未开始 | 刷新后可继续，结局后可重开 | 存档不应破坏通关 |
| 视觉实现 | V01 | 全局视觉风格 | `global.css` | P1 | 未开始 | 暗色、安静、AI 终端感、可读性好 | 不要赛博朋克霓虹过量 |
| 视觉实现 | V02 | 页面背景与插画接入 | 背景图、渐变、遮罩 | P1 | 未开始 | 每章有氛围区分且风格统一 | 背景不抢文本 |
| 传播功能 | S01 | 复制镜像报告 | 结局页按钮 | P2 | 未开始 | 可复制结局标题、报告、变量描述 | 不支持 Clipboard 时要降级 |
| 部署发布 | DEP01 | GitHub Pages 配置 | `vite.config.ts`、README | P0 | 未开始 | `npm run build` 通过并可部署 | 注意 base 路径 |
| 测试打磨 | T01 | 移动端适配 | CSS 响应式 | P1 | 未开始 | 320px 宽度可玩，按钮易点 | 重点测手机浏览器 |
| 测试打磨 | T02 | 试玩反馈 | 反馈记录 | P2 | 未开始 | 至少 3 位朋友试玩，记录卡点和被打动的句子 | 问“哪一句最打到你” |

---

## G03 新剧情引擎骨架说明

对应规范：`docs/06-story-ending-data-format.md`、`story-source/08-ending-rules.md`。

### 已完成

- **节点式数据**：`src/data/story/` 按 manifest + 分章 TypeScript 数据模块组织，章节和结局文件都是纯声明式对象并用 `satisfies` 校验；旧的单个 `story.json` 及其类型、校验和状态工具已删除，不存在双轨逻辑。
- **状态**：`StoryState` 升级到节点级（`schemaVersion: 2`、`currentNodeId`、`stats`、`choiceHistory`、`tags`、`flags`、`visitedNodeIds`、`finalChoice`、`completed`），视觉章节由节点的 `chapterId` 推导。状态仍只存在于内存，但保持可序列化，localStorage 仍属 I03。
- **条件**：`StoryCondition` 支持 `all` / `any` / `not` / `stat` / `hasChoice` / `choiceCount` / `hasTag` / `flag` / `finalChoice`，章节回调、选项可见性、条件路由和结局规则共用同一套求值。
- **分支**：简单路由与带 `fallback` 的条件路由、局部分支后汇合、选项专属 `response` 后回到主线；选择作为一次状态事务处理（stats → tags/flags → choiceHistory → finalChoice → 基于新状态解析 next），tags 与 visitedNodeIds 去重。
- **渲染**：`StoryBlockRenderer` 覆盖 narration / dialogue / system / record / message / document / quote / divider 八种块，`GamePage` 不含任何按节点 ID 的剧情逻辑。本阶段直接展示完整文本，打字机仍属 I01。
- **结局规则接口**：见 R01。
- **错误状态**：找不到节点、路由目标缺失、节点无出口、结局定义缺失都会显示统一的“实验数据损坏”页并可返回开始页，控制台输出具体原因，不会白屏。
- **数据验证**：`npm run validate:story`（tsx 运行 `scripts/validate-story.ts`），覆盖 ID 唯一性、入口与路由目标存在、条件路由 fallback、可达性、死路、循环、`finalChoice` 只用于 final 选择、exploration 零变量影响、roleplay 轻量限制、结局规则引用有效性、五个结局可达、mirror_trap 严格条件与最高优先级、缺失 finalChoice 的兜底安全性、理论占比数据一致性，并输出图结构报告。

### 尚未完成

- 正式剧情与正式结局文案都**没有**录入。`src/data/story/chapters/` 是标注为 ENGINE TEST DATA 的占位剧情，`src/data/story/endings/` 是标注为 ENGINE TEST PLACEHOLDER 的骨架，分别留给 C01 和 C02。
- `endingRates` 的理论路径占比取自设计文档，正式剧情录入后需要重新模拟。
- 路径回声（`pathEchoes`）只有类型与选取函数，暂无数据。
