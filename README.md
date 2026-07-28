# MirrorAgent

网页互动叙事游戏《镜中代理 / Mirror Agent》。

你创造了一个 AI。后来，它开始创造你。

## 项目定位

《镜中代理》是一款 AI 心理寓言型网页互动叙事游戏。玩家通过一系列选择训练自己的 AI 代理，最终得到一份“AI 镜像报告”和对应结局。

第一版目标：

- Web 端运行
- GitHub Pages 静态部署
- 不接真实 AI API
- 剧情、选择、结局全部使用本地数据
- 10–15 分钟可完整通关

## 技术栈

- Vite
- React
- TypeScript
- CSS
- lucide-react

## 文档

开发前请先阅读：

```txt
CLAUDE.md                            项目工作说明
docs/00-task-progress.md             任务进度与验收标准
docs/01-requirements.md              需求文档
docs/02-game-design.md               游戏设计文档
docs/03-interaction-design.md        交互设计文档
docs/04-ui-visual-spec.md            UI 与视觉效果文档
docs/05-assets-map.md                素材位置、背景图与音频映射
docs/06-story-ending-data-format.md  剧情与结局数据格式
```

剧情源稿在 `story-source/`：`00`–`07` 是已确认的正式剧情源稿，`08-ending-rules.md` 是结局规则的权威来源。运行时数据由这些源稿转换而来。

## 本地开发

```bash
npm install
```

```bash
npm run dev
```

## 验证

```bash
npx tsc -b
```

```bash
npm run build
```

```bash
npm test
```

```bash
npm run validate:story
```

`npm run validate:story` 会检查剧情图结构、结局规则与理论占比数据。项目当前没有配置 lint。

## 目录结构

```txt
src/
  assets/backgrounds/   运行时背景图（desktop / mobile）
  components/story/     文本块渲染与选项列表
  data/story/           manifest、chapters、endings、rules
  pages/                Start / Game / Ending / DataError
  styles/global.css
  types/                game.ts、story.ts
  utils/story/          剧情引擎运行逻辑
public/audio/           bgm/ 与 sfx/
credits/                音频来源与授权记录
scripts/                validate-story.ts
tests/                  vitest 用例
story-source/           已确认剧情源稿
design/ui-mockups/      UI 参考图，不参与打包
docs/                   00–06
```

## 开发原则

- 优先完成完整体验，再打磨视觉和动画。
- 不要把剧情硬编码在组件里；剧情一律来自 `src/data/story/`。
- 不要在前端暴露任何 API Key。
- 文案保持克制、安静、心理寓言感。
- 音频是增强项：BGM 与静音控制为 P1，普通音效为 P2，失败时降级为无声。
