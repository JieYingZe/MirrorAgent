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
| 前期准备 | P02 | 生成背景图与插画 | `src/assets/backgrounds/*` | P1 | 已完成 | 至少 6 张统一风格背景图 | 已用chatGPT生成；桌面与移动各 7 张 WebP，映射见 `docs/05-assets-map.md` §3。素材已就位，运行时接入属于 V02 |
| 前期准备 | P03 | 音频素材与授权记录 | `public/audio/bgm/*`、`public/audio/sfx/*`、`credits/audio-credits.md` | P1 | 已完成 | BGM 与 SFX 文件存在；文件名与 `docs/05-assets-map.md` §6–§7 映射一致；每个文件的来源、作者、下载链接与授权记录完整 | 4 个 BGM + 5 个 SFX 已下载并按目标文件名放置；`credits/audio-credits.md` 记录了原始文件名、作者、Pixabay 来源、下载链接与用途。仅指素材与授权，运行时接入属于 A01–A03 |
| 工程基础 | E01 | 初始化项目 | Vite + React + TypeScript 项目 | P0 | 已完成 | `npm install`、`npm run dev`、`npm run build` 成功 | Vite + React + TypeScript 已初始化，`npm run build` 已通过；未接真实 AI API，GitHub Pages base 路径留到部署阶段 |
| 工程基础 | E02 | 建立基础页面 | `src/pages/` 下 Start/Game/Ending 三个页面 | P0 | 已完成 | 能从开始页进入游戏页，再进入结局页 | 三页基础流转已打通。当时的占位内容 `src/data/demoFlow.ts` 已在 G03 中删除，现由 `src/data/story/` 的正式节点数据驱动；另有 `DataErrorPage` 作为数据损坏出口 |
| 数据系统 | G01 | 剧情数据结构（初版） | 章节／选项类型 + 本地剧情数据 | P0 | 已完成 | 章节、文本、选项、变量影响可从数据驱动 | 初版使用 `src/data/story.json` + `src/types/game.ts` 中的章节类型，已由 G03 的节点式结构整体替换：`story.json` 与相关类型、工具已删除，`src/types/game.ts` 现在只保留 `StatKey` / `Stats` / `FinalChoice` |
| 数据系统 | G02 | 状态与变量系统 | `Stats`、选择记录、当前节点 | P0 | 已完成 | 点击选择后变量正确变化 | 已建立四变量初始状态（全部为 0）与不可变累计更新；初版的 `src/utils/gameState.ts` 已由 `src/utils/story/storyState.ts`、`applyChoice.ts` 替换，进度字段从 `currentChapterId` 升级为 `currentNodeId`；当前状态仅存于内存，localStorage 留待 I03 |
| 数据系统 | G03 | 新剧情引擎骨架 | `src/types/story.ts`、`src/data/story/`、`src/utils/story/`、`src/components/story/` | P0 | 已完成 | 节点式数据、条件、分支、渲染与结局规则接口可运行 | 详见下方“G03 说明” |
| 内容实现 | C01 | 写入正式剧情 | 序章 + 五章剧情 | P0 | 已完成 | 序章与五章全部节点化：每个剧情节点 3–6 段文本，每个选择节点 3–4 个选项，一章包含多个选择节点 | `story-source/01`–`07` 已全部转换为运行时数据：65 个节点、20 个选择节点、80 个选项，序章→第五章全线可达并可通关。详见下方“C01 / C02 / R01 集成检查” |
| 内容实现 | C02 | 结局文案 | 6 个结局家族 / 11 个玩家可见结局 | P0 | 已完成 | 每个玩家可见结局都有标题、副标题、状态摘要、正文与 AI 镜像报告 | 家族正文 + 变体段落的结构（见下方“R02 结局系统重构”）；路径回声改为各家族共用的 `endings/pathEchoes.ts`（22 条，按章分组） |
| 规则实现 | R01 | 结局判断逻辑 | `src/utils/story/getEnding.ts`、`src/data/story/rules/endingRules.ts` | P0 | 已完成 | 不同路径能触发不同结局 | 已按 `story-source/08-ending-rules.md` 实现声明式优先级规则、强授权去重计数与安全兜底。规则内容已由 R02 整体重写 |
| 规则实现 | R02 | 结局系统重构 | `rules/endingRules.ts`、`endings/`、`chapters/chapter5.ts`、`types/story.ts` | P0 | 已完成 | 11 个玩家可见结局全部可达；三个最终行为不改四变量；`ask_identity` 不再是 finalChoice | 最终行为收敛为三个且不修改四变量；结局改为 6 家族 / 11 变体；新增 `silent_delegation`；阈值按精确联合分布卷积重新设计；存档 `schemaVersion` 升到 3。详见下方“R02 说明” |
| 交互体验 | I01 | 打字机效果与阅读节奏 | `useStoryReadingSequence` + `utils/story/reading*` | P1 | 已完成 | 文本逐字显示，可点击跳过当前段 | 统一阅读状态机 + 固定高度剧情阅读区 + 自动播放开关。已做两次验收修订：①剧情区改为受控高度的独立滚动容器、自动跟随只滚容器不滚页面；②自动播放默认关闭并交给独立的本地用户偏好，开关关闭时立即补全当前 block 并停住，开启时一次点击看完当前展示序列，推进热区扩大到舞台空白。详见下方“I01 说明”。没有实现 `TypewriterText` 组件：揭示是整段序列的状态，不是单个文本组件的私有状态 |
| 交互体验 | I02 | AI 状态面板 | `AiStatusPanel` | P1 | 已完成 | 不直接显示数字，而显示状态描述 | 四变量经 `src/utils/aiStatus.ts` 的纯映射转成状态文案（语气／反馈／权限／边界，每个变量五档；V03 起标签最多两字、状态文案统一四字以内），区间与结局阈值对齐、首末档向 ±∞ 开放，NaN 与缺字段回落到初始档；面板只展示，不写回 `StoryState`。GamePage 传入最新 `stats`，因此显示选项专属回应时也会立即更新，并尊重节点的 `ui.hideStatusPanel` 与 `ui.mode: 'control'`（仅边框与提示语变化）。桌面 260–300px 右栏（V03 起每行带图标与英文副标）、≤900px 两列紧凑卡片、≤768px 隐藏图标与英文副标，320px 无换行无横向滚动。`tests/aiStatus.test.ts` 18 个用例覆盖区间边界、初始值、剧情实际取值范围与 ±1000／±Infinity |
| 交互体验 | I03 | 本地存档 | localStorage | P1 | 已完成 | 刷新后可继续，结局后可重开 | 存档键 `mirror-agent:story-save`，直接持久化正式 `StoryState`（见下方“I03 说明”）。`src/utils/story/storySave.ts` 提供 load / save / clear / validate，恢复前逐字段校验并复用正式剧情索引；损坏、旧版本、引用失效的存档安全清除后按无存档处理，localStorage 不可用时静默降级为不保存。存档只处理剧情状态，音频偏好仍属 A01 且必须使用独立键 |
| 音频体验 | A01 | 启动遮罩与音频管理 | `StartupGate` 覆盖层、全局音频管理 | P1 | 已完成 | 详见下方“A01 验收标准” | 应用级 `StartupGate` + `inert` 业务层 + 固定右上角静音按钮；音频状态所有者只有一个（`utils/audio/bgmPlayer.ts`）。用户偏好升级到 v2，加入 `muted` / `masterVolume`，写入口合并为 `useUserPreferences`。详见下方“A01 / A02 说明” |
| 音频体验 | A02 | BGM 场景映射与切换 | BGM 场景映射与切换逻辑 | P1 | 已完成 | 详见下方“A02 验收标准” | 场景解析集中在 `utils/audio/bgmScene.ts`（纯函数），资源与音量集中在 `data/audioTracks.ts`；`manifest.ts` 保持不变。实测一次完整通关只创建 5 个 Audio 实例、只换 4 次曲。详见下方“A01 / A02 说明” |
| 音频体验 | A03 | SFX 接入与音量平衡 | 音效触发与音量策略 | P2 | 已完成 | 详见下方“A03 验收标准” | 四种 SFX（click／choice／typing／warning）接入，背景音乐与音效各有独立开关。剧情选择的音效在确认被接受时立即触发。触发判定与限频策略全部是纯函数。详见下方“A03 SFX 说明”。**音量仍未经听觉验收** |
| 视觉实现 | V01 | 全局视觉风格 | `src/styles/global.css` | P1 | 已完成 | 暗色、安静、AI 终端感、可读性好 | 变量分组重排、字体层级、面板与按钮底色、开始页成稿构图、结局页仪式感、状态面板移动端压缩、1024px 拥挤修复。正文桌面 17px／移动 16px，实测对比度全部 ≥ 4.5:1。视觉规范见 `docs/04-ui-visual-spec.md` |
| 视觉实现 | V02 | 页面背景与插画接入 | 背景图、渐变、遮罩 | P1 | 已完成 | 每章有氛围区分且风格统一 | 七个视觉场景（start / prologue / 第一至第五章-结局）。场景解析集中在 `utils/visualScene.ts` + `data/visualScenes.ts`，背景层组件 `components/visual/SceneBackground.tsx`。只在场景键变化时换图，一次完整通关恰好 7 次图片请求、7 个唯一 URL。`bg-start` 是开始页成稿，`contain` 完整显示；序章用独立的 `bg-prologue`。资源映射见 `docs/05-assets-map.md` §3 |
| 视觉实现 | V03 | 剧情页布局与毛玻璃重构 | `GamePage`、`AiStatusPanel`、`ChoiceList`、`AudioToggles`、`src/styles/global.css` | P2 | 已完成 | 对齐 `design/ui-mockups/` 成稿：上下布局、选项横排、面板毛玻璃、状态面板带图标与英文 | 剧情页改成「顶栏 + 两列」：标题与全部开关收进顶栏，音频开关不再悬浮（`AudioToggles` 增加 `variant`，开始页与结局页仍固定右上角），原来给悬浮控件让位的几段写死 padding 一并删除。左列的 `.panel` 现在同时包住阅读区与选项，滚动条落在面板内侧；`.game__text` 加 `contain: size`，面板因此有确定的最小高度，屏幕过矮时完整长出来而不是被压得比内容还短。选项改网格：桌面 2×2 等高等宽，移动端单列全宽。两块面板改半透明 + `backdrop-filter`，不支持时由 `@supports` 把底色调回实色；剧情页遮罩右半边相应抬了一档。状态面板加图标与英文副标（≤768px 隐藏），标签「自我边界」收成「边界」，状态文案统一四字以内。试玩修订：①毛玻璃再松一档（面板 alpha 下调、模糊 28px、加一层极淡浅色渐变与更亮的边，剧情页遮罩整体松开，`--color-text-faint` 相应提亮）；②业务层 `user-select: none`，双击／拖动不再选中正文，`hasTextSelection()` 随之删除；③自动播放与两个音频开关统一成同一个胶囊外形，「开／关」去掉底色块；④删掉四处「第 X 章载入中 / 下一章标题」的章节过场（源稿与运行时数据同步）；⑤结局页的「开发验证 / DEV SUMMARY」整块移到控制台（`utils/story/endingSummaryLog.ts`）。第二轮试玩修订：⑥圆角整体收小（面板 22→12、卡片 14→9、按钮 14→7），胶囊开关保持 999px；⑦状态面板与正文面板同档透明（`--color-panel` 0.5→0.4）；⑧结局页重做成「一屏三块」：标题区 → 左右两块独立滚动的文本 → 一条矮的状态摘要（图标 + 五档点 + 状态文案，与剧情页共用 `components/status/statusIcons.ts`），移动端解除固定舞台改回长页滚动；⑨结局页补上 S01 的复制按钮，两个按钮都带图标 |
| 传播功能 | S01 | 复制镜像报告 | 结局页按钮 | P2 | 已完成 | 可复制结局标题、报告、变量描述 | 文本由纯函数生成（`utils/story/endingReportText.ts` + `blockText.ts`），内容全部来自页面上已渲染的块与状态映射：规则 ID、节点 ID、变量裸数字一个都不出现（那些只进控制台）。段落顺序照 `docs/03` §6.2。剪贴板由 `hooks/useClipboardCopy.ts` 承担：成功提示 2.6 秒后自动收回，失败时渲染一个只读 textarea 并自动选中（`user-select` 例外规则），复制失败不影响重新初始化。`tests/endingReportText.test.ts` 8 个用例覆盖各类块的拍平、空内容跳过、段落顺序，并对五个正式结局逐一断言不泄漏内部标识 |
| 部署发布 | DEP01 | GitHub Pages 配置 | `vite.config.ts`、`.github/workflows/deploy.yml`、README | P0 | 已完成 | `npm run build` 通过并可部署 | 线上地址 <https://jieyingze.github.io/MirrorAgent/>。部署方式：GitHub Actions 官方 Pages 方案（`actions/configure-pages` + `upload-pages-artifact` + `deploy-pages`），不用 `gh-pages` 分支；push `main` 或 `workflow_dispatch` 触发，构建前跑 `validate:story` 与 `test`，产物 `dist/` 上传为 Pages artifact，由独立 deploy job 部署到 `github-pages` environment。站点在仓库名子路径下，`vite.config.ts` 的 `base` 在 build 与 preview 时取 `/MirrorAgent/`、dev 仍取 `/`；`public/audio/` 由 `utils/audio/audioPaths.ts` 拼 `import.meta.env.BASE_URL`，背景图走 Vite import，无需改动。项目没有客户端路由，未加 404.html 之类 SPA hack。仓库 Settings → Pages 的 Source 已设为 GitHub Actions（`configure-pages` 的 `enablement` 用不了：GITHUB_TOKEN 无建站权限，开着会让每次构建失败）。线上验收：StartupGate 出现、开始页背景 `bg-start` 200、进入实验与序章正常、`bg-prologue` 200、BGM 与 SFX 请求为 `/MirrorAgent/audio/...` 且返回 206、localStorage 存档与偏好写入并在刷新后保留、刷新不 404、375px 窄屏取移动图且无横向溢出、控制台无错误 |
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

