import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages: 접속 주소가 https://2dast.github.io/2dast/ 이므로 base 필수
export default defineConfig({
  plugins: [react()],
  base: '/2dast/',
})
