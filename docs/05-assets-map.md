# 《镜中代理》素材映射文档

版本：v0.2  
用途：说明项目中的 UI 参考图、运行时背景图、BGM、音效及其用途，供 Claude Code 开发时参考。

---

## 1. 素材目录原则

本项目采用适合 Vite 的素材组织方式：

```txt
design/                 # 设计参考，不参与运行时打包
public/audio/           # 运行时音频，使用公开路径访问
src/assets/             # 运行时图片，由 Vite import 处理
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
| `ui-start-desktop.png` | StartPage 桌面版 UI 参考 |
| `ui-start-mobile.png` | StartPage 移动版 UI 参考 |
| `ui-game-desktop.png` | GamePage 常规模式桌面版 UI 参考 |
| `ui-game-mobile.png` | GamePage 常规模式移动版 UI 参考 |
| `ui-game-control-desktop.png` | GamePage 失控日志模式桌面版 UI 参考 |
| `ui-game-control-mobile.png` | GamePage 失控日志模式移动版 UI 参考 |
| `ui-ending-desktop.png` | EndingPage 桌面版 UI 参考 |
| `ui-ending-mobile.png` | EndingPage 移动版 UI 参考 |

开发时不需要 100% 复刻效果图。效果图主要用于把握整体氛围：暗色、极简、AI 终端感、心理咨询室般安静，并优先保证可读性和完整交互流程。

---

## 3. Runtime Backgrounds

运行时背景图位于：

```txt
src/assets/backgrounds/
```

背景图用于 StartPage、GamePage、EndingPage，以及不同章节的氛围区分。

### 3.1 桌面端背景图

| 场景 | 文件 | 用途 |
|---|---|---|
| start / prologue | `src/assets/backgrounds/desktop/bg-start.webp` | 启动后首页 / 序章初始化 |
| chapter_1 | `src/assets/backgrounds/desktop/bg-efficiency.webp` | 第一章：效率焦虑 |
| chapter_2 | `src/assets/backgrounds/desktop/bg-relationship.webp` | 第二章：关系回声 |
| chapter_3 | `src/assets/backgrounds/desktop/bg-perfect-self.webp` | 第三章：完美版本 |
| chapter_4 | `src/assets/backgrounds/desktop/bg-control.webp` | 第四章：失控日志 |
| chapter_5 / ending | `src/assets/backgrounds/desktop/bg-ending.webp` | 第五章：关闭确认 / 结局页 |

### 3.2 移动端背景图

| 场景 | 文件 | 用途 |
|---|---|---|
| start / prologue | `src/assets/backgrounds/mobile/bg-start-mobile.webp` | 启动后首页 / 序章初始化 |
| chapter_1 | `src/assets/backgrounds/mobile/bg-efficiency-mobile.webp` | 第一章：效率焦虑 |
| chapter_2 | `src/assets/backgrounds/mobile/bg-relationship-mobile.webp` | 第二章：关系回声 |
| chapter_3 | `src/assets/backgrounds/mobile/bg-perfect-self-mobile.webp` | 第三章：完美版本 |
| chapter_4 | `src/assets/backgrounds/mobile/bg-control-mobile.webp` | 第四章：失控日志 |
| chapter_5 / ending | `src/assets/backgrounds/mobile/bg-ending-mobile.webp` | 第五章：关闭确认 / 结局页 |

建议在代码中集中维护背景图与章节的对应关系，避免在多个组件中分散硬编码路径。

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

| 文件 | 用途 |
|---|---|
| `bgm-main-theme.mp3` | 启动遮罩后首页 / 序章初始化 |
| `bgm-game-ambient.mp3` | 第一章到第三章常规剧情 |
| `bgm-control-mode.mp3` | 第四章：失控日志 / AI 临时接管模式 |
| `bgm-ending.mp3` | 第五章后半 / 结局页 |

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
显示轻量启动遮罩
  ↓
用户点击「点击进入实验」
  ↓
播放 bgm-main-theme.mp3
  ↓
进入 StartPage
  ↓
用户点击「开始初始化」
  ↓
进入序章 / 游戏流程
```

启动遮罩建议文案：

```txt
MIRROR AGENT

点击进入实验

建议佩戴耳机
```

启动遮罩不是正式游戏页面，只是一个轻量入口。

---

## 9. 音频来源记录

音频来源记录位于：

```txt
credits/audio-credits.md
```

新增或替换音频时，请同步更新该文件，记录原始文件名、作者、来源、下载链接、授权说明和用途。