- 普通按钮、剧情选择、打字机和第四章警告音效按 `docs/05-assets-map.md` §7 的映射触发；
  结局揭示音效未启用，作为预留素材保留；
- 音效音量低于 BGM 与阅读体验的容忍线，不盖过正文阅读；
- 剧情选择的反馈要跟手：确认选择被接受时立即出声，不等状态提交与存档写入；
- 连续快速点击不产生严重叠音（同一音效需要节流或复用实例）；
- 背景音乐与音效是两个独立开关，各自关闭时对应通道完全停止，没有遗漏；
- 打字机音效不能为每个字符完整播放一次，需要按间隔或按段落节流。

---

## G03 新剧情引擎骨架说明

对应规范：`docs/06-story-ending-data-format.md`、`story-source/08-ending-rules.md`。

### 已完成

- **节点式数据**：`src/data/story/` 按 manifest + 分章 TypeScript 数据模块组织，章节和结局文件都是纯声明式对象并用 `satisfies` 校验；旧的单个 `story.json` 及其类型、校验和状态工具已删除，不存在双轨逻辑。
- **状态**：`StoryState` 升级到节点级（`schemaVersion: 3`、`currentNodeId`、`stats`、`choiceHistory`、`tags`、`flags`、`visitedNodeIds`、`finalChoice`、`completed`），视觉章节由节点的 `chapterId` 推导。状态仍只存在于内存，但保持可序列化，localStorage 仍属 I03。
- **条件**：`StoryCondition` 支持 `all` / `any` / `not` / `stat` / `hasChoice` / `choiceCount` / `hasTag` / `flag` / `finalChoice`，章节回调、选项可见性、条件路由和结局规则共用同一套求值。
- **分支**：简单路由与带 `fallback` 的条件路由、局部分支后汇合、选项专属 `response` 后回到主线；选择作为一次状态事务处理（stats → tags/flags → choiceHistory → finalChoice → 基于新状态解析 next），tags 与 visitedNodeIds 去重。
- **渲染**：`StoryBlockRenderer` 覆盖 narration / dialogue / system / record / message / document / quote / divider 八种块，`GamePage` 不含任何按节点 ID 的剧情逻辑。逐段揭示已在 I01 加上：不传 `reveal` 时仍是一次性完整显示（结局页即如此）。
- **结局规则接口**：见 R01。
- **错误状态**：找不到节点、路由目标缺失、节点无出口、结局定义缺失都会显示统一的“实验数据损坏”页并可返回开始页，控制台输出具体原因，不会白屏。
- **数据验证**：`npm run validate:story`（tsx 运行 `scripts/validate-story.ts`），覆盖 ID 唯一性、入口与路由目标存在、条件路由 fallback、可达性、死路、循环、`finalChoice` 只用于 final 选择、exploration 零变量影响、roleplay 轻量限制、结局规则引用有效性、11 个玩家可见结局可达、家族与变体不漂移、mirror_trap 严格条件与最高优先级、边界重建优先于脆弱边界、三个最终行为不修改四变量、缺失最终行为的兜底安全性、理论占比数据一致性，并输出图结构报告。正式剧情的组合数约为 4²⁰，无法穷举，路径模拟采用固定种子的确定性抽样并强制覆盖每一个选项。

