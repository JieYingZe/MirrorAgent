# 《镜中代理》任务进度表

用途：供开发期间维护进度。建议每完成一个任务，就更新“状态”和“备注”。

状态建议：`未开始` / `进行中` / `待验收` / `已完成` / `延后`

| 阶段 | 任务 ID | 任务名称 | 产出物 | 优先级 | 状态 | 验收标准 | 备注 |
|---|---:|---|---|---|---|---|---|
| 前期文档 | D01 | 需求文档 | `docs/01-requirements.md` | P0 | 已完成 | 项目目标、范围、功能、非功能要求清楚 | 本文档包已生成 |
| 前期文档 | D02 | 游戏设计文档 | `docs/02-game-design.md` | P0 | 已完成 | 核心玩法、变量、章节、结局清楚 | 本文档包已生成 |
| 前期文档 | D03 | 交互设计文档 | `docs/03-interaction-design.md` | P0 | 已完成 | 页面流程、交互状态、存档、移动端规则清楚 | 本文档包已生成 |
| 前期文档 | D04 | UI 与视觉效果文档 | `docs/04-ui-visual-spec.md` | P0 | 已完成 | 视觉方向、字体、图标库、页面效果、素材需求清楚 | 本文档包已生成 |
| 前期准备 | P01 | 生成页面 UI 效果图 | `design/ui-mockups/*.webp` | P1 | 已完成 | 开始页、游戏页、结局页至少各 1 张 | 已用chatGPT生成；桌面／移动共 8 张，清单见 `docs/05-assets-map.md` §2。只作设计参考，不参与运行时打包 |
| 前期准备 | P02 | 生成背景图与插画 | `src/assets/backgrounds/*` | P1 | 已完成 | 至少 6 张统一风格背景图 | 已用chatGPT生成；桌面与移动各 6 张 WebP，映射见 `docs/05-assets-map.md` §3。素材已就位，运行时接入属于 V02 |
| 前期准备 | P03 | 音频素材与授权记录 | `public/audio/bgm/*`、`public/audio/sfx/*`、`credits/audio-credits.md` | P1 | 已完成 | BGM 与 SFX 文件存在；文件名与 `docs/05-assets-map.md` §6–§7 映射一致；每个文件的来源、作者、下载链接与授权记录完整 | 4 个 BGM + 5 个 SFX 已下载并按目标文件名放置；`credits/audio-credits.md` 记录了原始文件名、作者、Pixabay 来源、下载链接与用途。仅指素材与授权，运行时接入属于 A01–A03 |
| 工程基础 | E01 | 初始化项目 | Vite + React + TypeScript 项目 | P0 | 已完成 | `npm install`、`npm run dev`、`npm run build` 成功 | Vite + React + TypeScript 已初始化，`npm run build` 已通过；未接真实 AI API，GitHub Pages base 路径留到部署阶段 |
| 工程基础 | E02 | 建立基础页面 | `src/pages/` 下 Start/Game/Ending 三个页面 | P0 | 已完成 | 能从开始页进入游戏页，再进入结局页 | 三页基础流转已打通。当时的占位内容 `src/data/demoFlow.ts` 已在 G03 中删除，现由 `src/data/story/` 的正式节点数据驱动；另有 `DataErrorPage` 作为数据损坏出口 |
| 数据系统 | G01 | 剧情数据结构（初版） | 章节／选项类型 + 本地剧情数据 | P0 | 已完成 | 章节、文本、选项、变量影响可从数据驱动 | 初版使用 `src/data/story.json` + `src/types/game.ts` 中的章节类型，已由 G03 的节点式结构整体替换：`story.json` 与相关类型、工具已删除，`src/types/game.ts` 现在只保留 `StatKey` / `Stats` / `FinalChoice` |
| 数据系统 | G02 | 状态与变量系统 | `Stats`、选择记录、当前节点 | P0 | 已完成 | 点击选择后变量正确变化 | 已建立四变量初始状态（全部为 0）与不可变累计更新；初版的 `src/utils/gameState.ts` 已由 `src/utils/story/storyState.ts`、`applyChoice.ts` 替换，进度字段从 `currentChapterId` 升级为 `currentNodeId`；当前状态仅存于内存，localStorage 留待 I03 |
| 数据系统 | G03 | 新剧情引擎骨架 | `src/types/story.ts`、`src/data/story/`、`src/utils/story/`、`src/components/story/` | P0 | 已完成 | 节点式数据、条件、分支、渲染与结局规则接口可运行 | 详见下方“G03 说明” |
| 内容实现 | C01 | 写入正式剧情 | 序章 + 五章剧情 | P0 | 已完成 | 序章与五章全部节点化：每个剧情节点 3–6 段文本，每个选择节点 3–4 个选项，一章包含多个选择节点 | `story-source/01`–`07` 已全部转换为运行时数据：65 个节点、20 个选择节点、80 个选项，序章→第五章全线可达并可通关。详见下方“C01 / C02 / R01 集成检查” |
| 内容实现 | C02 | 结局文案 | 5 个结局 | P0 | 已完成 | 每个结局都有标题、正文、AI 镜像报告 | 五个结局的正文、镜像报告与结尾句已录入；路径回声改为五个结局共用的 `endings/pathEchoes.ts`（22 条，按章分组）。浏览器实测五个结局均可正常进入并渲染 |
| 规则实现 | R01 | 结局判断逻辑 | `src/utils/story/getEnding.ts`、`src/data/story/rules/endingRules.ts` | P0 | 已完成 | 不同路径能触发不同结局 | 已按 `story-source/08-ending-rules.md` 实现：mirror_trap 最高优先级、强授权去重计数、`ask_identity` 四种去向、缺失 finalChoice 的安全兜底；兜底不会返回 mirror_trap 或 active_disconnection。已接入正式剧情并通过单元测试（`npm test`）与 20000 条抽样路径模拟 |
| 交互体验 | I01 | 打字机效果与阅读节奏 | `useStoryReadingSequence` + `utils/story/reading*` | P1 | 已完成 | 文本逐字显示，可点击跳过当前段 | 统一阅读状态机 + 固定高度剧情阅读区 + 自动播放开关。已做两次验收修订：①剧情区改为受控高度的独立滚动容器、自动跟随只滚容器不滚页面；②自动播放默认关闭并交给独立的本地用户偏好，开关关闭时立即补全当前 block 并停住，开启时一次点击看完当前展示序列，推进热区扩大到舞台空白。详见下方“I01 说明”。没有实现 `TypewriterText` 组件：揭示是整段序列的状态，不是单个文本组件的私有状态 |
| 交互体验 | I02 | AI 状态面板 | `AiStatusPanel` | P1 | 已完成 | 不直接显示数字，而显示状态描述 | 四变量经 `src/utils/aiStatus.ts` 的纯映射转成状态文案（语气／反馈／权限／自我边界，每个变量五档），区间与结局阈值对齐、首末档向 ±∞ 开放，NaN 与缺字段回落到初始档；面板只展示，不写回 `StoryState`。GamePage 传入最新 `stats`，因此显示选项专属回应时也会立即更新，并尊重节点的 `ui.hideStatusPanel` 与 `ui.mode: 'control'`（仅边框与提示语变化）。桌面 280px 右栏、≤900px 两列紧凑卡片，320px 无换行无横向滚动。`tests/aiStatus.test.ts` 18 个用例覆盖区间边界、初始值、剧情实际取值范围与 ±1000／±Infinity |
| 交互体验 | I03 | 本地存档 | localStorage | P1 | 已完成 | 刷新后可继续，结局后可重开 | 存档键 `mirror-agent:story-save`，直接持久化正式 `StoryState`（见下方“I03 说明”）。`src/utils/story/storySave.ts` 提供 load / save / clear / validate，恢复前逐字段校验并复用正式剧情索引；损坏、旧版本、引用失效的存档安全清除后按无存档处理，localStorage 不可用时静默降级为不保存。存档只处理剧情状态，音频偏好仍属 A01 且必须使用独立键 |
| 音频体验 | A01 | 启动遮罩与音频管理 | `StartupGate` 覆盖层、全局音频管理 | P1 | 未开始 | 详见下方“A01 验收标准” | 依赖 P03；流程以 `docs/03-interaction-design.md` §2 为准 |
| 音频体验 | A02 | BGM 场景映射与切换 | BGM 场景映射与切换逻辑 | P1 | 未开始 | 详见下方“A02 验收标准” | 依赖 A01；映射与切换边界见 `docs/05-assets-map.md` §6 |
| 音频体验 | A03 | SFX 接入与音量平衡 | 音效触发与音量策略 | P2 | 未开始 | 详见下方“A03 验收标准” | 依赖 A01；时间不足时可延后，不阻塞通关 |
| 视觉实现 | V01 | 全局视觉风格 | `src/styles/global.css` | P1 | 进行中 | 暗色、安静、AI 终端感、可读性好 | 已有基础暗色样式、面板与块级排版；色彩变量、动效规范与结局页仪式感仍需按 `docs/04-ui-visual-spec.md` 打磨。不要赛博朋克霓虹过量 |
| 视觉实现 | V02 | 页面背景与插画接入 | 背景图、渐变、遮罩 | P1 | 未开始 | 每章有氛围区分且风格统一 | 背景不抢文本 |
| 传播功能 | S01 | 复制镜像报告 | 结局页按钮 | P2 | 未开始 | 可复制结局标题、报告、变量描述 | 不支持 Clipboard 时要降级 |
| 部署发布 | DEP01 | GitHub Pages 配置 | `vite.config.ts`、README | P0 | 未开始 | `npm run build` 通过并可部署 | 注意 base 路径 |
| 测试打磨 | T01 | 移动端适配 | CSS 响应式 | P1 | 未开始 | 320px 宽度可玩，按钮易点 | 重点测手机浏览器 |
| 测试打磨 | T02 | 试玩反馈 | 反馈记录 | P2 | 未开始 | 至少 3 位朋友试玩，记录卡点和被打动的句子 | 问“哪一句最打到你” |

