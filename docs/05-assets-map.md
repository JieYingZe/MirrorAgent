# 《镜中代理》素材映射文档

版本：v0.2  
用途：说明项目中的 UI 参考图、运行时背景图、BGM、音效及其用途，供 Claude Code 开发时参考。

更新：2026-07-28 完成一次文档一致性整理，与仓库实际结构对齐。

---

## 1. 素材目录原则

本项目采用适合 Vite 的素材组织方式：

```txt
design/                 # 设计参考，不参与运行时打包
public/audio/           # 运行时音频，使用公开路径访问
src/assets/             # 运行时图片（只提交 WebP），由 Vite import 处理
```

规则：

- `design/` 中的素材只作为视觉参考，不应被代码 import。
- `src/assets/` 中的图片资源用于运行时页面背景和插画。
- `public/audio/` 中的音频资源用于运行时 BGM 和音效。
- 不要在第一版引入外部 CDN 音频或图片。

---

## 2. UI Mockups

UI 效果图位于：

```txt
design/ui-mockups/
```

这些图片仅用于开发参考，不参与运行时打包。

| 文件 | 用途 |
|---|---|
| `ui-start-desktop.webp` | StartPage 桌面版 UI 参考 |
| `ui-start-mobile.webp` | StartPage 移动版 UI 参考 |
| `ui-game-desktop.webp` | GamePage 常规模式桌面版 UI 参考 |
| `ui-game-mobile.webp` | GamePage 常规模式移动版 UI 参考 |
| `ui-game-control-desktop.webp` | GamePage 失控日志模式桌面版 UI 参考 |
| `ui-game-control-mobile.webp` | GamePage 失控日志模式移动版 UI 参考 |
| `ui-ending-desktop.webp` | EndingPage 桌面版 UI 参考 |
| `ui-ending-mobile.webp` | EndingPage 移动版 UI 参考 |

开发时不需要 100% 复刻效果图。效果图主要用于把握整体氛围：暗色、极简、AI 终端感、心理咨询室般安静，并优先保证可读性和完整交互流程。

---

## 3. Runtime Backgrounds

运行时背景图位于：

```txt
src/assets/backgrounds/
```

背景图用于 StartPage、GamePage、EndingPage，以及不同章节的氛围区分。

### 3.0 两类背景图，用法不同

| 类别 | 文件 | 性质 | 显示方式 | 页面配合方式 |
|---|---|---|---|---|
| 开始页成稿 | `bg-start` / `bg-start-mobile` | 画面里已经有英文标题、中文标题、副标题、右侧终端中文、渐变与光效，是成品画面 | `object-fit: contain`，完整显示不裁切 | StartPage 不渲染这些可见 DOM 文本，只放操作按钮；无全局遮罩，不压低不透明度 |
| 剧情氛围图 | 其余六张（含 `bg-prologue`） | 无海报文字的氛围底图，正文压在上面 | `object-fit: cover`，铺满不留白 | GamePage / EndingPage 叠页面级暗色遮罩，保证正文对比度 |

要点：

- 开始页与序章是**两张不同的图**：`bg-start` 是成稿，`bg-prologue` 是同一个房间但没有海报文字。
  因此「开始页 → 序章」会发生一次背景切换。
- StartPage 是成稿展示模式：`contain` 完整显示、无全局遮罩、图片保持原始亮度，
  四周露出与成稿边缘协调的暗色渐变，再用一圈很窄的 mask 把矩形边界化掉。
- 只有 `start` 用 `contain`；序章与各章节用 `cover`，不会因此出现留白。
- StartPage 保留一段视觉隐藏的标题与说明供屏幕阅读器读取；
  成稿加载失败时它转为可见兜底，背景退回 CSS 渐变。
- 不要为了「压掉成稿里的文字」而调低 `bg-start` 的不透明度或加满屏深色层。

### 3.0.1 格式转换

仓库只提交运行时用的 WebP。素材如果以 PNG 出稿，在同一目录转成 WebP，再自行删除或移出仓库：

```bash
npm run assets:convert -- src/assets/backgrounds/desktop/bg-prologue.png
```

