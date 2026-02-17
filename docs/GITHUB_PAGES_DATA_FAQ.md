# GitHub Pages + React 데이터 새로고침·JSON 저장 FAQ

## 1. 1분마다 페이지/데이터 새로고침 가능 여부

### ✅ 가능합니다.

**방법 A: 데이터만 주기적으로 다시 가져오기 (권장)**  
- 페이지 전체를 새로고침하지 않고, **1분마다 API/URL에서 데이터만 fetch**해서 state를 갱신하면 됩니다.  
- React에서는 `useEffect` + `setInterval`로 구현합니다.  
- 사용자 경험이 좋고, 화면이 깜빡이지 않습니다.

**방법 B: 페이지 전체 새로고침**  
- `setInterval(() => window.location.reload(), 60_000)` 처럼 1분마다 `location.reload()`를 호출할 수도 있습니다.  
- 단점: 화면이 매번 새로고침되므로 UX가 떨어집니다.

**정리**: 1분마다 **데이터만** 가져오는 방식(A)을 추천합니다.

---

## 2. 가져온 데이터를 JSON 파일로 저장하고, Git 저장소에 넣은 뒤 페이지에서 불러오기

### 브라우저(React)에서는 “파일 저장 + Git push” 불가

- GitHub Pages는 **정적 호스팅**입니다.  
- React 앱은 **사용자 브라우저**에서만 실행되므로:
  - 사용자 PC의 로컬 파일시스템에 쓰는 것만 가능하고,
  - **Git 저장소에 직접 파일을 커밋·푸시하는 것은 불가능**합니다.

### ✅ 가능한 방법: GitHub Actions로 데이터 수집 → JSON 커밋 → 배포

1. **저장소에 JSON을 둘 위치 정하기**  
   - 예: `public/data/golden-cross.json`  
   - 빌드 시 `dist`에 그대로 복사되므로, 배포 후  
     `https://<user>.github.io/<repo>/data/golden-cross.json`  
     로 접근 가능합니다.

2. **GitHub Actions 워크플로 추가**  
   - **주기 실행(cron)** 또는 **main 푸시 시** 실행  
   - 워크플로 안에서:
     - Node/Python 등으로 외부 API·페이지에서 데이터 수집
     - `public/data/golden-cross.json` (또는 원하는 경로)에 JSON 파일 생성
     - 해당 파일을 커밋 후 push  
   - 같은 푸시로 Pages 빌드가 돌면, 새 JSON이 포함된 사이트가 배포됩니다.

3. **React 페이지에서 JSON 불러오기**  
   - `fetch('/<repo>/data/golden-cross.json')`  
   - Vite base가 `/<repo>/`이므로 실제로는  
     `fetch(`${import.meta.env.BASE_URL}data/golden-cross.json`)`  
     처럼 base를 붙여서 쓰는 것이 안전합니다.

**정리**:  
- “가져온 데이터를 JSON 파일로 만들고 Git data 파일에 저장” → **GitHub Actions**로만 가능합니다.  
- “페이지에서 그 JSON 불러오기” → **가능**합니다. 위처럼 `public/data/`에 두고 fetch하면 됩니다.

---

## 요약 표

| 질문 | 가능 여부 | 비고 |
|------|-----------|------|
| 1분마다 (데이터만) 새로고침 | ✅ 가능 | `setInterval` + `fetch` 권장 |
| 1분마다 페이지 전체 새로고침 | ✅ 가능 | `location.reload()` (UX 비권장) |
| 브라우저에서 JSON 파일 만들어 Git에 저장 | ❌ 불가 | 저장소 쓰기는 서버/CI만 가능 |
| GitHub Actions로 JSON 생성·커밋 후 페이지에서 불러오기 | ✅ 가능 | `public/data/*.json` + fetch |

---

## 3. React 예시: 1분마다 데이터만 갱신

```jsx
import { useState, useEffect } from 'react'

const DATA_URL = `${import.meta.env.BASE_URL}data/golden-cross.json` // GitHub Pages base 반영

function ResearchPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      const res = await fetch(DATA_URL)
      if (!res.ok) throw new Error(res.statusText)
      const json = await res.json()
      setData(json)
      setError(null)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60_000) // 1분(60초)마다
    return () => clearInterval(interval)
  }, [])

  if (error) return <div>로딩 실패: {error}</div>
  if (!data) return <div>로딩 중...</div>
  return (/* data로 테이블 등 렌더 */)
}
```

- `import.meta.env.BASE_URL`은 Vite에서 `vite.config.js`의 `base` 값(`/2dast/`)을 줍니다.  
- JSON 파일을 **GitHub Actions로 `public/data/`에 생성**해 두면, 위처럼 주기적으로 불러올 수 있습니다.

---

## 4. GitHub Actions로 JSON 생성 예시 (선택)

데이터를 수집해서 `public/data/`에 JSON을 만들고 커밋하는 워크플로 예시입니다.  
`.github/workflows/update-data.yml` 로 저장한 뒤, 실제 수집 로직만 채우면 됩니다.

```yaml
name: Update data JSON

on:
  schedule:
    - cron: '0 * * * *'   # 매시 정각 (원하면 1분마다는 부담되므로 시간/일 단위 권장)
  workflow_dispatch:       # 수동 실행 가능

permissions:
  contents: write

jobs:
  update-json:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Generate JSON
        run: |
          mkdir -p public/data
          # 여기서 API/스크래핑 등으로 데이터 수집 후 JSON 생성
          echo '[{"name":"예시","value":1}]' > public/data/golden-cross.json

      - name: Commit and push
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add public/data/
          git diff --staged --quiet || git commit -m "chore: update data JSON"
          git push
```

- 이 푸시가 되면 기존 `Deploy to GitHub Pages` 워크플로가 다시 빌드·배포하므로, 새 JSON이 반영됩니다.
- 페이지에서는 `fetch(\`${import.meta.env.BASE_URL}data/golden-cross.json\`)` 로 불러오면 됩니다.