---

## 验证命令

每次改动后至少运行前两条；改动剧情数据或结局规则时四条全跑。

| 命令 | 用途 |
|---|---|
| `npx tsc -b` | 类型检查 |
| `npm run build` | 构建（内部同样执行 `tsc -b`） |
| `npm test` | vitest 单元测试（`tests/`） |
| `npm run validate:story` | 剧情图结构与结局规则验证（`scripts/validate-story.ts`） |

项目当前没有配置 lint，不存在 `npm run lint`。

---

## 音频任务验收标准

三个任务都只描述运行时行为。素材本身与授权记录属于 P03，素材已存在不等于 A01–A03 已完成。

### A01 启动遮罩与音频管理

- 打开网页后先显示轻量启动遮罩（StartupGate），不直接进入 StartPage；
- 用户点击「点击进入实验」后，才尝试解锁音频并播放首页 BGM；
- 音频解锁或播放失败时不阻塞流程，仍然进入 StartPage，且不弹出错误弹窗；
- 提供全局静音／恢复声音控制，在 StartPage、GamePage、EndingPage 都可访问；
- 音频偏好（静音状态、音量）与剧情存档分开保存，使用不同的存储键；
- 重新初始化剧情时只清除剧情存档，不强制清除音频偏好。

### A02 BGM 场景映射与切换

