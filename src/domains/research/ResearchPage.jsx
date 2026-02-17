import { useState, useEffect } from 'react'
import styles from './ResearchPage.module.css'

// public/data/naver/ 내 fetch-naver-data_네이버골든크로스_*.json 파일명 목록 (추가 시 여기에 추가)
const NAVER_GOLDEN_CROSS_FILE_PATTERN = [
  'fetch-naver-data_네이버골든크로스_20260217_165339.json',
  'fetch-naver-data_네이버골든크로스_20260217_165043.json',
  'fetch-naver-data_네이버골든크로스_20260217_164603.json',
  'fetch-naver-data_네이버골든크로스_20260217_163621.json',
  'fetch-naver-data_네이버골든크로스_20260217_074022.json',
  'fetch-naver-data_네이버골든크로스_20260217_073940.json',
]

function getLatestNaverGoldenCrossFilename() {
  const sorted = [...NAVER_GOLDEN_CROSS_FILE_PATTERN].sort((a, b) => {
    const tsA = (a.match(/_(\d{8}_\d{6})\.json$/) || [])[1] || ''
    const tsB = (b.match(/_(\d{8}_\d{6})\.json$/) || [])[1] || ''
    return tsB.localeCompare(tsA)
  })
  return sorted[0] || null
}

/** 날짜(YYYY-MM-DD)별로 그룹, 같은 날짜는 시간 기준 마지막 파일만 반환. 날짜 내림차순 */
function getDateOptions() {
  const byDate = {}
  for (const filename of NAVER_GOLDEN_CROSS_FILE_PATTERN) {
    const m = filename.match(/_(\d{8})_(\d{6})\.json$/)
    if (!m) continue
    const [, ymd, hms] = m
    const dateStr = `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`
    if (!byDate[dateStr] || hms > (byDate[dateStr].time || '')) {
      byDate[dateStr] = { date: dateStr, time: hms, filename }
    }
  }
  return Object.values(byDate).sort((a, b) => b.date.localeCompare(a.date))
}

const FETCH_INTERVAL_MS = 10 * 1000 // 10초마다 새 데이터 조회
const DATE_OPTIONS = getDateOptions()

function ResearchPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDate, setSelectedDate] = useState(DATE_OPTIONS[0]?.date ?? '')

  useEffect(() => {
    function loadData() {
      const filename = selectedDate
        ? (DATE_OPTIONS.find((o) => o.date === selectedDate)?.filename ?? null)
        : getLatestNaverGoldenCrossFilename()
      if (!filename) {
        setLoading(false)
        setError('표시할 데이터 파일이 없습니다.')
        return
      }
      // 개발(DEV): public이 루트(/)에 서빙됨. 배포: base가 /2dast/ 등으로 설정됨.
      const base = import.meta.env.DEV
        ? ''
        : (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
      const url = `${base || ''}/data/naver/${filename}`.replace(/\/+/, '/')
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`데이터 로드 실패: ${res.status}`)
          return res.json()
        })
        .then((json) => {
          if (json?.data?.rows?.length) {
            setData(json.data.rows)
            setError(null)
          } else {
            setData([])
          }
        })
        .catch((err) => setError(err.message || '데이터를 불러오지 못했습니다.'))
        .finally(() => setLoading(false))
    }

    loadData()
    const intervalId = setInterval(loadData, FETCH_INTERVAL_MS)
    return () => clearInterval(intervalId)
  }, [selectedDate])

  if (loading) {
    return (
      <section className={`domain-page ${styles.wrapper}`}>
        <h1>Research</h1>
        <p>리서치·백테스트·논문·분석 관련 화면입니다.</p>
        <div className={styles.placeholder}>데이터를 불러오는 중입니다.</div>
      </section>
    )
  }

  if (error) {
    return (
      <section className={`domain-page ${styles.wrapper}`}>
        <h1>Research</h1>
        <p>리서치·백테스트·논문·분석 관련 화면입니다.</p>
        <div className={styles.error}>{error}</div>
      </section>
    )
  }

  const headerRow = data[0] || []
  const bodyRows = data.slice(1)

  return (
    <section className={`domain-page ${styles.wrapper}`}>
      <h1>Research</h1>
      <p>리서치·백테스트·논문·분석 관련 화면입니다.</p>
      <div className={styles.tableWrap}>
        {DATE_OPTIONS.length > 0 && (
          <div className={styles.toolbar}>
            <span className={styles.toolbarSpacer} />
            <label className={styles.selectLabel} htmlFor="research-date-select">
              날짜
            </label>
            <select
              id="research-date-select"
              className={styles.select}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label="날짜별 검색"
            >
              {DATE_OPTIONS.map((opt) => (
                <option key={opt.date} value={opt.date}>
                  {opt.date}
                </option>
              ))}
            </select>
          </div>
        )}
        <table className={styles.table}>
          <thead>
            <tr>
              {headerRow.map((cell, i) => (
                <th key={i} className={styles.th}>
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row, rowIndex) => (
              <tr key={rowIndex} className={styles.tr}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className={styles.td}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default ResearchPage
