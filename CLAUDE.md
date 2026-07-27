# CLAUDE.md — Mirror Agent 项目工作说明

项目名：镜中代理 / Mirror Agent  
类型：网页互动叙事游戏  
目标：做一个 10–15 分钟通关、可部署到 GitHub Pages 的 AI 心理寓言游戏。

## 重要入口文档

请优先阅读：

1. `docs/00-task-progress.md`：任务进度表
2. `docs/01-requirements.md`：需求文档
3. `docs/02-game-design.md`：游戏设计文档
4. `docs/03-interaction-design.md`：交互设计文档
5. `docs/04-ui-visual-spec.md`：UI 与视觉效果文档

## 开发原则

- 第一版不接真实 AI API，所有剧情、选择和结局都来自本地数据。
- 第一版优先保证完整体验：开始页 → 剧情章节 → 选择 → 状态变化 → 结局报告 → 重新开始。
- 不要把项目做成复杂游戏引擎项目；优先使用 Vite + React + TypeScript。
- 不要引入大型 UI 框架；视觉效果优先用 CSS、少量动画和本地图片完成。
- 不要在浏览器端写入任何真实 API Key。
- 文案风格要克制、安静、心理寓言感，不要中二、不要说教、不要鸡汤。
- 移动端体验必须可用，桌面端体验应更有沉浸感。
- 每次修改后请确保 `npm run build` 通过。

## 推荐技术栈

- Vite
- React
- TypeScript
- CSS Modules 或普通 CSS
- lucide-react：用于少量线性图标
- GitHub Pages：静态部署

## 核心文件建议

```txt
src/
  App.tsx
  main.tsx
  data/
    story.json
    endings.ts
  types/
    game.ts
  utils/
    getEnding.ts
    statLabels.ts
  components/
    TypewriterText.tsx
    ChoiceButton.tsx
    AiStatusPanel.tsx
    StatMeter.tsx
  pages/
    StartPage.tsx
    GamePage.tsx
    EndingPage.tsx
  styles/
    global.css
  assets/
    backgrounds/
    illustrations/
docs/
  00-task-progress.md
  01-requirements.md
  02-game-design.md
  03-interaction-design.md
  04-ui-visual-spec.md
```

## 禁止事项

- 不要在第一版加入账号系统、云存档、支付、排行榜、真实大模型调用。
- 不要生成依赖复杂后端服务的方案。
- 不要把剧情文案硬编码在组件里；剧情应尽量放在 `story.json` 或独立数据文件中。
- 不要过度设计状态管理；第一版可以使用 React state + localStorage。
