import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages: 상대 경로로 하면 /2dast/ 또는 루트 어디서든 동작
export default defineConfig({
  plugins: [react()],
  base: './',
})
