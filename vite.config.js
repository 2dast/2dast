import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages: 저장소 이름을 base로 설정 (접속 주소가 .../2dast/ 이므로)
export default defineConfig({
  plugins: [react()],
  base: '/2dast/',
})