- StartPage、序章、各章节和 EndingPage 都有明确的 BGM 映射，见 `docs/05-assets-map.md` §6；
- 同一首 BGM 在普通节点跳转（同章内换节点、分支后汇合）时保持连续播放，不重新开始；
- 切歌时旧曲淡出、新曲淡入，任何时刻不出现两首 BGM 持续重叠；
- 第五章前半、第五章后半与结局页的切换边界使用明确的节点 ID，不使用模糊描述；
- 页面隐藏（`visibilitychange`）、暂停或静音后再恢复时，行为稳定，不出现叠加播放或多实例。

### A03 SFX 接入与音量平衡

- 普通按钮、剧情选择、警告和结局揭示音效按 `docs/05-assets-map.md` §7 的映射触发；
- 音效音量低于 BGM 与阅读体验的容忍线，不盖过正文阅读；
- 连续快速点击不产生严重叠音（同一音效需要节流或复用实例）；
- 静音时 BGM 与 SFX 同时停止，没有任何遗漏通道；
- 打字机音效不能为每个字符完整播放一次，需要按间隔或按段落节流。

---

## G03 新剧情引擎骨架说明

对应规范：`docs/06-story-ending-data-format.md`、`story-source/08-ending-rules.md`。

### 已完成

- **节点式数据**：`src/data/story/` 按 manifest + 分章 TypeScript 数据模块组织，章节和结局文件都是纯声明式对象并用 `satisfies` 校验；旧的单个 `story.json` 及其类型、校验和状态工具已删除，不存在双轨逻辑。
- **状态**：`StoryState` 升级到节点级（`schemaVersion: 2`、`currentNodeId`、`stats`、`choiceHistory`、`tags`、`flags`、`visitedNodeIds`、`finalChoice`、`completed`），视觉章节由节点的 `chapterId` 推导。状态仍只存在于内存，但保持可序列化，localStorage 仍属 I03。
- **条件**：`StoryCondition` 支持 `all` / `any` / `not` / `stat` / `hasChoice` / `choiceCount` / `hasTag` / `flag` / `finalChoice`，章节回调、选项可见性、条件路由和结局规则共用同一套求值。
- **分支**：简单路由与带 `fallback` 的条件路由、局部分支后汇合、选项专属 `response` 后回到主线；选择作为一次状态事务处理（stats → tags/flags → choiceHistory → finalChoice → 基于新状态解析 next），tags 与 visitedNodeIds 去重。
- **渲染**：`StoryBlockRenderer` 覆盖 narration / dialogue / system / record / message / document / quote / divider 八种块，`GamePage` 不含任何按节点 ID 的剧情逻辑。逐段揭示已在 I01 加上：不传 `reveal` 时仍是一次性完整显示（结局页即如此）。
- **结局规则接口**：见 R01。
- **错误状态**：找不到节点、路由目标缺失、节点无出口、结局定义缺失都会显示统一的“实验数据损坏”页并可返回开始页，控制台输出具体原因，不会白屏。
- **数据验证**：`npm run validate:story`（tsx 运行 `scripts/validate-story.ts`），覆盖 ID 唯一性、入口与路由目标存在、条件路由 fallback、可达性、死路、循环、`finalChoice` 只用于 final 选择、exploration 零变量影响、roleplay 轻量限制、结局规则引用有效性、五个结局可达、mirror_trap 严格条件与最高优先级、缺失 finalChoice 的兜底安全性、理论占比数据一致性，并输出图结构报告。正式剧情的组合数约为 4²⁰，无法穷举，路径模拟采用固定种子的确定性抽样并强制覆盖每一个选项。