默认输出到源文件所在目录的同名 `.webp`，quality 100，只转格式，不缩放／裁切／锐化／调色；
也可以显式给出第二个参数指定目标路径。脚本在 `scripts/convert-backgrounds.mjs`
（基于 `sharp`，devDependency），转换后会回读输出确认能解码、宽高与源图一致，并打印尺寸与文件大小。
源文件不存在、源与目标同路径、参数个数不对都会报错并返回非零退出码。

### 3.1 桌面端背景图

| 场景 | 文件 | 用途 |
|---|---|---|
| start | `src/assets/backgrounds/desktop/bg-start.webp` | 开始页成稿（`contain` 完整显示） |
| prologue | `src/assets/backgrounds/desktop/bg-prologue.webp` | 序章：创建你的代理 |
| chapter_1 | `src/assets/backgrounds/desktop/bg-efficiency.webp` | 第一章：效率焦虑 |
| chapter_2 | `src/assets/backgrounds/desktop/bg-relationship.webp` | 第二章：关系回声 |
| chapter_3 | `src/assets/backgrounds/desktop/bg-perfect-self.webp` | 第三章：完美版本 |
| chapter_4 | `src/assets/backgrounds/desktop/bg-control.webp` | 第四章：失控日志 |
| chapter_5 / ending | `src/assets/backgrounds/desktop/bg-ending.webp` | 第五章：关闭确认 / 结局页 |

### 3.2 移动端背景图

| 场景 | 文件 | 用途 |
|---|---|---|
| start | `src/assets/backgrounds/mobile/bg-start-mobile.webp` | 开始页成稿（`contain` 完整显示） |
| prologue | `src/assets/backgrounds/mobile/bg-prologue-mobile.webp` | 序章：创建你的代理 |
| chapter_1 | `src/assets/backgrounds/mobile/bg-efficiency-mobile.webp` | 第一章：效率焦虑 |
| chapter_2 | `src/assets/backgrounds/mobile/bg-relationship-mobile.webp` | 第二章：关系回声 |
| chapter_3 | `src/assets/backgrounds/mobile/bg-perfect-self-mobile.webp` | 第三章：完美版本 |
| chapter_4 | `src/assets/backgrounds/mobile/bg-control-mobile.webp` | 第四章：失控日志 |
| chapter_5 / ending | `src/assets/backgrounds/mobile/bg-ending-mobile.webp` | 第五章：关闭确认 / 结局页 |

背景图与章节的对应关系集中维护在代码里，页面和组件都不各自 import 图片：

```txt
src/types/visual.ts                    场景键与调校参数类型
src/utils/visualScene.ts               场景解析（纯函数，不 import 图片）
src/data/visualScenes.ts               唯一维护背景路径、object-position、不透明度的地方
src/components/visual/SceneBackground.tsx  渐变兜底 / 图片层 / 遮罩三层实现
```

剧情侧的唯一输入是 `src/data/story/manifest.ts` 里章节级的 `backgroundKey`，
不存在节点级背景字段。

---

## 4. Illustrations

插画目录位于：

```txt
src/assets/illustrations/
```

当前该目录为预留目录，可用于后续放置 logo、符号图、AI 终端碎片、镜像装饰图等素材。

如果第一版没有独立插画，可以暂时不使用该目录。

---

## 5. Runtime Audio

运行时音频位于：

```txt
public/audio/
```

音频资源分为 BGM 和 SFX：

```txt
public/audio/bgm/
public/audio/sfx/
```

音频文件用于运行时播放，不参与 UI mockup 或设计参考。

---

## 6. BGM 映射

BGM 位于：

```txt
public/audio/bgm/
```

### 6.1 场景映射

| 文件 | 覆盖范围 | 起始边界 |
|---|---|---|
| `bgm-main-theme.mp3` | StartPage 与序章 | 启动遮罩点击「点击进入实验」后开始 |
| `bgm-game-ambient.mp3` | 第一章至第三章，以及第五章前半 | 进入 `ch1.three_lists` 时切入；第五章前半从 `ch5.permanent_request` 起 |
| `bgm-control-mode.mp3` | 第四章：失控日志 / AI 临时接管模式 | 进入 `ch4.protection_protocol` 时切入 |
| `bgm-ending.mp3` | 第五章后半与结局页 | 进入 `ch5.final_record` 时切入，一直延续到 EndingPage |