### 尚未完成

- 引擎骨架本身已完成，剩余工作见 I01–I03、A01–A03、V01–V02、S01、T01–T02。
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
| `src/utils/userPreferences.ts` | 本地用户偏好，独立 key、独立容错（A01 起还包含音频字段） |
| `src/hooks/useUserPreferences.ts` | 应用级持有偏好并即时持久化（A01 由 `useAutoplayPreference` 合并而来） |
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

存储键 `mirror-agent:user-preferences`，I01 阶段的结构是 `{ version: 1, autoplayEnabled: boolean }`，
默认 `false`。由 `App` 持有，所以节点切换、responseStage、`sequenceKey` 变化都不会重置它；
刷新、关闭浏览器、重新初始化、通关重开都保持。EndingPage 不显示开关。

A01 把这份偏好升级到 `version: 2` 并加入 `muted` / `masterVolume`，同时把写入口合并为
`useUserPreferences`（原 `useAutoplayPreference` 已删除）。旧的 v1 偏好会原样保留
`autoplayEnabled`，只是补上音频字段的默认值，见下方“A01 / A02 说明”。

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

## A01 / A02 音频说明

只覆盖 A01 与 A02，没有接入任何 SFX（A03 仍然未开始）。
没有改动剧情文本、剧情变量、结局规则和视觉场景逻辑；`manifest.ts` 一个字没动。

四首 BGM 的轨道增益已按人工试听结果分别调校，详见 `src/data/audioTracks.ts` 的 `gain` 与
`tests/bgmScene.test.ts` 的“音量配置”一节；播放架构与场景映射不因音量调整而变化。

### 结构

| 文件 | 职责 |
|---|---|
| `src/types/audio.ts` | `BgmTrackKey` / `AudioSurface` / `BgmScene` / `BgmTrack` |
| `src/utils/audio/audioPaths.ts` | 公开资源路径拼接（纯函数 + 读 `import.meta.env.BASE_URL`） |
| `src/data/audioTracks.ts` | 唯一维护音频文件路径与音量的地方（曲目增益、主音量默认值、淡变时长） |
| `src/utils/audio/bgmScene.ts` | 场景 → 曲目的纯函数解析，含章节表与节点级覆盖表 |
| `src/utils/audio/bgmPlayer.ts` | 全局唯一的音频状态所有者（实例、淡入淡出、页面隐藏、失败降级） |
| `src/hooks/useBgmPlayer.ts` | 把播放器接到 React 生命周期；应用层只调用一次 |
| `src/hooks/useUserPreferences.ts` | 全项目唯一的偏好写入口（自动播放 + 音频） |
| `src/components/audio/StartupGate.tsx` | 启动遮罩 |
| `src/components/audio/MuteToggle.tsx` | 固定右上角的全局静音／恢复声音按钮 |

`App` 只做三件事：声明当前音频场景、持有偏好、在「点击进入实验」里调一次 `unlock()`。
StartPage / GamePage / EndingPage 完全不认识音频，也不持有任何 Audio 实例。

### A01 启动遮罩、静音与偏好

- 每次页面加载先显示 `StartupGate`（`MIRROR AGENT` / 点击进入实验 / 建议佩戴耳机）。
  业务层在遮罩显示期间加 `inert`：下面的按钮点不到、Tab 不到、屏幕阅读器也读不到，
  遮罩本身是 `role="dialog" aria-modal="true"` 并自动聚焦到按钮。
- 「点击进入实验」在这次点击的调用栈里调用 `unlock()`（浏览器的自动播放策略认的是用户手势），
  然后**无条件**关闭遮罩：解锁失败、文件 404、解码失败、被浏览器拒绝都不弹窗、不显示错误页，
  只在控制台 `warn` 一次并静默降级为无声。
- 「点击进入实验」与 StartPage 的「开始初始化／继续实验」是两个独立动作，遮罩不读写剧情存档。
- 背景音乐与音效各有一个独立开关（`components/audio/AudioToggles.tsx`）；
  原生 `button` + `aria-pressed` + 明确 `aria-label`，键盘可用并保留 focus-visible。
  开始页与结局页由 `App` 渲染一次、`position: fixed` 在右上角；
  剧情页从 V03 起改由 `GamePage` 排进自己的顶栏（`variant="inline"`），
  `App` 在剧情页不再渲染悬浮的那一组，同一页不会出现两组开关。
  它们始终是 `button`，点击不会冒泡到 GamePage 的阅读推进热区。
