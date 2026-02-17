import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

// GitHub Pages URL이 https://<user>.github.io/<repo>/ 이면 저장소 이름과 일치시킬 것
const repoName = '2dast'

export default defineConfig({
  plugins: [
    react(),
    // SPA: 서브 라우트 직접 접근 시 404.html로 index 내용 제공 → React Router 동작
    {
      name: 'copy-404',
      closeBundle() {
        const out = resolve(__dirname, 'dist')
        copyFileSync(resolve(out, 'index.html'), resolve(out, '404.html'))
      },
    },
  ],
  base: `/${repoName}/`,
})
