/**
 * 특정 웹사이트에서 데이터를 가져와 JSON 파일로 저장합니다.
 * GitHub Actions 등 CI에서 실행해 Git에 커밋할 때 사용하세요.
 *
 * 환경 변수:
 *   WEBSITE_DATA_URL (필수) - 데이터를 가져올 URL
 *   OUTPUT_PATH (선택) - 저장할 JSON 파일 경로. 기본: public/data/website-data.json
 *   HTML_TABLE_SELECTOR (선택) - HTML인 경우 테이블 추출용 셀렉터. 예: "table.some-class"
 */

import { writeFileSync, mkdirSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const WEBSITE_DATA_URL = process.env.WEBSITE_DATA_URL
const OUTPUT_PATH = process.env.OUTPUT_PATH || 'public/data/website-data.json'
const HTML_TABLE_SELECTOR = process.env.HTML_TABLE_SELECTOR || 'table'

if (!WEBSITE_DATA_URL) {
  console.error('WEBSITE_DATA_URL 환경 변수를 설정하세요.')
  process.exit(1)
}

const outputFull = resolve(root, OUTPUT_PATH)

async function fetchAsJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GitHub-Actions-Data-Fetcher/1.0)' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`)
  const contentType = res.headers.get('content-type') || ''
  const text = await res.text()

  if (contentType.includes('application/json')) {
    return { source: url, fetchedAt: new Date().toISOString(), data: JSON.parse(text) }
  }

  // HTML: cheerio로 테이블 추출 시도
  try {
    const { load } = await import('cheerio')
    const $ = load(text)
    const tables = []
    $(HTML_TABLE_SELECTOR).each((_, el) => {
      const rows = []
      $(el).find('tr').each((_, row) => {
        const cells = $(row).find('td, th').map((__, cell) => $(cell).text().trim()).get()
        if (cells.length) rows.push(cells)
      })
      if (rows.length) tables.push(rows)
    })
    return { source: url, fetchedAt: new Date().toISOString(), data: tables.length ? tables : { raw: text.slice(0, 5000) } }
  } catch (e) {
    return { source: url, fetchedAt: new Date().toISOString(), data: { raw: text.slice(0, 10000), parseError: e.message } }
  }
}

try {
  const outDir = dirname(outputFull)
  mkdirSync(outDir, { recursive: true })
  const result = await fetchAsJson(WEBSITE_DATA_URL)
  writeFileSync(outputFull, JSON.stringify(result, null, 2), 'utf8')
  console.log('Saved:', outputFull)
} catch (err) {
  console.error(err)
  process.exit(1)
}