### 6.2 切换边界

以真实节点 ID 表示，节点顺序见 `src/data/story/chapters/`：

```txt
StartupGate 点击进入实验      → bgm-main-theme
prologue.initialization      → bgm-main-theme（不切歌）
ch1.three_lists              → bgm-game-ambient
ch2.* / ch3.*                → bgm-game-ambient（不切歌）
ch4.protection_protocol      → bgm-control-mode
ch5.permanent_request        → bgm-game-ambient
ch5.final_record             → bgm-ending
ch5.final_confirmation       → bgm-ending（不切歌）
ch5.ending_gate → EndingPage → bgm-ending（不切歌）
```

说明：

- 第五章前半（`ch5.permanent_request` → `ch5.final_attitude`，节点进度 1/12–9/12）回到常规 BGM。第五章开场的正文明确写了第四章的警告色褪去、界面重新展开，继续用 `bgm-control-mode` 会与文本冲突。
- 第五章后半从 `ch5.final_record`（“最后一份镜像记录”，进度 10/12）开始。它是一个 `merge` 节点，所有路径必经且只有一个入口，可以作为可执行的切换边界；再往后就是最终确认，不适合在最终选择当中切歌。
- EndingPage 不重新开始 `bgm-ending`，直接沿用第五章后半已经在播放的实例。
- 除上表列出的边界外，其余节点跳转一律不换曲，也不重启当前曲目。

### 6.3 与 manifest 的关系

`src/data/story/manifest.ts` 目前只有章节级的 `musicKey`，且第五章整章标记为 `ending_theme`，与上面的“第五章前半 / 后半”边界不一致。

当前数据结构没有节点级的音乐字段，因此本节只是建议映射。A02 实现时需要先决定采取哪一种方式：

- 在音频层单独维护一张“节点 ID → BGM”覆盖表，manifest 保持不变；
- 或者为 `StoryNode` 增加可选的音乐字段，并同步更新 `manifest.ts` 与验证脚本。

在做出决定并实现以前，不要以 manifest 的 `musicKey` 为准。

BGM 应保持低存在感，服务于阅读氛围，不应盖过剧情文本。

---

## 7. SFX 映射

音效位于：

```txt
public/audio/sfx/
```

| 文件 | 用途 |
|---|---|
| `sfx-click-soft.mp3` | 普通按钮点击 |
| `sfx-choice-select.mp3` | 玩家选择剧情选项 |
| `sfx-text-type.mp3` | 打字机文字音效 |
| `sfx-warning-soft.mp3` | 第四章失控模式 warning |
| `sfx-ending-reveal.mp3` | 结局揭示音效 |

音效应轻、短、克制，不要打断阅读。

---

## 8. 启动遮罩与首页 BGM

本项目采用“启动遮罩”方案，让首页能够在有 BGM 的状态下展示，同时避免浏览器阻止自动播放有声音的音频。

流程：

```txt
打开网页
  ↓
显示 StartupGate / 启动遮罩
  ↓
用户点击「点击进入实验」
  ↓
尝试解锁音频并播放 bgm-main-theme.mp3
  ↓
进入 StartPage
  ↓
用户点击「开始初始化」或「继续实验」
  ↓
进入剧情
```

启动遮罩建议文案：

```txt
MIRROR AGENT

点击进入实验

建议佩戴耳机
```

要点：

- StartupGate 是应用级覆盖层，不是第四个核心业务页面；
- 音频解锁或播放失败时仍然进入 StartPage；
- 「点击进入实验」与「开始初始化」是两个独立动作，不合并。

交互状态与失败降级见 `docs/03-interaction-design.md` §3 与 §8，验收标准见 `docs/00-task-progress.md` 的 A01。

---

## 9. 音频来源记录

音频来源记录位于：

```txt
credits/audio-credits.md
```

新增或替换音频时，请同步更新该文件，记录原始文件名、作者、来源、下载链接、授权说明和用途。
