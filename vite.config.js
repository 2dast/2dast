import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

// GitHub Pages 프로젝트 사이트: 반드시 https://2dast.github.io/2dast/ 경로에 맞춤
export default defineConfig({
  plugins: [
    react(),
    // /2dast/stock 등 직접 접속 시 404 → 404.html(SPA) 로드되도록
    {
      name: 'copy-404',
      closeBundle() {
        const out = resolve(__dirname, 'dist')
        copyFileSync(resolve(out, 'index.html'), resolve(out, '404.html'))
      },
    },
  ],
  base: '/2dast/',
})
