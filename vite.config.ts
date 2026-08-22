import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * GitHub Pages 部署在项目子路径 https://<user>.github.io/MirrorAgent/ 下，
 * 构建产物里的 JS / CSS / 图片引用必须带上这个前缀，否则线上全部 404。
 *
 * `/MirrorAgent/` 与 GitHub 仓库名一一对应，改仓库名时这里要跟着改。
 *
 * `npm run dev` 仍然跑在根路径；`npm run preview` 要跟着构建产物一起走子路径，
 * 否则预览服务器在 `/` 提供文件，而 HTML 里写的是 `/MirrorAgent/...`，全部 404。
 *
 * `public/` 下的音频不经过 Vite 处理，运行时自己拼 `import.meta.env.BASE_URL`，
 * 见 src/utils/audio/audioPaths.ts。
 */
const GITHUB_PAGES_BASE = '/MirrorAgent/'

export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? GITHUB_PAGES_BASE : '/',
  plugins: [react()],
}))