### 尚未完成

- 引擎骨架本身已完成，剩余工作见 I01–I03、A01–A03、V01–V02、S01、DEP01、T01–T02。
- `manifest.ts` 的 `backgroundKey` / `musicKey` 目前只是章节级资源键，没有任何运行时消费方；接入分别属于 V02 与 A02。

---

## I01 打字机效果与阅读节奏说明（2026-07-29）

只影响展示层。阅读进度不进入 `StoryState`，不写 localStorage，也不改变选择结果、变量与节点路由。

2026-07-29 第一次验收修订：固定／受控高度的剧情阅读区、剧情区域内部滚动、
同一展示序列内自动连续播放，并在继续、探索、选项和 response 结束处停止。

2026-07-29 第二次验收修订：自动播放**默认关闭**并改由独立的本地用户偏好持久化；
GamePage 增加自动播放开关；关闭开关时立即补全当前 block 并停住；
开启时一次点击直接看完当前展示序列；阅读推进热区扩大到整个 GamePage 舞台的非交互空白，
并加上控件、滚动、拖动与文字选择的误触保护。

### 结构

| 文件 | 职责 |
|---|---|
| `src/utils/graphemes.ts` | Unicode 字素分割，优先 `Intl.Segmenter`，另有回退实现 |
| `src/utils/readingScroll.ts` | 剧情容器内部滚动的纯几何计算 |
| `src/utils/userPreferences.ts` | 本地用户偏好（目前只有 `autoplayEnabled`），独立 key、独立容错 |
| `src/hooks/useAutoplayPreference.ts` | 应用级持有自动播放偏好并即时持久化 |
| `src/components/story/AutoplayToggle.tsx` | 自动播放开关（原生 button + `aria-pressed`） |
| `src/utils/story/readingUnits.ts` | 面板类块的语义单元划分与「空块」判定，渲染与揭示计划共用 |
| `src/utils/story/readingPlan.ts` | 速度、标点停顿、段间停顿、揭示步骤、单块时长上限 |
| `src/utils/story/readingSequence.ts` | 纯阅读状态机、阅读阶段与调度决策 |
| `src/hooks/useStoryReadingSequence.ts` | 唯一的调度器与生命周期（逐字与段间共用） |
| `src/hooks/usePrefersReducedMotion.ts` | 减少动态模式，运行期切换也跟随 |