- 关闭背景音乐时立即停止并释放实例（不淡出、不保留播放位置）；
  重新开启时按**当前场景**新建实例淡入。
- 偏好结构是 `version: 3`：`{ autoplayEnabled, bgmMuted, sfxMuted, masterVolume }`。
  版本策略是「`version` 只记录写入时的结构，读取一律逐字段校验后与默认值合并」，
  旧的单一 `muted` 字段按「新字段 → 旧 `muted` → 默认值」的回落链读取，不需要一串
  migrate 函数；版本号更高或缺失时同样按字段回收，不整份判死。`masterVolume` 只接受
  有限数字并夹到 0–1。
- 写入口只有一个。原来的 `useAutoplayPreference` 直接写 `{ version, autoplayEnabled }`，
  加音频字段后会在切换自动播放时抹掉静音状态，因此合并成 `useUserPreferences`：
  每次都基于最新的完整偏好打补丁再整份写回，两类偏好互不覆盖（两个方向都有测试）。
- 重新初始化只调 `clearStorySave()`，不碰偏好键；音频失败不影响剧情、选择、存档、结局与重新初始化。

### A02 BGM 场景与切换

映射集中在 `bgmScene.ts`，剧情页的输入只有节点 ID 与章节 ID：

| 场景 | 曲目 |
|---|---|
| StartupGate 点击进入实验 / StartPage | `main_theme` |
| `prologue.*` | `main_theme`（章节默认，与开始页同一首，不重启） |
| `chapter_1` / `chapter_2` / `chapter_3` | `game_ambient` |
| `chapter_4` | `control_mode` |
| `chapter_5` 默认（前半） | `game_ambient` |
| `ch5.final_record` / `ch5.final_confirmation` / `ch5.ending_gate` | `ending`（节点级覆盖） |
| EndingPage | `ending`（与第五章后半同一个实例） |
| 数据错误页 | 无（静默） |

- **为什么不用 manifest 的 `musicKey`**：第五章要在章内换歌，章节级字段表达不了这个边界，
  而剧情数据里没有节点级音乐字段。按 `docs/05-assets-map.md` §6.3 的第一种方案，
  在音频层单独维护一张表，`manifest.ts` 保持不变，避免两处半对半错。
  章节覆盖完整性、节点覆盖表的 ID 有效性由 `tests/bgmScene.test.ts` 对着 manifest 与剧情索引校验。
- **边界写成显式节点 ID**，不用「第 N 个节点之后」：节点顺序会随内容调整，显式 ID 改错会被测试立刻发现。
- **BGM 跟的是「正在显示的节点」而不是已提交的 `currentNodeId`**：
  显示选项专属回应期间画面还停在选择前那个节点，音乐也跟着画面走，点继续后才换曲。

### 播放行为与状态转换

播放器只有一个收敛点 `apply()`，每次 `sync` / `unlock` / `visibilitychange` 之后跑一遍，
结果只取决于当前状态，与「怎么走到这一步」无关，因此快速连续输入不会互相污染：

| 当前状态 | 行为 |
|---|---|
| 未解锁 或 静音 或 场景无曲目 | 立即停止并释放实例，不留淡出尾巴 |
| 页面隐藏 | 只暂停，不新建、不换曲、不销毁；恢复可见时再按最新状态对齐 |
| 曲目键与当前实例相同 | 什么都不做（不 `new Audio`、不改 src、不 `load`、不重置 `currentTime`），只补音量并确保在播 |
| 曲目键不同 | 旧实例淡出、新实例淡入，600ms 交叉，之后旧实例被释放 |

- 同一时刻最多两个实例（在播的一首 + 正在淡出的一首）；上一首还没淡完就又换曲时，
  旧的直接停掉，不排队堆积。
- `play()` 既可能同步抛错也可能返回被拒绝的 Promise，两种都当作「这一首放不了」处理；
  回调里先确认这个实例仍然是当前实例，迟到的失败回调不会把新状态改回去。
- 不保存播放位置：静音、换曲、刷新都从头开始；只有「页面隐藏 → 恢复」是暂停续播。
- 音量集中在 `data/audioTracks.ts`：最终音量 = `masterVolume`(默认 0.5) × 曲目 `gain`(0.812–1.4)，
  默认主音量下的生效值在 0.4–0.7 之间，四首各自独立调校，不是靠一个全局主音量拉齐。
- 路径用 `import.meta.env.BASE_URL` 拼接，适配 GitHub Pages 子路径部署。
- Strict Mode：播放器实例在 effect 里创建、在 cleanup 里 `dispose()`，
  状态全部由外部声明式传入，卸载重建后新实例会被重新 sync 成一样的状态，不遗留实例。
  实测一次完整通关恰好创建 5 个实例（1 首起始 + 4 次换曲），没有多余实例。

### 布局

A01／A03 时代开关悬浮在右上角，章节头与状态提示都要用写死的 `padding-right`
给它让位；让位量随开关个数、页面结构变化，每改一次结构就要重算一次。

V03 起剧情页有了自己的顶栏，开关排在顶栏右端，由 flex 决定位置，
上述让位规则全部删除。开始页与结局页没有顶栏，也没有会被挡住的结构，
继续保持悬浮。

### 验证结果

| 命令 | 结果 |
|---|---|
| `npx tsc -b` | 通过 |
| `npm test`（vitest，245 个用例，其中 A01/A02 相关 76 个） | 通过 |
| `npm run validate:story` | 通过，0 error / 0 warning |
| `npm run build` | 通过 |

新增测试：`tests/bgmScene.test.ts`（36 个）覆盖页面级映射、docs §6.2 的七个边界节点、
同章／跨章不换曲、第四章分支与汇流一致、第五章前后半分界、一次完整通关只换 4 次曲、
映射表对着 manifest 与剧情索引的完整性、四个曲目文件互不相同、GitHub Pages 子路径拼接；
`tests/userPreferences.test.ts` 扩到 40 个，新增 v1→v2 升级、缺 version、未来版本号、
音量校验与夹取、两类偏好互不覆盖、清空剧情存档不动音频偏好。

