import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const BASE = '/2dast/'

// GitHub Pages: 상대 경로 + base 태그로 에셋/라우트 안정적으로 로드
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-404',
      closeBundle() {
        const out = resolve(__dirname, 'dist')
        copyFileSync(resolve(out, 'index.html'), resolve(out, '404.html'))
      },
    },
    // 빌드된 index.html에 <base href="/2dast/"> 추가 → 슬래시 유무 관계없이 에셋 로드
    {
      name: 'inject-base',
      closeBundle() {
        const out = resolve(__dirname, 'dist')
        for (const name of ['index.html', '404.html']) {
          const p = resolve(out, name)
          let html = readFileSync(p, 'utf-8')
          if (!html.includes('<base ')) {
            html = html.replace('</head>', `  <base href="${BASE}">\n  </head>`)
            writeFileSync(p, html)
          }
        }
      },
    },
  ],
  base: './',
})
