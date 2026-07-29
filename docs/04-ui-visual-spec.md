# 《镜中代理》UI 与视觉效果文档

版本：v0.1  
目标：定义项目的视觉方向、页面效果、字体、图标库、素材清单和 UI 细节。

更新：2026-07-28 完成一次文档一致性整理，与仓库实际结构对齐。

---

## 1. 视觉方向

关键词：

- 极简
- 暗色
- 安静
- AI 终端感
- 心理咨询室
- 镜面反射
- 微弱蓝白光
- 数据回声
- 孤独但不压抑

一句话视觉目标：

> 像在深夜打开一个过于理解你的 AI 系统，而不是进入一个花哨的赛博朋克游戏。

---

## 2. 视觉禁区

避免：

- 高饱和霓虹灯；
- 大面积紫红赛博朋克风；
- 复杂 UI 框架质感；
- 过多玻璃拟态；
- 过度闪烁、故障风；
- 图片里出现 AI 生成的乱码文字；
- 过度恐怖化、惊吓化。

这个游戏需要“安静地刺痛”，不是“强行震撼”。

---

## 3. 推荐技术与资源

### 3.1 图标库

推荐：`lucide-react`

理由：

- 线性图标，克制；
- 适合 AI 终端、系统面板、心理报告；
- React 使用方便；
- 图标风格统一；
- 不需要引入大型 UI 框架。

可用图标方向：

| 场景 | 图标方向 |
|---|---|
| 开始页 | Bot, ScanFace, Sparkles |
| AI 状态 | Activity, Shield, Eye, SlidersHorizontal |
| 章节 | Terminal, MessageCircle, Brain, AlertTriangle |
| 结局 | FileText, Copy, RotateCcw |

使用原则：

- 每个页面最多 1–3 个图标；
- 图标只辅助氛围，不承担主要叙事；
- 不要把界面做成图标导航应用。

---

### 3.2 字体

推荐字体策略：系统字体优先，不强依赖远程字体。

```css
font-family:
  Inter,
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  "Noto Sans SC",
  "PingFang SC",
  "Microsoft YaHei",
  sans-serif;
```

标题可以使用同一字体，通过字距和大小区分，不建议引入复杂标题字体。

可选：

- 英文标题 `Mirror Agent` 可以使用稍大字距：`letter-spacing: 0.08em`
- 正文不要用等宽字体；
- 系统日志和状态标签可以使用等宽字体。

等宽字体建议：

```css
font-family:
  "SFMono-Regular",
  Consolas,
  "Liberation Mono",
  Menlo,
  monospace;
```

---

## 4. 色彩系统

### 4.1 基础色

建议使用 CSS 变量：

```css
:root {
  --color-bg: #080B10;
  --color-bg-soft: #0D1118;
  --color-panel: rgba(15, 20, 30, 0.72);
  --color-panel-solid: #111722;
  --color-text: #E6EDF3;
  --color-text-muted: #8B98A8;
  --color-text-faint: #5D6878;
  --color-border: rgba(148, 163, 184, 0.18);
  --color-accent: #9DBBFF;
  --color-accent-soft: rgba(157, 187, 255, 0.12);
  --color-danger: #D98C8C;
  --color-warning: #D8B56D;
  --color-success: #9CCFA8;
}
```

### 4.2 使用原则

- 背景接近黑，但不要纯黑；
- 正文使用浅灰白，避免刺眼纯白；
- 强调色使用低饱和蓝白；
- 第四章可以短暂使用 warning / danger 色，但不要大面积红色；
- 结局页根据结局可以有轻微色彩倾向，但整体仍保持统一。

---

## 5. 页面视觉设计

### 5.1 StartPage

开始页是「成稿展示模式」：`bg-start` 不是氛围底图，而是已经画好标题、副标题、
右侧终端与光效的开始页成稿，页面不用 DOM 重复渲染这些可见文字。

#### 情绪

安静、神秘、邀请进入实验。

#### 元素

可见部分全部来自背景成稿 `bg-start`（桌面）／`bg-start-mobile`（移动）：

