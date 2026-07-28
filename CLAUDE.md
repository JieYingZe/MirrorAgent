# CLAUDE.md — Mirror Agent 项目工作说明

项目名：镜中代理 / Mirror Agent  
类型：网页互动叙事游戏  
目标：做一个 10–15 分钟通关、可部署到 GitHub Pages 的 AI 心理寓言游戏。

## 重要入口文档

请优先阅读：

1. `docs/00-task-progress.md`：任务进度表与验收标准
2. `docs/01-requirements.md`：需求文档
3. `docs/02-game-design.md`：游戏设计文档
4. `docs/03-interaction-design.md`：交互设计文档
5. `docs/04-ui-visual-spec.md`：UI 与视觉效果文档
6. `docs/05-assets-map.md`：素材位置、背景图与音频映射
7. `docs/06-story-ending-data-format.md`：剧情与结局数据格式

剧情源稿：

- `story-source/00`–`07`：已确认的正式剧情源稿，是剧情正文的唯一来源；
- `story-source/08-ending-rules.md`：结局触发规则的唯一权威来源。

改动剧情或结局时，先改源稿，再同步运行时数据；不要只改其中一侧。

## 验证命令

```txt
npx tsc -b              类型检查
npm run build           构建
npm test                单元测试（vitest，tests/）
npm run validate:story  剧情图结构与结局规则验证
```

项目当前没有配置 lint，不存在 `npm run lint`。

## 开发原则

- 第一版不接真实 AI API，所有剧情、选择和结局都来自本地数据。
- 第一版优先保证完整体验：开始页 → 剧情章节 → 选择 → 状态变化 → 结局报告 → 重新开始。
- 不要把项目做成复杂游戏引擎项目；优先使用 Vite + React + TypeScript。
- 不要引入大型 UI 框架；视觉效果优先用 CSS、少量动画和本地图片完成。
- 不要在浏览器端写入任何真实 API Key。
- 文案风格要克制、安静、心理寓言感，不要中二、不要说教、不要鸡汤。
- 移动端体验必须可用，桌面端体验应更有沉浸感。
- 音频属于第一版 P1／P2，不是通关阻塞项；音频失败必须降级为无声，不能挡住剧情。
- 每次修改后请确保 `npm run build` 通过；改动剧情数据或结局规则时，还要跑 `npm test` 和 `npm run validate:story`。

## 推荐技术栈

- Vite
- React
- TypeScript
- CSS Modules 或普通 CSS
- lucide-react：用于少量线性图标
- GitHub Pages：静态部署

## 当前目录结构

```txt
src/
  App.tsx
  main.tsx
  data/
    initialGameState.ts
    uiContent.ts          非剧情的界面文案
    story/
      manifest.ts         章节顺序、入口节点、资源键
      index.ts
      chapters/           prologue.ts、chapter1–5.ts
      endings/            五个结局 + pathEchoes.ts + manifest.ts
      rules/              endingRules.ts、endingRates.ts
  types/
    game.ts               StatKey / Stats / FinalChoice
    story.ts              节点、文本块、条件、结局的全部类型
  utils/
    story/                applyChoice、evaluateCondition、getEnding、
                          getStoryNode、resolveRoute、validateStory 等
  components/
    story/                StoryBlockRenderer、TextBlocks、PanelBlocks、ChoiceList
  pages/
    StartPage.tsx
    GamePage.tsx
    EndingPage.tsx
    DataErrorPage.tsx
  styles/
    global.css
  assets/
    backgrounds/          desktop/ 与 mobile/ 各 6 张 WebP
    illustrations/        预留
public/
  audio/
    bgm/                  4 个 BGM
    sfx/                  5 个 SFX
credits/
  audio-credits.md        音频来源与授权记录
scripts/
  validate-story.ts
tests/
story-source/             已确认的剧情源稿
design/ui-mockups/        UI 参考图，不参与运行时打包
docs/                     00–06
```

## 禁止事项

- 不要在第一版加入账号系统、云存档、支付、排行榜、真实大模型调用。
- 不要生成依赖复杂后端服务的方案。
- 不要把剧情文案硬编码在组件里；剧情一律放在 `src/data/story/` 的数据模块中。
- 不要在章节或结局数据文件里写函数、React 元素或 CSS。
- 不要过度设计状态管理；第一版可以使用 React state + localStorage。