### 揭示模式

| 块类型 | 模式 |
|---|---|
| narration | 正文逐字（22ms/字素） |
| dialogue | speaker 立即显示，正文逐字（direct 18 / soft 26 / 其余 22） |
| quote | 逐字，较慢（32ms） |
| system | 标题立即显示，`lines` 按整行逐条（180ms/条） |
| record | 标题立即显示，`paragraphs` 与 `entries` 按语义单元逐条 |
| message | sender／timestamp／status 立即显示，`paragraphs` 逐条 |
| document | 标题立即显示，每个 section 的 heading 与 line 各占一个单元 |
| divider | 整体立即显示，一次轻淡入 |
| `pacing: 'instant'` | 整体立即显示 |
| 空块 | 自动跳过，不消耗一次点击 |

逐行只按数据结构里的 line／paragraph／entry／section line 划分，不按浏览器视觉换行。
标点停顿：`，、：；` +40ms，`。！？…` +95ms，段内换行 +100ms。
单块自动播放时长上限：字符型 6s、结构化 2.8s；超出时整体按比例缩短并合并成一次揭示多项，不删改任何内容。

### 自动播放与推进规则

「打字机揭示」和「自动播放」是两件事：不论偏好如何，当前 block 自身**始终**自动逐字／逐单元显示；
偏好只决定这一块显示完之后要不要自动进入下一块。自动播放**默认关闭**，由玩家用开关主动开启。

阅读阶段只有三个：

| 阶段 | 行为 |
|---|---|
| `revealing` | 按揭示计划推进字符或语义单元 |
| `interBlockDelay` | 当前块已完整；开启自动播放才排段间停顿，关闭则停在这里等玩家 |
| `sequenceComplete` | 整段结束，等玩家点击继续／探索／选项 |

段间停顿：普通正文 520ms、很短的一句 380ms、quote 760ms、结构化块 620ms、divider 320ms，
减少动态模式统一 110ms。最后一块显示完直接进入 `sequenceComplete`，不会为「进入下一个节点」安排任何 timer。

自动播放绝不跨越交互边界：不自动点继续、不自动进入下一稳定节点、不自动选择、不自动跳过探索、
不调用 `applyChoice`、不自行结束 `responseStage`、不动 StoryState／路由／存档。

一次有效输入只做一件事：

| 情况 | 一次输入的效果 |
|---|---|
| 自动播放开启 | `completeSequence()`：立即显示当前展示序列的全部 blocks，停在交互边界，偏好保持开启 |
| 关闭 · 当前块未显示完 | 只补全当前块，不进入下一块 |
| 关闭 · 当前块已完整 | 才进入下一块并开始它的揭示 |
| 整段已完成 | 忽略；继续、探索入口和选项必须由玩家显式点击 |

关闭开关时「立即刹车」：取消当前 reveal 或段间 timer、把当前 block 立刻补全、停在这里，
不进入下一块，也不等同于「显示整段」；若关闭时正处于段间等待，则只取消等待、停在当前完整块；
若整段已完成，只改偏好不触发任何动作。

防连跳靠同步 ref 上的状态推进，节流（80ms）只用来吃掉重复的物理事件。
移动端只监听 click / pointer，不叠加 touchend；阅读区域 `touch-action: manipulation`。

### 推进热区与误触保护

点击热区是整个 GamePage 舞台（`.screen--game`）的非交互空白：剧情阅读区、剧情列周围、
标题附近的空白、舞台背景都算。事件委托在舞台上，不绑定 document，也不影响 StartPage / EndingPage / 错误页。

排除规则集中在一个选择器里，不散落到各 handler：
`button, a, input, textarea, select, [role="button"], [data-no-story-advance]`。
自动播放开关、交互区（继续／探索／选项）和 AI 状态面板都带 `data-no-story-advance`，
开关与继续按钮另外 stopPropagation。以后新增设置控件只要加同一个属性即可。