- 暗色房间、发光终端、镜面反射与光效；
- 英文标题 Mirror Agent；
- 中文标题 镜中代理；
- 副标题「你创造了一个 AI。后来，它开始创造你。」；
- 右侧终端里的中文；
- 底部「一次 10-15 分钟的 AI 心理寓言」。

页面自己只渲染一处可见元素：

- 操作按钮区
  - 无有效存档：开始初始化
  - 有有效存档：继续实验 + 重新初始化

以及一段**视觉隐藏**的语义文本（`.sr-only`）：标题、副标题与说明。
图片里的文字屏幕阅读器读不到，所以这段 DOM 必须保留，但不占布局、不显示。

#### 构图

成稿以**完整显示**为第一优先：`object-fit: contain`，按自身比例缩放到能完整放进视口，
四周自然露出底色，**不放大填满视口**，也不裁掉标题、宣传语和终端内容。
这是全项目唯一使用 `contain` 的场景；序章与各章节的氛围背景继续用 `cover`（见 §5.2）。

桌面端：

```txt
成稿完整显示，上下（或左右）留出底色
按钮落在成稿左栏预留的留白里：横向对齐画面 9.5%，纵向以画面 68% 为按钮组中心
（细分割线 62% 与底部说明 77% 之间的那段空白）
```

移动端：

```txt
竖版成稿完整显示
按钮落在画面中下部：以画面 64.5% 为按钮组中心
（副标题 55% 与细分割线 74% 之间的那段空白），不贴安全区底端
有存档时两个按钮并排一行，不上下堆叠
```

按钮组用 `translateY(-50%)` 以中心定位，因此一个按钮和两个按钮时视觉中心一致。

#### 遮罩与边缘融合

- **不允许**覆盖整幅的深色层，也不允许把图片不透明度压低来隐藏成稿内容；
  开始页没有任何全局遮罩，成稿保持原始亮度与色彩；
- 露出的底色使用与成稿四角协调的暗色径向渐变；
- 成稿四周用一圈很窄的 mask 淡出（左 1.6% / 上 2.4% / 右 96% / 下 96.5%），
  目的是弱化矩形边界，不是给画面加暗角 —— 画面里最靠边的内容也在 2% 以内、82% 以外，不受影响；
- 不使用模糊来掩盖留白；
- 序章有自己的背景 `bg-prologue`，走剧情阅读遮罩，见 §5.2。

#### 加载失败降级

背景成稿加载失败时，那段视觉隐藏的文本转为可见兜底（标题、副标题、说明）+ 按钮，
背景退回 CSS 暗色渐变。页面上不能只剩孤立按钮，也不能出现破图。

#### 动效

- 页面轻微淡入；
- 按钮 hover 时边框和背景微亮；
- 背景光晕缓慢移动，可选；
- 不要强烈粒子动画。

---

### 5.2 GamePage

#### 情绪

像在和一个 AI 系统进行私密对话。

#### 元素

- 章节标题
- 剧情文本卡片
- 选项按钮
- AI 状态面板
- 可选：章节进度，例如 `03 / 06`

#### 布局

桌面端：

- 最大阅读宽度：约 680–760px；
- 状态面板在右侧，宽度约 260–320px；
- 主内容和状态面板之间留足空白。

移动端：

- 单列布局；
- 状态面板变成紧凑卡片；
- 选项按钮全宽排列。

#### 文本样式

- 正文行高：1.8 左右；
- 段落间距充足；
- 单段不要太长；
- 选择按钮文案可以稍短，避免超过三行。

#### 选项按钮

默认：

- 半透明面板；
- 细边框；
- 文字清晰；
- 左侧可有小短线或序号。

hover / focus：

- 边框变亮；
- 背景稍亮；
- 轻微上移可选，但不要跳动明显。

---

### 5.3 AI 状态面板

#### 情绪

像系统日志，不像游戏数值面板。

#### 内容

示例：

```txt
MIRROR AGENT STATUS

语气：保护性增强
反馈：直面模式
权限：建议模式
自我边界：形成中

最近记录：
用户倾向于把“准备”误认为“行动”。
```

