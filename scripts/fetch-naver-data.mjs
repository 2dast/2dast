/**
 * 네이버 금융 골든크로스 페이지에서 테이블 tbody 영역만 추출해 JSON으로 저장합니다.
 * GitHub Actions 등 CI에서 매일 실행할 수 있습니다.
 *
 * 환경 변수:
 *   (없음) - URL·경로는 스크립트 내 고정
 *
 * 출력 파일명: fetch-naver-data_네이버골든크로스_YYYYMMDD_HH24MISS.json
 * 출력 경로: public/data/naver/
 *
 * 커서룰 적용: 10-url-request (브라우저 헤더, UTF-8 한글 유지)
 */

import { writeFileSync, mkdirSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const NAVER_GOLD_URL = 'https://finance.naver.com/sise/item_gold.naver'
// XPath /html/body/div[3]/div[2]/div[2]/div[3]/table/tbody 에 해당하는 영역
const OUTPUT_DIR = resolve(root, 'public/data/naver')

// 10-url-request: 일반 브라우저처럼 헤더, 응답은 UTF-8로 통일해 한글 깨짐 방지
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Upgrade-Insecure-Requests': '1',
}

function getCharset(contentTypeHeader, buffer) {
  const m = contentTypeHeader?.match(/charset\s*=\s*["']?([\w-]+)/i)
  if (m) return m[1].toLowerCase().replace(/^x-/, '')
  try {
    const head = Buffer.from(buffer.slice(0, 4096)).toString('utf8')
    const meta = head.match(/<meta[^>]+charset\s*=\s*["']?([\w-]+)/i)
    if (meta) return meta[1].toLowerCase()
  } catch (_) {}
  return 'utf-8'
}

async function decodeToUtf8(buffer, charset) {
  if (!charset || charset === 'utf-8' || charset === 'utf8') return Buffer.from(buffer).toString('utf8')
  const iconv = await import('iconv-lite')
  return iconv.default.decode(Buffer.from(buffer), charset)
}

function formatTimestamp() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const h = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  return `${y}${m}${d}_${h}${min}${s}`
}

/** 수치 데이터만 허용: 숫자, +, -, %, "," (및 소수점 .) */
function sanitizeNumericValue(str) {
  if (str == null || typeof str !== 'string') return ''
  return str.replace(/[^0-9+\-%.,]/g, '').trim()
}

/** 헤더 행에서 열명에 해당하는 열 인덱스 반환, 없으면 -1 */
function findColumnIndex(headerRow, columnName) {
  const idx = headerRow.findIndex((cell) => String(cell).trim() === columnName)
  return idx >= 0 ? idx : -1
}

/** 등락률이 음수면 전일비 앞에 '-', 양수/0이면 부호 제거 */
function format전일비By등락률(전일비값, 등락률값) {
  const trimmed = String(전일비값 ?? '').trim()
  if (!trimmed) return trimmed
  const isNegative = String(등락률값 ?? '').trim().startsWith('-')
  if (isNegative) return trimmed.startsWith('-') ? trimmed : `-${trimmed}`
  return trimmed.replace(/^\++/, '')
}

async function fetchTbodyAsJson() {
  const res = await fetch(NAVER_GOLD_URL, { headers: BROWSER_HEADERS })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${NAVER_GOLD_URL}`)
  const contentType = res.headers.get('content-type') || ''
  const buffer = new Uint8Array(await res.arrayBuffer())
  const charset = getCharset(contentType, buffer)
  const html = await decodeToUtf8(buffer, charset)

  const { load } = await import('cheerio')
  const $ = load(html)

  // /html/body/div[3]/div[2]/div[2]/div[3]/table/tbody (1-based → 0-based index)
  const tbody = $('body')
    .children('div').eq(2)   // div[3]
    .children('div').eq(1)   // div[2]
    .children('div').eq(1)   // div[2]
    .children('div').eq(2)   // div[3]
    .find('table')
    .children('tbody')
    .first()

  if (!tbody.length) {
    throw new Error('tbody not found at expected path. Page structure may have changed.')
  }

  const rows = []
  tbody.find('tr').each((_, tr) => {
    const $tr = $(tr)
    const hasNo = $tr.find('td.no, th.no').length > 0
    const isHeader = $tr.find('th').length > 0
    if (!hasNo && !isHeader) return
    const cells = $tr.find('td, th').map((__, cell) => $(cell).text().trim()).get()
    if (cells.length) rows.push(cells)
  })

  const header = rows[0] ?? []
  const nameColIndex = findColumnIndex(header, '종목명')
  const 전일비ColIndex = findColumnIndex(header, '전일비')
  const 등락률ColIndex = findColumnIndex(header, '등락률')

  const normalizedRows = rows.map((row, rowIndex) => {
    if (rowIndex === 0) return row
    const out = row.map((cell, colIndex) =>
      nameColIndex >= 0 && colIndex === nameColIndex ? cell : sanitizeNumericValue(cell)
    )
    if (전일비ColIndex >= 0 && 등락률ColIndex >= 0 && out.length > Math.max(전일비ColIndex, 등락률ColIndex)) {
      out[전일비ColIndex] = format전일비By등락률(out[전일비ColIndex], out[등락률ColIndex])
    }
    return out
  })

  return {
    source: NAVER_GOLD_URL,
    fetchedAt: new Date().toISOString(),
    xpath: '/html/body/div[3]/div[2]/div[2]/div[3]/table/tbody',
    data: { rows: normalizedRows },
  }
}

try {
  mkdirSync(OUTPUT_DIR, { recursive: true })
  const result = await fetchTbodyAsJson()
  const fileName = `fetch-naver-data_네이버골든크로스_${formatTimestamp()}.json`
  const outputPath = resolve(OUTPUT_DIR, fileName)
  writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8')
  console.log('Saved:', outputPath)
} catch (err) {
  console.error(err)
  process.exit(1)
}