还会忽略：pointer 位移超过 10px（触摸滑动、鼠标拖动、拖动滚动条）、按在滚动条上、
存在未折叠的文字选择。滚轮与触摸滑动本来就不产生 click，另外复用已有的滚动意图判断，
没有第二套手势系统。

### 自动播放偏好（独立于 I03 存档）

存储键 `mirror-agent:user-preferences`，结构 `{ version: 1, autoplayEnabled: boolean }`，
默认 `false`。由 `App` 通过 `useAutoplayPreference` 持有，所以节点切换、responseStage、
`sequenceKey` 变化都不会重置它；刷新、关闭浏览器、重新初始化、通关重开都保持。
EndingPage 不显示开关。

偏好与 I03 完全分离：不同的 key、不同的模块、互不读写。偏好不进入 `StoryState`、
不进 save schema、不进 `choiceHistory` / `responseStage` / 节点数据 / 剧情验证。
本阶段只加实际使用的 `autoplayEnabled`，不提前放音频字段（那属于 A01）。

容错：localStorage 不可用、getItem/setItem 抛错、JSON 损坏、根值不是对象、缺字段、
字段类型错误、未知字段，一律回落或忽略，绝不抛到渲染层。偏好损坏不影响剧情存档，
剧情存档损坏也不影响偏好读取（两个方向都有测试）。

### timer 与生命周期

逐字揭示与段间自动推进共用同一个调度器：整个展示序列同时最多只有一个活动 timer，
用递归的单次 `setTimeout`（不是 `setInterval`），也没有第二条与打字并行的 autoplay 定时线，
自动播放开关同样不另建 timer —— 偏好只是调度 effect 的一个依赖。
手动补全会让 effect 依赖变化，旧 reveal timer 被 cleanup 清掉并换代作废，然后重新排一次段间 timer；
手动跳过段间等待同理。timer 回调触发时会在最新状态上再判一次前置条件，与用户输入撞车时只有一次转换生效。
连续的空块在一次状态转换里一起跳过，instant 块之间通过受控调度推进，不会出现同步死循环或成串 setState。
`sequenceKey`（`node:${nodeId}` / `response:${choiceId}:${下一稳定节点}`）变化时清 timer、换代作废旧回调、重置全部进度。
`visibilitychange` 隐藏时逐字与段间推进一起暂停并清 timer，恢复后从当前阶段与进度继续，不按后台经过时间追赶。

### 固定高度剧情阅读区与内部滚动

`.screen--game` 是一屏高的固定舞台（`height: 100dvh` + `min-height: 0`），
剧情列用 `align-self: stretch`，`.game__text` 用 `flex: 1` + `min-height: 0` + `overflow-y: auto`
吃掉剩余高度，正文再长也只在它内部出现滚动条，document 不随 blocks 变高，`window.scrollY` 始终不动。
交互区（继续／探索／选项）在滚动容器之外，因此不会盖住滚动条，也不会被正文推走。
`.screen--game` 自身是 `overflow-y: auto` 而不是 `hidden`：正常情况下不会滚动，
只有「状态面板 + 标题 + 四个选项」本身就装不下一屏的窄矮手机才退化成舞台内滚动，保证选项始终可达。
`.screen` 加了 `position: relative`：`.sr-only` 是绝对定位的，没有已定位祖先时会绕过裁剪把 document 撑高。

自动跟随只调整容器的 `scrollTop`，不使用 `scrollIntoView`，也不碰 `window`。
只在开始新块、当前块被补全和整段完成时检查一次，不逐字滚动；滚动量按 `nearest` 语义取最小值，
比容器还高的块对齐到顶部。玩家主动往回读（滚轮／触摸／按键／拖滚动条）后当前块移出视野即停止跟随，
滚回来又恢复。减少动态模式用 `auto`，普通模式用一次很短的平滑滚动。
`App` 的 `window.scrollTo({ top: 0 })` 保留但只在真正换稳定节点时执行，显示回应期间不滚。

### 自动跳转

当前运行时没有任何「自动跳转」语义：`NodeUiHints.transition` 只是视觉提示，没有节点标记为自动前进。
因此没有实现节点级自动跳转，只有 `next` 的节点仍然由玩家点击继续。
自动播放只发生在同一个展示序列内部的 blocks 之间，不会跨节点。