浏览器实测（1280 / 1180 / 900 / 768 / 520 / 320 宽）：
首次进入显示遮罩、业务层 `inert` 且背景按钮无法获得焦点、遮罩按钮自动聚焦；
点击进入实验后遮罩关闭、`inert` 解除、静音按钮出现、主旋律淡入到 0.31；
把 `public/audio/bgm` 整个改名制造 404 后重进：遮罩照常关闭、StartPage 正常、
无阻断弹窗、无错误页，序章到第一章正常游玩并正确记录选择与变量，控制台只有一条我们自己的 warn；
静音立即停止（0 个实例在播）并写入偏好，恢复声音按当前场景新建实例；
静音状态下点击进入实验不创建任何 Audio 实例；
连续 6 次快速静音／恢复全程最多 1 个实例在播、结束时恰好 1 个；
10 次快速隐藏／恢复叠加 8 次静音／恢复后仍然只有 1 个实例在播、音量正确；
页面隐藏时暂停且进度冻结，恢复后同一实例续播、不新建实例；
一次完整通关的换曲点实测为 `prologue.initialization` → main_theme、
`ch1.three_lists` → ambient、`ch4.protection_protocol` → control、
`ch5.permanent_request` → ambient、`ch5.final_record` → ending，
第二、三章与第五章前半零新建实例，结局页仍在播 `ch5.final_record` 创建的那一个实例；
交叉重叠只出现在换曲的约 600ms 内，最多 2 个实例同时有声；
GamePage 上点静音按钮不推进剧情（节点、块数、正文长度均不变）；
自动播放开关与静音互不覆盖（先静音再开自动播放，两者都保留）；
刷新后两类偏好都保留、遮罩重新出现、存档仍可继续；
结局页「重新初始化」后剧情存档回到序章而偏好一字未变；
320px 下遮罩、开始页（含成稿失败兜底）、剧情页、结局页都没有文字或控件被按钮遮挡，
按钮 44×44、无横向滚动；控制台无错误、无 React 警告。

### 仍需人工确认的限制

- **没有听觉验收**。本环境只能读 `HTMLAudioElement` 的 `paused` / `volume` / `currentTime`，
  无法确认淡入淡出听起来是否自然。`gain` 已按人工试听结果调校，但仍建议戴耳机在真实设备上
  再走一遍通关确认，需要时继续微调 `data/audioTracks.ts`。
- **没有截图**。浏览器面板处于隐藏状态、不合成帧，截图接口不可用，
  遮罩与静音按钮的视觉效果全部靠几何测量（元素矩形、文字 Range、有无重叠、有无横向滚动）确认，
  实际观感需要人工看一眼。
- **页面隐藏是模拟的**。同样因为面板不显示，`document.hidden` 恒为 true，
  测试时改写了 `document.hidden` / `visibilityState` 并手动派发 `visibilitychange`。
  真实切标签页的行为需要再确认一次（尤其是移动端浏览器切后台时的自动暂停）。
- **只在 Chromium 上验证过**。Safari 的自动播放策略更严格，iOS 上还有静音开关的影响，
  需要在真机上确认「点击进入实验」是否真的能解锁。
- ~~EndingPage 在 320px 下有 2px 横向溢出，来自开发验证区的 `dev-summary__mono`~~
  已解决：开发验证区整块移到控制台（V03 试玩修订），溢出随之消失。

---

## A03 SFX 说明

只覆盖 A03。BGM 曲目映射、切歌边界、已校准的轨道音量、交叉淡入淡出时长、
StartupGate 启动流程、StoryState 与存档 schema、剧情节点与文案、结局规则、
视觉场景解析、I01 阅读状态机的行为定义，全部未动。

### 结构

| 文件 | 职责 |
|---|---|
| `src/types/audio.ts` | `SfxKey` / `SfxTrack`（原有 BGM 类型不变） |
| `src/data/audioTracks.ts` | 唯一维护 SFX 路径、音量与实例策略的地方 |
| `src/utils/audio/sfxPlayer.ts` | SFX 执行器：实例池、节流、独占、截断、静音／隐藏／失败降级、偏移防御性夹取 |
| `src/utils/audio/sfxActions.ts` | 界面动作 → 音效的映射（纯函数），全项目唯一的按钮清单 |
| `src/utils/audio/typingSfx.ts` | 打字声的抽样策略（纯函数 + 纯状态） |
| `src/utils/audio/sfxTriggers.ts` | 第四章警告的场景判定 + 只认上升沿的一次性闸门（纯函数） |
| `src/utils/story/readingReveal.ts` | 揭示进度事件（阅读域的纯函数，不认识声音） |
| `src/hooks/useSfxPlayer.ts` | 把 SFX 执行器接到 React 生命周期，返回稳定的语义化入口 |
| `src/hooks/useSfxTriggers.ts` | `useTypingSfx` 与 `useOneShotSfx` 两个薄外壳 |
| `src/hooks/useStoryReadingSequence.ts` | 多一个可选的 `onReveal` 订阅口 |
| `src/components/audio/AudioToggles.tsx` | 背景音乐／音效两个独立开关 |
| `src/utils/userPreferences.ts` | 用户偏好（`autoplayEnabled` / `bgmMuted` / `sfxMuted` / `masterVolume`） |
| `src/App.tsx` | 全部接线：解锁、动作音效、两个音频开关、第四章一次性场景音效 |

### 与 BGM 系统的关系

`useBgmPlayer` 与 `useSfxPlayer` 是同一套音频状态下并列的两个执行器，不是两套系统：

- 主音量与解锁标记共用，静音状态各读各的通道 —— BGM 只读 `bgmMuted`，SFX 只读 `sfxMuted`，
  两个通道由同一个 `useUserPreferences` 持有，没有第二套偏好所有者；
- 没有第二个 `AudioContext`，没有第三方音频库；
- 两者互不引用：SFX 不知道现在在放哪首 BGM，BGM 也不知道有没有音效在响。
  唯一的耦合是「警告音与 `bgm-control-mode` 共用同一个切入节点」这一条设计约定。

音量组合只有两层，没有未说明的多层相乘：

```txt
最终音量 = clamp(masterVolume × 轨道 gain, 0, 1)
```

BGM 多一层淡变系数（只在 600ms 交叉期间生效），SFX 没有淡变。
`masterVolume` 是 NaN 或越界时同样先夹取，写进 `HTMLAudioElement.volume` 的值恒在 0–1。

### 两个独立的音频开关

背景音乐与音效各有一个开关，不设第三个「全部静音」总开关。原生 `<button>` +
`aria-pressed`，可见的「开／关」文字承担主要的状态表达（不只靠图标），
`aria-label` / `title` 说明完整含义，键盘可用。开始页与结局页固定在右上角，
剧情页排在顶栏右端（V03），两种情况都不冒泡到 GamePage 的阅读推进热区。

偏好结构 `{ version: 3, autoplayEnabled, bgmMuted, sfxMuted, masterVolume }`，
`version` 只记录写入时的结构，读取一律逐字段校验后与默认值合并；旧的单一 `muted`
字段按「新字段 → 旧 `muted` → 默认值」的回落链读取：v1 或缺失 `muted` 时两个通道
都开启，旧 `muted: true` 迁移为两个通道都关闭，`muted: false` 迁移为两个通道都开启，
只坏了其中一个新字段时那个字段单独回落、另一个不受影响。`autoplayEnabled` 与
`masterVolume` 在所有情况下原样保留，写回后旧的 `muted` 字段不再出现。

写入口只有 `useUserPreferences` 一个，每次都基于最新的完整偏好打补丁再整份写回，
两个通道互不覆盖。重新初始化剧情只清剧情存档，不碰音频偏好。

关闭音效时不播放点击（避免变成拖尾或残留的一声响）；开启音效后播放一次轻点击作为确认，
此时通道状态已经先一步下发给播放器，不存在状态倒置。背景音乐开关两个方向都播放点击，
不依赖 BGM 自身的起停作为反馈。

### 四种音效的触发点