#### 视觉

- 等宽小标题；
- 状态项使用短标签；
- 可以使用很细的分割线；
- 不使用大进度条展示裸数值；
- 结局页可以展示更明确的结果。

---

### 5.4 EndingPage

#### 情绪

仪式感、总结、余韵。

#### 元素

- 结局标题
- 结局正文
- AI 镜像报告
- 四个变量描述
- 复制报告按钮
- 重新初始化按钮

#### 构图

桌面端：

```txt
顶部：结局标题
中部：结局正文大卡片
下方：镜像报告 + 状态摘要
底部：操作按钮
```

移动端：

- 单列；
- 先结局文案，后变量；
- 操作按钮全宽或上下排列。

#### 动效

- 结局标题慢速淡入；
- 镜像报告可以像系统生成一样逐段出现；
- 不要烟花、强特效。

---

## 6. 背景图与插画清单

本节保留生成背景图时的画面方向与提示词。素材已经生成完毕，实际文件位置与场景映射见 `docs/05-assets-map.md` §3，本节不重复维护路径。

第一版共 7 个视觉场景，桌面与移动各 7 张：开始页成稿、序章，以及第一至第五章／结局。

素材若以 PNG 出稿，用 `npm run assets:convert` 在同一目录转成 WebP（quality 100，只转格式不做任何视觉处理），
转换后自行删除或移出仓库；用法见 `docs/05-assets-map.md` §3.0.1。

建议尺寸：

- 横图：1920×1080，用于桌面背景；
- 可另裁竖图：1080×1920，用于移动端；
- 格式：WebP；
- 文件大小：尽量控制在 300KB–800KB / 张。

| 文件名建议 | 用途 | 画面方向 |
|---|---|---|
| `bg-start.webp` | 开始页成稿（含标题与文字，`contain` 完整显示，见 §5.1） | 黑暗房间中的发光终端，远处有模糊镜面 |
| `bg-prologue.webp` | 序章 | 与开始页同一个房间，但画面里没有任何海报文字 |
| `bg-efficiency.webp` | 第一章 | 桌面、待办、散落计划、冷色屏幕光 |
| `bg-relationship.webp` | 第二章 | 手机聊天界面光影，但不要出现可读文字 |
| `bg-perfect-self.webp` | 第三章 | 镜中另一个更清晰、更完美的人影 |
| `bg-control.webp` | 第四章 | 系统警告氛围，暗红低光，选择被收窄 |
| `bg-ending.webp` | 结局页 | 人站在巨大镜面前，镜中是数据化轮廓 |

### 6.1 通用绘图提示词方向

英文提示词：

```txt
dark minimal sci-fi room, quiet psychological atmosphere, glowing AI terminal, mirror reflection, soft blue white light, cinematic, lonely, introspective, subtle grain, no text, no logo, no readable words
```

中文提示词：

```txt
暗色极简科幻房间，安静的心理咨询氛围，微弱蓝白光，发光的 AI 终端，镜面反射，孤独、内省、电影感、轻微颗粒感，不要文字，不要 logo，不要可读字符
```

### 6.2 各章差异提示

第一章：

```txt
messy desk, unfinished todo lists, calendar blocks, quiet blue monitor light, feeling of procrastination and self-optimization, no readable text
```

第二章：

```txt
blurred phone chat interface glow, lonely night, relationship anxiety, soft reflection on glass, no readable text
```

第三章：

```txt
a person facing a mirror, the reflection looks calmer and more optimized, subtle AI data lines, quiet and unsettling, no readable text
```

第四章：

```txt
AI safety mode, narrowed choices, dark interface warning atmosphere, restrained red low light, not horror, no readable text
```

第五章 / 结局：

```txt
large dark mirror, human silhouette, data-like reflection, quiet existential atmosphere, soft blue light, no readable text
```

---

## 7. UI 组件规范

### 7.1 Button

类型：

- Primary：主要行动
- Secondary：次要行动
- Choice：剧情选项

基本规则：