### responseStage

选择提交仍然只调用一次 `applyChoice`：正式状态与存档在点击选项时就已提交，`responseStage` 只是临时展示阶段，
额外携带一个 `sequenceKey` 供打字机识别序列，不进存档。
response 复用同一套阅读规则：偏好关闭时逐块手动、开启时自动连播、开启时点击只完成这一份 response、
关闭开关只补全当前 response block。播完只进入 `sequenceComplete` 并显示「继续」，
不会自行清除 `responseStage`。回应读完后点「继续」只清除 `responseStage`，
不重复应用 effects、不重复写 `choiceHistory`、不重复解析 `next`。
回应期间刷新仍按 I03 恢复到已提交的稳定节点，并从该节点开头重新播放，不恢复回应，也不恢复字符进度。

### 可访问性与布局

逐字块用三层结构：`.sr-only` 承载完整语义文本（屏幕阅读器只读到完整句子），已显示层与未显示层都是 `aria-hidden`，
未显示层 `visibility: hidden` 保留完整高度与换行位置，因此逐字过程中没有布局抖动，320px 实测块高全程不变。
只用一处简短的 `aria-live="polite"` 播报「选择现已可用／本节文本已显示完毕」，不逐字播报正文。
阅读区域支持 Enter 与空格，空格阻止默认滚动，保留 focus-visible；只在键盘推进且焦点掉回 body 时接回焦点，不抢鼠标用户的焦点。
自动滚动只在开始新块和交互区出现时检查，且要求目标超出视野且玩家仍贴近底部，使用 `block: 'nearest'`，减少动态模式下不用平滑滚动。

### 验证结果

| 命令 | 结果 |
|---|---|
| `npx tsc -b` | 通过 |
| `npm run build` | 通过 |
| `npm test`（vitest，176 个用例，其中 I01 相关 127 个） | 通过 |
| `npm run validate:story` | 通过，0 error / 0 warning |

浏览器实测（1280×720 桌面、1280×620 矮桌面、320×640 移动）：
全程不点击时整个节点自行播完并停在继续／选项处，`documentElement.scrollHeight` 恒等于视口高度、
`window.scrollY` 恒为 0，正文只在阅读容器内部滚动，标题与状态面板固定不动；
自动播放在继续、选项、response 结束处停下并静置数秒不动，不会自动选择或自动继续；
打字中一次点击只补全当前段，段间等待中点击立即进入下一段，三连击不会跳过多段，Enter／空格与点击一致且阻止默认滚动；
roleplay／key response 自动播放到「继续」，点击继续前后存档字节不变（node／history／stats／tags 均无第二次变化）；
回应期间与打字中途刷新都恢复到已提交的稳定节点并从开头重播；重新初始化回到序章重新播放；
减少动态模式下每块立即完整显示、块间仍自动推进（10 块约 1.35 秒）并停在继续处；
页面隐藏 4 秒进度冻结、恢复后不追赶；第四章失控模式布局与常规一致；结局页仍是完整一次性渲染；
320×640 下无横向滚动，四个选项在舞台内滚动后完整可达；控制台无错误、无 React 警告。

第二次验收修订的浏览器实测：清空两份存储后首次进入自动播放为关、当前 block 揭示完即停住；
手动模式下点击进下一块、打字中点击只补全、静置不自跳；开启开关后当前节点自动播到交互边界并在选项处静置不选；
播放中关闭开关时当前 block 立即补全并停在原地（不进下一块、不整页显示），偏好写为关闭；
重新开启后点击剧情区或舞台左侧空白都立即显示整页并停在选项处，偏好仍为开启、node 与 choiceHistory 不变；
点状态面板、点开关都不推进；拖动后点击、有文字选择时点击、触摸滑动都不推进；
response 自动播完停在「继续」，点击只完成 response 不跨节点、存档字节不变，点继续后下一稳定节点继续自动播放；
刷新与从结局页重新初始化后开关仍为开启，EndingPage 不显示开关；
320×640 下无横向滚动、开关在滚动容器之外且点击目标 35px；空格在阅读区阻止默认并生效、焦点在开关上时不触发整页快进；
控制台无错误、无 React 警告。

