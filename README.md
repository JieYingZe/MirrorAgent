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
CLAUDE.md
docs/00-task-progress.md
docs/01-requirements.md
docs/02-game-design.md
docs/03-interaction-design.md
docs/04-ui-visual-spec.md
```

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 目录建议

```txt
src/
  assets/
  components/
  data/
  pages/
  styles/
  types/
  utils/
docs/
```

## 开发原则

- 优先完成完整体验，再打磨视觉和动画。
- 不要把剧情硬编码在组件里。
- 不要在前端暴露任何 API Key。
- 文案保持克制、安静、心理寓言感。
