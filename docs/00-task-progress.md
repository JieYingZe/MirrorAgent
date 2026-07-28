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
| 内容实现 | C01 | 写入正式剧情 | 序章 + 五章剧情 | P0 | 已完成 | 每章 3–6 段文本、3–4 个选项 | `story-source/01`–`07` 已全部转换为运行时数据：65 个节点、20 个选择节点、80 个选项，序章→第五章全线可达并可通关。详见下方“C01 / C02 / R01 集成检查” |
| 内容实现 | C02 | 结局文案 | 5 个结局 | P0 | 已完成 | 每个结局都有标题、正文、AI 镜像报告 | 五个结局的正文、镜像报告与结尾句已录入；路径回声改为五个结局共用的 `endings/pathEchoes.ts`（22 条，按章分组）。浏览器实测五个结局均可正常进入并渲染 |
| 规则实现 | R01 | 结局判断逻辑 | `src/utils/story/getEnding.ts`、`src/data/story/rules/endingRules.ts` | P0 | 已完成 | 不同路径能触发不同结局 | 已按 `story-source/08-ending-rules.md` 实现：mirror_trap 最高优先级、强授权去重计数、`ask_identity` 四种去向、缺失 finalChoice 的安全兜底；兜底不会返回 mirror_trap 或 active_disconnection。已接入正式剧情并通过单元测试（`npm test`）与 20000 条抽样路径模拟 |
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
- **数据验证**：`npm run validate:story`（tsx 运行 `scripts/validate-story.ts`），覆盖 ID 唯一性、入口与路由目标存在、条件路由 fallback、可达性、死路、循环、`finalChoice` 只用于 final 选择、exploration 零变量影响、roleplay 轻量限制、结局规则引用有效性、五个结局可达、mirror_trap 严格条件与最高优先级、缺失 finalChoice 的兜底安全性、理论占比数据一致性，并输出图结构报告。正式剧情的组合数约为 4²⁰，无法穷举，路径模拟采用固定种子的确定性抽样并强制覆盖每一个选项。

### 尚未完成

- 引擎骨架本身已完成，剩余工作见 I01–I03、V01–V02、S01、DEP01、T01–T02。

---

## C01 / C02 / R01 集成检查（2026-07-28）

正式剧情、五个结局、路径回声与结局规则接入现有运行时后的一次完整检查与修复。

### 检查结果

| 命令 | 结果 |
|---|---|
| `npx tsc -b` | 通过 |
| `npm run build` | 通过 |
| `npm test`（vitest，11 个用例） | 通过 |
| `npm run validate:story` | 通过，0 error / 0 warning |

- 图结构：65 个节点全部可达、全部能到达结局门，无循环、无死路。
- 抽样模拟：20000 条确定性路径，覆盖 65/65 节点与 80/80 选项；五个结局与四个 `finalChoice` 全部可达，不存在“未写入 finalChoice 就到达结局门”的路径。
- 浏览器实测：序章→第五章逐章通过，五个结局（温柔幻觉 / 共生工具 / 主动断联 / 残酷优化 / 镜像困局）均能正常进入并渲染镜像报告与路径回声，控制台无错误。

### 本次修复的集成问题

1. **第三章选项 ID 分隔符不一致**：`chapter3.ts` 的 16 个选项写成 `ch3.xxx`，而第四、五章的条件文本、路径回声与强授权名单都引用 `ch3_xxx`，导致第三章的所有选择在后续章节和结局里全部失效。已统一为下划线形式。
2. **章节之间断链**：`ch3.three_days_later` 指向不存在的 `ch4.incident_start`，第四、五章整体不可达；`ch4` 结尾直接跳到 `ch5.final_confirmation`，会跳过第五章前 10 个节点。已分别改为 `ch4.protection_protocol` 与 `ch5.permanent_request`。
3. **manifest 章节入口过期**：第二至第五章的 `entryNodeId` 仍是占位期的 `ch2.opening` / `ch3.opening` / `ch4.incident` / `ch5.audit`。已更新为真实入口节点。
4. **结局判断接口被改窄**：`getEnding` 曾被改为只返回 `EndingId`，使 `App.tsx`、`EndingPage.tsx` 与验证脚本依赖的 `ruleId` / `usedFallback` 全部失效。已恢复 `EndingResolution`，并让条件求值统一复用 `evaluateCondition`，不再另有一套实现。
5. **兜底链丢失**：`endingFallbackRules`、`DEFAULT_FALLBACK_ENDING_ID`、`FALLBACK_ALLOWED_ENDING_IDS` 一度被替换成硬编码函数，验证脚本无法再检查兜底白名单。已恢复为声明式规则。
6. **重复实现与重复常量**：删除了与 `evaluateCondition` 重复的条件求值、与 `selectPathEchoes` 重复的回声选取（现统一为 `selectEndingPathEchoes`）、与 `endingContent.rateLabel` 重复的 `endingRateDisplayLabel`，以及与 `validateStory` 覆盖范围重复且未被调用的 `validateEndingReferences.ts`。
7. **`endingManifest` 与结局定义重复保存标题与 hidden**：已加入一致性校验，避免两处静默漂移。
8. **全路径穷举不可行**：正式剧情约 4²⁰ 条组合，原验证脚本的穷举模拟必然超限。改为固定种子的确定性抽样，并强制覆盖每一个选项。

### 需要留意

- **roleplay 变量规则已放宽**（经确认）：`docs/06` §8.1 由“只能 +1”改为“每次通常影响一个变量，幅度只能 +1 或 -1；最多两个变量，总绝对变化量不超过 2；不得写入 finalChoice 或承担关键权限变更”。相应地，`ch4_tone_demand_unfiltered` 从影响三个变量收敛为 `honesty +1 / gentleness -1`（去掉了 `selfAcceptance +1`）。
- `endingRates` 仍是设计文档给出的理论值。抽样模拟的实际分布为 symbiosis 34.3% / active_disconnection 30.5% / cruel_optimization 16.6% / soft_illusion 16.5% / mirror_trap 2.0%，与现有数值基本吻合，暂未改写。
