import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 프로젝트 사이트: 반드시 https://2dast.github.io/2dast/ 경로에 맞춤
export default defineConfig({
  plugins: [react()],
  base: '/2dast/',
})