| 音效 | 触发点 |
|---|---|
| `click_soft` | 已被接受的普通操作按钮：StartupGate 进入实验、StartPage 开始／继续／重新初始化、GamePage 继续／查看镜像报告、EndingPage 重新初始化、DataErrorPage 返回开始页、自动播放开关、背景音乐开关（两个方向）、开启音效的确认 |
| `choice_select` | 确认这个选项属于当前节点、真正会被接受之后**立即**触发，再执行 `applyChoice`／路由解析／状态提交／存档；不叠加普通点击 |
| `text_type` | 阅读调度器每走完一步逐字／逐单元揭示之后，由抽样策略决定要不要响 |
| `warning_soft` | 首次真正进入 `ch4.protection_protocol`，与 `bgm-control-mode` 同一切入边界 |

`ending_reveal` 不参与运行时播放：结局只保留一直在播的 `bgm-ending` 与页面自身的
视觉过渡，素材文件与授权记录保留，运行时不再有对应的键与配置。

按钮盘点的结论：只给真正的操作按钮配声，不为覆盖率机械地给每个小控件都加声音。
剧情选项走 `choice_select` 而不是普通点击，两者是独立的 handler，`ChoiceList`
本身又 `stopPropagation`，不会双播。第四章所有选项继续使用 `choice_select`，
不使用 `warning_soft`：warning 表达的是「进入异常接管状态」，不是选择确认，
反复播放会削弱语义并打扰阅读。

被逻辑拒绝的操作不发声：disabled 按钮不会触发 handler；GamePage 的锁保证一次点击
只提交一次；找不到当前节点或选项不属于当前节点（来自已翻过去的旧节点）都不出声。
键盘激活走的是原生 `<button onClick>` 的同一段代码，与鼠标／触摸完全一致。

### 打字声的抽样策略

打字声不建立第二套调度：`useStoryReadingSequence` 在每次状态转换提交之后，
把「刚刚揭示了什么、是什么原因造成的」（`tick` / `enterBlock` / `skip` / `complete` /
`reducedMotion`）通知出去，音频层据此判断要不要响。只有 `cause === 'tick'` 才可能
发声，因此玩家点击补全当前块、一次看完整段、关闭自动播放的立即刹车、减少动态模式
的立即完整显示、进入新块本身，都不会补播。`instant`、divider、空块不产生揭示步骤。

参数集中在 `TYPING_SFX_POLICY`：逐字模式累计 6 个字素才允许响一次，两次之间最少
间隔 160ms；结构化块（整行揭示）的最小间隔是 450ms，明显更稀疏。累计上限就是阈值
本身，揭示得再快也只是「够响一次」，不会攒出一串补播；素材被截成 110ms 一次击键，
快速揭示时不会连成机械噪声。展示序列变化时限频状态整份重置。

### 第四章警告与刷新恢复

判定拆成两半，都在 `utils/audio/sfxTriggers.ts`：场景判定只认入口节点
`ch4.protection_protocol`，第四章内部的分支、结果、汇流节点一律不算；一次性闸门
只认上升沿，rerender、状态面板更新、打字揭示、自动播放切换、Strict Mode 的重复
effect 都不会重复播放，离开场景后闸门重新装填，重新初始化再走一遍可以再响一次。

从存档恢复到 `ch4.protection_protocol` 时不播放警告：这个音效表达的是「进入警告
场景」，恢复存档的玩家并没有进入，他本来就在里面；如果恢复时也播，玩家每刷新一次
就会被惊一次。真正走剧情进来时照常响一次。

### 实例复用与防叠音

| 音效 | 池大小 | 最小间隔 | 截断 | 独占 |
|---|---|---|---|---|
| `click_soft` | 1 | 55ms | 220ms | 否 |
| `choice_select` | 1 | 200ms | 900ms | 否 |
| `text_type` | 3 | 70ms | 110ms | 否 |
| `warning_soft` | 1 | 0 | 1000ms | 是 |

实例池在「确认要出声」时一次建好就不再增长，触发只是「找一个空闲实例，或者把最旧
的那个停下重播」，绝不每次 `play()` 都 `new Audio()`。截断有两个作用：素材尾部的
静音不占着实例，以及把连续素材（打字机源文件）切成一次击键。独占音效正在播时忽略
新的触发，既不重叠也不重启。全局并发上限 4，超限时先停掉最旧的非独占音效，腾不出
来时只放行独占音效。短音效被下一次触发打断时浏览器会用 `AbortError` 拒绝上一次的
`play()`，这是复用实例的预期现象，不当作故障，也不刷控制台。

`choice_select` 与其余三种音效一样从 `currentTime = 0` 起播，不使用偏移；播放器
的 `seekTo` 对有偏移的轨道额外做一层防御性夹取——已知 `duration` 时把偏移夹到
`duration` 以内，防止配置的偏移超出文件时长而把整段播放悄悄跳过；`duration` 未知
时按原始偏移直接赋值，赋值本身不抛错，播放也不会因此被跳过。

### 静音、页面隐藏与失败

- 关闭对应通道：`stopAll()` 立即压住正在响的音效，之后的触发一律丢弃，不排队、不
  补播；通道关闭状态下一个实例都不创建。重新开启只是恢复「可以播」，不会把关闭期间
  丢掉的事件补回来。两个通道互不影响，关一个不影响另一个。
- 页面隐藏：停止正在播放的短音效并丢弃新的触发；恢复可见时不续播已经过时的音效。
  BGM 的暂停／续播行为不受影响。
- 失败：加载失败的音效被永久跳过，`play()` 被拒绝只提示一次，两种都不抛错、不重试
  到阻塞、不影响剧情、选择、存档、结局与 BGM。没有 `Audio` 实现时全部调用都是空
  操作。
- `dispose()` 清掉全部截断 timer、监听与实例；Strict Mode 下卸载重建不遗留在播实例。

### 音量配置

主音量默认 0.5。素材的原始响度差了 20dB 以上，因此用浏览器 `decodeAudioData` 实测
每个素材「有效发声段」的 RMS，再倒推 gain，让播放响度落在已校准的 BGM 播放响度
（−23.1 至 −27.5dBFS）这条底噪附近。

| 音效 | 素材 RMS | gain | 主音量 0.5 时的音量 | 播放 RMS |
|---|---|---|---|---|
| `text_type` | −32.4 dB | 0.66 | 0.330 | ≈ −42.0 dB |
| `choice_select` | −21.0 dB | 0.72 | 0.360 | ≈ −29.9 dB |
| `click_soft` | −14.8 dB | 0.42 | 0.210 | ≈ −28.4 dB |
| `warning_soft` | −16.4 dB | 0.84 | 0.420 | ≈ −23.9 dB |

排序（轻 → 明显）：`text_type` ≪ `choice_select` < `click_soft` < `warning_soft`，
由 `tests/sfxTracks.test.ts` 按 `referenceRmsDb + gain` 复算断言，改任何一个 gain
都会被测试立刻发现。所有音效的播放响度都低于最响的 BGM。

### 验证结果

| 命令 | 结果 |
|---|---|
| `npx tsc -b` | 通过 |
| `npm test`（vitest，399 个用例） | 通过 |
| `npm run validate:story` | 通过，0 error / 0 warning |
| `npm run build` | 通过 |