未能在本环境验收的项：浏览器面板处于隐藏状态时不合成帧，`scroll` 事件与平滑滚动动画都不会触发，
因此「玩家主动向上滚动后不被拉回、滚回底部后恢复跟随」只能靠代码与纯函数测试
（`tests/readingScroll.test.ts` 覆盖最小滚动量与可见性判定）保证，需要在真实浏览器里再人工确认一次。

---

## I03 本地存档说明（2026-07-29）

存储键：`mirror-agent:story-save`。存档内容就是正式 `StoryState`，没有第二套状态结构。

### 只保存正式状态

保存 `schemaVersion` / `currentNodeId` / `stats` / `choiceHistory` / `tags` / `flags` / `visitedNodeIds` / `finalChoice` / `completed`。
不保存剧情正文、节点或结局对象、当前可见块、页面 screen、`responseStage`、临时快照、`currentStats` 展示副本、按钮锁与滚动状态、音频偏好，以及任何能由正式数据重新推导的内容（结局 ID 与结局正文都在刷新后用 `getEnding` 重新推导）。

版本以 `storyManifest.schemaVersion` 为唯一来源，当前阶段不迁移旧版本；带 `version` / `currentChapterId` / `choices` 的旧存档一律判为不兼容。

### 保存时机

开始新游戏、普通节点“继续”、选择解析出下一节点、到达结局门完成结局、重新初始化写入新初始状态。
`App.commitStoryState` 是正式状态的唯一提交口，提交内存状态与写入存档在同一处完成。

### responseStage 与结局事务

- 选择提交后立刻保存正式状态，此时 `currentNodeId` 已经是下一个稳定节点，`responseStage` 只用于当前会话展示；
- 在回应显示期间刷新，会直接恢复到选择后的稳定节点：跳过没看完的临时回应，不回到选择前节点，不重复应用变量、`choiceHistory`、tags 或 flags；
- 玩家正常读完回应点“继续”时只清除 `responseStage`，不重新应用选择；
- 最终选择落到 `ch5.ending_gate` 时，“计算结局 → 标记 `completed: true` → 保存”是同一次提交，存档里不会出现 `completed: false` 且停在结局门的中间态。

### 恢复与降级

| 情况 | 行为 |
|---|---|
| 无有效存档 | StartPage 只显示“开始初始化” |
| 有效未完成存档 | StartPage 显示“继续实验”和“重新初始化” |
| 有效完成存档 | 直接恢复 EndingPage，重新推导同一结局与路径回声，不显示继续入口 |
| 损坏 / 旧版本 / 引用失效 | 尝试清除后按无存档处理，删除失败也不会被恢复 |
| localStorage 不可用 | 按无存档处理，全程可正常游玩，只是不保存 |

校验会检查根值类型、`schemaVersion`、`currentNodeId` 存在性、四个 stats 为有限数字、`choiceHistory` 引用的节点／章节／选项及类型仍然一致、tags 与 flags 值类型、`visitedNodeIds` 存在性、`finalChoice` 合法性、`completed` 类型，并维护完成状态不变量（未完成存档不得停在结局门；完成存档必须停在结局门、写入 `finalChoice`、能重新推导出有效结局）。校验通过后返回重新组装的干净状态，存档里的多余字段不会进入内存。

`getItem` / `setItem` / `removeItem` / `JSON.parse` 与读取 `localStorage` 属性本身都各自容错，任何失败都不会抛到 React 渲染层，也不会显示阻断式错误页。

### 验证结果

| 命令 | 结果 |
|---|---|
| `npx tsc -b` | 通过 |
| `npm test`（vitest，49 个用例，其中 `tests/storySave.test.ts` 20 个） | 通过 |
| `npm run validate:story` | 通过，0 error / 0 warning |
| `npm run build` | 通过 |

浏览器实测：无存档只显示开始初始化；普通恢复后节点、变量、状态面板与历史一致；回应显示期间刷新恢复到下一稳定节点且变量与历史只变化一次；完成后刷新恢复同一结局报告；StartPage 与 EndingPage 的重新初始化都直接进入序章并重置全部状态；四种损坏存档均安全回到开始页且键被清除；`getItem` / `setItem` / `removeItem` 全部抛错时仍可从序章玩到结局并重新开始。320px 下两个按钮全宽堆叠、无横向滚动。

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