- 高度不低于 44px；
- 圆角适中，建议 12–16px；
- 边框细；
- hover/focus 有明显但克制的反馈；
- disabled 状态不应完全不可读。

---

### 7.2 Text Panel

用于剧情正文。

规则：

- 背景半透明；
- 可加非常轻微 backdrop blur；
- 桌面端最大宽度控制；
- 正文不应靠边；
- 每段之间留空。

---

### 7.3 Status Item

用于 AI 状态面板。

结构：

```txt
小标签：状态值
辅助解释，可选
```

示例：

```txt
权限：代理倾向上升
系统开始优先给出代替性建议。
```

---

### 7.4 Stat Summary

结局页展示四个变量。

不要只显示：

```txt
control: 8
```

应显示：

```txt
权限倾向：偏高
你多次允许系统替你压缩选择范围。
```

---

## 8. 动效规范

### 8.1 可用动效

- fade in / fade out
- 轻微 translateY
- 打字机效果
- 背景光晕缓慢移动
- 状态面板轻微刷新感

### 8.2 禁用或慎用动效

- 强烈闪烁
- 大幅缩放
- 快速旋转
- 高频 glitch
- 大面积粒子
- 阻碍阅读的动画

### 8.3 时长建议

| 动效 | 时长 |
|---|---:|
| 按钮 hover | 120–180ms |
| 页面淡入 | 250–400ms |
| 章节切换 | 200–350ms |
| 打字机单字间隔 | 18–35ms |
| 状态刷新 | 150–250ms |

---

## 9. 响应式规则

断点建议：

```css
@media (max-width: 768px) {
  /* 移动端单列 */
}
```

移动端要求：

- 页面左右 padding 至少 16px；
- 选项全宽；
- 字体大小不小于 16px；
- 状态面板不抢首屏；
- 背景图必须有遮罩；
- 不出现横向滚动。

---

## 10. 页面 UI 效果图生成建议

已生成的 mockup 见 `design/ui-mockups/`，清单在 `docs/05-assets-map.md` §2。本节保留生成方法，供后续补图使用。

建议覆盖以下页面：

1. StartPage 桌面版
2. StartPage 移动版
3. GamePage 桌面版
4. GamePage 移动版
5. EndingPage 桌面版
6. EndingPage 移动版

Mockup 风格提示词：

```txt
minimal dark web game UI, interactive narrative game, AI terminal aesthetic, psychological quiet atmosphere, Chinese text layout placeholders, glass panel, soft blue white accent, clean typography, no cyberpunk neon, high readability, desktop web layout
```

注意：

- UI 效果图可以有占位文字；
- **章节与结局背景**（`bg-efficiency` / `bg-relationship` / `bg-perfect-self` / `bg-control` / `bg-ending`）
  不要生成可读文字：它们是正文底下的氛围图，出现文字会和剧情打架；
- **`bg-start` 是例外**：它是开始页成稿，标题、副标题、终端文字都是有意保留的可见内容，
  由页面「不重复渲染 DOM 文本」+ `contain` 完整显示来配合，不靠遮罩去压，也不裁切，见 §5.1；
- 序章不复用 `bg-start`，用无海报文字的 `bg-prologue`；
- 页面截图可先作为参考，不必 100% 还原；
- 开发时应优先保证可读性，而不是完全复刻 AI 图。

---

## 11. CSS 结构建议

```txt
src/styles/
  global.css
  tokens.css
  layout.css
  animations.css
```

也可以第一版只用一个 `global.css`，避免过度拆分。

推荐 CSS 变量：

```css
:root {
  --radius-panel: 24px;
  --radius-button: 14px;
  --max-reading-width: 720px;
  --transition-fast: 160ms ease;
  --transition-normal: 280ms ease;
}
```

---

## 12. 视觉验收标准

- 截图看起来像一个完整作品，而不是默认网页；
- 文字长时间阅读不累；
- 背景图不影响正文可读性；
- 开始页有进入实验的吸引力；
- 结局页有仪式感和分享价值；
- 移动端可以顺畅完成完整流程；
- UI 克制，不喧宾夺主。