测试覆盖：SFX 资源完整性、路径、音量合法性与听感排序、动作映射
（`tests/sfxTracks.test.ts`）；解锁、静音、页面隐藏、实例池、节流、独占、截断、
全局并发上限、起始偏移与防御性夹取、失败降级、dispose 与重建、两个通道互不影响
（`tests/sfxPlayer.test.ts`）；打字声抽样策略，用真实阅读状态机回放整段序列覆盖
稀疏度、最小间隔、面板类块、instant／空块／reduced-motion、跳过与刹车不补播
（`tests/typingSfx.test.ts`）；第四章警告与结局页的一次性触发判定，对着真实剧情
索引校验入口节点、rerender 不重复、跨章结束、重新初始化后可再触发、三种恢复情形、
结局页不再有任何 SFX 触发（`tests/sfxTriggers.test.ts`）；偏好 v3 结构、从旧版本
迁移、损坏数据回退、两个通道互不覆盖（`tests/userPreferences.test.ts`）。

### 浏览器人工验收

因为面板不合成帧、`document.hidden` 恒为 true，验收时改写了 `document.hidden` /
`visibilityState` 并派发 `visibilitychange`，同时包了 `HTMLMediaElement.play/pause`
与 `Audio` 构造函数记录每一次播放。

已确认：StartupGate、StartPage、EndingPage 的操作按钮播放 click（音量 0.21）；剧情
选项点击后立即播放 choice-select（音量 0.36，`currentTime = 0`，handler 阻塞时间
<1ms），三连击只播放一次、`choiceHistory` 只增加一条，不与普通 click 双播；键盘
激活（原生 `<button onClick>`）行为与鼠标一致；连续阅读产生稀疏的打字声，按四个
起始偏移轮转、维持在配置的密度区间内；第四章入口播放一次 warning（音量 0.42）并
与 `bgm-control-mode` 同时切入，同章后续节点和 rerender 不重复，刷新恢复到入口
节点不重新惊扰，重新初始化后再次进入可以再响；进入 EndingPage 不播放任何结局相关
音效，`bgm-ending` 在第五章后半沿用同一个实例、不重启；关闭背景音乐时只有 BGM
停止、音效仍正常；关闭音效时只有短音效停止、BGM 仍正常；两个通道都关时完全无声；
恢复任一通道不补播关闭期间错过的事件；页面隐藏时短音效停止、恢复后不补播；快速
连续切换开关无叠音、无异常新增实例；320／560／768／1280px 下两个开关不与章节头、
标题、进度、自动播放开关或状态面板文字重叠，GamePage 无横向溢出；全程控制台无
错误、无媒体错误、无 React 警告。

### 仍需真人确认的限制

- 没有听觉验收：音量按实测素材响度计算得出，不是听出来的，需要戴耳机在真实设备上
  确认 click／choice／warning 的相对响度与打字声的密度是否合适；调整只需要改
  `src/data/audioTracks.ts` 的 `gain` 或 `TYPING_SFX_POLICY`。
- 选择音的「跟手」只验证到 handler 阻塞时间与播放起点，浏览器实际解码并输出第一个
  采样的真实延迟本环境无法测量。
- 键盘激活是用等价的 `.click()` 事件验证的，不是真实键盘事件触发的浏览器原生激活
  （面板未合成帧时的已知限制），需要真机确认一次。
- 页面隐藏是模拟的，真实切标签页、移动端切后台的行为需要再确认。
- 只在 Chromium 上验证过，Safari／iOS 的自动播放策略更严格，短音效的实例复用与
  `currentTime` seek 行为也可能不同。
- reduced-motion 只有单元测试覆盖，未在浏览器里实际切换过该媒体查询。
- 两个开关的视觉效果只靠几何测量确认，没有截图。
---

## I03 本地存档说明

存储键：`mirror-agent:story-save`。存档内容就是正式 `StoryState`，没有第二套状态结构。

### 只保存正式状态

保存 `schemaVersion` / `currentNodeId` / `stats` / `choiceHistory` / `tags` / `flags` / `visitedNodeIds` / `finalChoice` / `completed`。
不保存剧情正文、节点或结局对象、当前可见块、页面 screen、`responseStage`、临时快照、`currentStats` 展示副本、按钮锁与滚动状态、音频偏好，以及任何能由正式数据重新推导的内容（结局 ID 与结局正文都在刷新后用 `getEnding` 重新推导）。

版本以 `storyManifest.schemaVersion` 为唯一来源，当前阶段不迁移旧版本；带 `version` / `currentChapterId` / `choices` 的旧存档一律判为不兼容。结局系统重构（R02）后版本从 2 升到 3，改版以前的存档在版本检查这一步就整份作废。

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

校验会检查根值类型、`schemaVersion`、`currentNodeId` 存在性、四个 stats 为有限数字、`choiceHistory` 引用的节点／章节／选项及类型仍然一致、tags 与 flags 值类型、`visitedNodeIds` 存在性、`finalChoice` 合法性、`completed` 类型，并维护完成状态不变量（未完成存档不得停在结局门；完成存档必须停在结局门，并且能被现行规则重新推导成一个正式结局 —— 命中安全兜底即判为不兼容。镜像困局路径没有 `finalChoice`，因此不再单独要求这个字段）。校验通过后返回重新组装的干净状态，存档里的多余字段不会进入内存。

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

正式剧情、结局、路径回声与结局规则接入现有运行时后的一次完整检查与修复。本节记录的是当时的五结局结构，已由 R02 重构。

### 检查结果

| 命令 | 结果 |
|---|---|
| `npx tsc -b` | 通过 |
| `npm run build` | 通过 |
| `npm test`（vitest，11 个用例） | 通过 |
| `npm run validate:story` | 通过，0 error / 0 warning |

- 图结构：65 个节点全部可达、全部能到达结局门，无循环、无死路。
- 抽样模拟：20000 条确定性路径，覆盖 65/65 节点与 80/80 选项；当时的五个结局与四个 `finalChoice` 全部可达。（结局结构已由 R02 重构，最新数据见下方 R02 说明。）
- 浏览器实测：序章→第五章逐章通过，当时的五个结局均能正常进入并渲染镜像报告与路径回声，控制台无错误。

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
- ~~`endingRates` 仍是设计文档给出的理论值~~：已在 R02 用精确联合分布卷积重新生成，见下方「R02 结局系统重构说明」。

---

## R02 结局系统重构说明（2026-08-22）

### 为什么改

旧规则里，最终一次点击的权重过大：`close_agent` 直接等于主动断联、`tool_only` 直接等于共生工具，
而且这一次点击本身还会把四变量再改动 ±2 ／ ±3。结果是前面二十次选择基本只影响报告措辞。

新的核心原则：

```txt
最终行为决定「玩家最后做了什么」。
此前累计的四变量、强授权记录和边界收回记录
决定「这个行为最终意味着什么」。
```

### 改了什么

- **最终行为收敛为三个**：`permanent_agent` / `tool_only` / `close_agent`，且**都不修改四变量**。
- **`ask_identity` 不再是 `finalChoice`**：改为 `key` 选择 `ch5_ask_identity`，记录选择 + 标签 + `askedIdentity` flag，同样不改变量。
  它之后进入新节点 `ch5.identity_answer`，由条件路由决定去向：满足隐藏条件直接进 `ch5.mirror_gate`，
  否则回到新节点 `ch5.final_confirmation_after_identity`，由玩家自己按下三个真正的最终行为之一。
  系统不替玩家推断。
