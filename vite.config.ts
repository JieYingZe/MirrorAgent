import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 的 base 路径留到部署阶段再处理。
export default defineConfig({
  plugins: [react()],
})
