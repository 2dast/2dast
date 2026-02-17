import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages: 2dast/2dast 프로필 repo는 루트(2dast.github.io/)에 서빙될 수 있음
// 루트 기준으로 하면 두 URL 모두에서 동작하도록
export default defineConfig({
  plugins: [react()],
  base: '/',
})