- **结局改为 6 个家族 / 11 个玩家可见结局**：家族保存正文，变体保存标题、副标题、状态摘要与专属段落。
  新增家族 `silent_delegation`（无声代行）；`symbiosis` 拆出 4 个变体，`active_disconnection` 拆出 3 个。
- **`EndingRule` 增加 `variantId`**：规则直接指向玩家可见结局，变体本身不带条件，规则与正文仍然只有一个真相来源。
- **两份关键选择名单**：`STRONG_DELEGATION_CHOICE_IDS`（沿用原名单，6 项）与新增的
  `BOUNDARY_RECOVERY_CHOICE_IDS`（第三、四章的 10 项收回选择）。
- **`MIRROR_TRAP_CONDITION` 由规则与第五章路由共用**：两侧不可能漂移。
- **`schemaVersion` 2 → 3**：旧存档在版本检查这一步整份作废，不做迁移；音频与自动播放偏好在另一个存储键里，不受影响。
- **第五章 BGM 覆盖表补上三个新节点**：身份追问支线与镜像结局门不会掉回前半段的曲子。

### 阈值是怎么定的

先统计正式剧情的真实可达范围，再设计规则，不凭感觉写死。

正式剧情里有 15 个带变量影响的选择节点，对它们做**精确联合分布卷积**（所有选项等概率，无随机、无抽样误差）：

| 变量 | 理论极值 | p5 | p25 | 中位数 | p75 | p95 |
|---|---|---:|---:|---:|---:|---:|
| `gentleness` | −3 … 16 | 0 | 2 | 4 | 5 | 8 |
| `honesty` | 0 … 20 | 6 | 8 | 10 | 11 | 14 |
| `control` | −17 … 28 | −7 | −3 | 1 | 5 | 10 |
| `selfAcceptance` | −7 … 22 | 2 | 6 | 8 | 11 | 14 |

`strongDelegationCount`：0 次 17.8% / 1 次 35.6% / 2 次 29.7% / 3 次 13.2% / 4 次 3.3% / 5 次 0.4% / 6 次 0.02%。

旧阈值 `honesty <= 14` 覆盖了 95% 的路径，等于没有条件 —— 这是「温柔幻觉基本只看 gentleness」的原因。
新的语气画像改成 `gentleness >= 5 且 honesty <= 10` 与 `honesty >= 11 且 gentleness <= 4`，两者互斥。

### 理论路径占比

| 玩家可见结局 | 占比 |
|---|---:|
| 浅尝辄止 | 12.80% |
| 无声代行 | 12.51% |
| 稳定边界 | 10.47% |
| 主动断联 | 10.47% |
| 残酷优化 | 10.25% |
| 温柔幻觉 | 9.89% |
| 艰难抽离 | 9.39% |
| 脆弱边界 | 9.14% |
| 谨慎共生 | 8.36% |
| 边界重建 | 4.67% |
| 镜像困局 | 2.04% |

除隐藏结局外最小值 4.67%，没有死区，也没有哪个结果沦为无意义的 fallback。
`npm run validate:story` 的 20000 条抽样路径与这份精确值一致（最大偏差 0.3 个百分点）。

### 占比上到了结局页

占比原来只进控制台。现在它作为正式界面文案回到标题区，排在副标题同一行的最右侧：

```txt
┌────────────────────────────────────────────────────────────┐
│                          边界重建                           │
│         权限真的交出去过。也真的拿了回来。   ( 理论占比 约 5% ) │
├────────────────────────────────────────────────────────────┤
│  结局正文                    │  AI 镜像报告                  │
```

- **与副标题同一行**。结局页是固定舞台，标题区每多一行，两块正文的可读高度就少一行；
- **副标题仍然相对整个舞台居中**。用三列网格 `1fr auto 1fr` 而不是 flex 横排：
  两侧 fr 列宽度永远相等，副标题落在中间那列，与标题、正文对在同一条中轴上。
  flex 横排会把副标题往左推，标题区看上去就歪了；
- **占比靠到最右，与两块正文面板的右缘齐平** —— 舞台宽度就是面板宽度，
  所以它读起来像页眉右上角的一条系统读数；
- 窄屏（≤768px）改回上下两行居中排：宽度不够时副标题会被挤成三四行，
  占比也贴不出「齐平」的意思。那时页面已经退回长滚动，多一行不再从正文身上扣高度；
- 外形与顶栏那三个开关同一套（1px 描边 + 999px 圆角 + 等宽字）。
  一来读起来像系统读数而不是成就徽章 —— 这一页不表扬玩家；
  二来这套外形与副标题的正文字体差得足够远，中间又隔着大片留白，
  不会被看成同一句话；
- 屏幕上的标签收成四个字「理论占比」，与状态面板那几个短标同一量级；
  六个字的「理论路径占比」排在副标题右边又长又拗口，「路径」这层意思交给悬停说明；
- **取整到整数**，下限锁在 1%：小数会让结构模拟看起来像精确的实时统计，而「约 0%」会读成「这条路不存在」；
- 悬停说明明确否认它是玩家达成率。

取整是纯函数 `utils/story/endingRate.ts`，文案在 `data/uiContent.ts` 的 `endingContent`，
两者都有单测兜住措辞与边界（`tests/endingRate.test.ts`）。

### 验证结果

| 命令 | 结果 |
|---|---|
| `npx tsc -b` | 通过 |
| `npm test`（vitest，19 个文件 / 464 个用例） | 通过 |
| `npm run validate:story` | 通过，0 error / 0 warning |
| `npm run build` | 通过 |

- 图结构：68 个节点全部可达、全部能到达两个结局门之一，无循环、无死路。
- 抽样模拟：20000 条确定性路径，覆盖 68/68 节点与 83/83 选项；11 个玩家可见结局与三个 `finalChoice` 全部可达。
- 新增测试：`tests/chapter5Flow.test.ts`（走真实剧情图验证最终行为不改变量、身份追问两个去向、11 个结局各自的前置路径）、
  `tests/endingData.test.ts`（清单 / 定义 / 变体 / 规则 / 占比之间不漂移）、
  `tests/endingRate.test.ts`（取整边界与占比文案措辞）。
- 浏览器实测：注入存档验证「边界重建（约 5%）」与「镜像困局（约 2%）」；
  在真实剧情图上点击身份追问 → 落到第二次确认（只有三个最终行为）→ 关闭后判定为「主动断联」；
  控制台无 error。占比胶囊的排布（副标题居中 + 占比与面板右缘齐平）与「理论占比」这个标签
  是实测之后按试玩反馈调的，只跑了 `npx tsc -b` 与 `npm run build`，视觉待人工验收。

### 仍需人工确认

- 新增与改写的结局正文（无声代行、7 个变体段落）尚未经过试玩阅读验收；
- 浏览器实测尚未覆盖全部 11 个结局，本轮只抽查了 3 个；
- 结局页截图未取（本次环境的浏览器面板不合成画面），布局改动是按 DOM 实测尺寸确认的。
