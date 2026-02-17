import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages: 저장소 이름을 base로 설정 (배포 경로가 /git_start/ 이므로)
export default defineConfig({
  plugins: [react()],
  base: '/git_start/',
})
