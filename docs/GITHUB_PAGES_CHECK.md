# GitHub Pages 배포 확인 체크리스트

"로딩 중..."만 보일 때 아래를 순서대로 확인하세요.

## 1. Pages 설정 (가장 중요)

1. 저장소 **Settings** → 왼쪽 **Pages** 이동
2. **Build and deployment** → **Source** 가 **반드시** 다음이어야 함:
   - **Deploy from a branch** (GitHub Actions 아님)
3. **Branch** → **gh-pages** 선택
4. **Folder** → **/ (root)** 선택 후 **Save**
5. 상단에 나오는 사이트 URL 확인 (예: `https://2dast.github.io/2dast/`)

→ Source가 **GitHub Actions**로 되어 있으면, gh-pages 브랜치 내용이 아닌 예전 배포가 보일 수 있습니다. **Deploy from a branch**로 바꿔야 합니다.

## 2. 접속 주소

- 반드시 **끝에 슬래시 포함**해서 접속: **https://2dast.github.io/2dast/**
- 시크릿/프라이빗 창에서 열거나 **Ctrl+Shift+R** 강력 새로고침

## 3. 브라우저에서 JS 로드 확인

1. **F12** → **Network** 탭
2. **https://2dast.github.io/2dast/** 새로고침
3. 목록에서 **.js** 파일 찾기
   - **Status 200** → 로드는 됨. 그럼 콘솔(Console) 탭에서 에러 확인
   - **Status 404** → 주소가 잘못됨. 위 1번 Pages 설정이 "Deploy from a branch" + gh-pages 인지 다시 확인

## 4. gh-pages 브랜치 내용 확인

1. GitHub 저장소 페이지에서 **Branch** 드롭다운 → **gh-pages** 선택
2. **index.html**과 **assets** 폴더가 보여야 함
3. **index.html** 클릭 → 내용에 `src="/2dast/assets/` 가 포함되어 있는지 확인

이 체크리스트대로 해도 안 되면, Actions 탭에서 가장 최근 워크플로 실행 → "Verify build output" 단계 로그를 확인해 보세요.

---

## 5. artifact / dist를 받아서 "로딩 중..."만 보일 때

**구성이 잘못된 게 아닙니다.** 빌드 결과물 구조는 이렇게 맞습니다:

```
dist/
├── index.html          ← "로딩 중..." 텍스트 + 스크립트 경로만 있음
└── assets/
    ├── index-xxxxx.js  ← 실제 React 앱
    └── index-xxxxx.css
```

**이유:** `index.html` 안의 스크립트 주소가 **절대 경로** (`/2dast/assets/xxx.js`) 로 되어 있어서,

- **GitHub Pages** (`https://2dast.github.io/2dast/`) 에서는 정상 동작하고
- **파일을 더블클릭해서 열 때** (`file://...`) 또는 **tar 풀고 index.html만 열 때** 는  
  브라우저가 `/2dast/assets/...` 를 **로컬 디스크 루트**로 찾기 때문에 JS 파일을 못 찾고,  
  → 스크립트가 안 불러와져서 **"로딩 중..."만 보이는 것**이 정상입니다.

**artifact / dist를 제대로 확인하는 방법:**

1. **로컬에서 빌드 후 미리보기 (권장)**  
   ```bash
   npm run build
   npm run preview
   ```  
   브라우저에서 **http://localhost:4173/2dast/** 로 접속해서 확인.

2. **tar/dist 폴더를 웹 서버로 서빙해서 확인**  
   tar를 푼 폴더를 **웹 서버 루트가 아니라 `/2dast/` 경로에 두고** 서빙해야 합니다.  
   예: `dist` 내용을 `public/2dast/` 안에 넣고 `npx serve public -p 3000` 후  
   **http://localhost:3000/2dast/** 로 접속.

정리하면, **artifact를 “파일로만 열어서” 보면 "로딩 중..."만 나오는 게 정상**이고,  
실제 동작은 **위처럼 서버로 연 뒤 `/2dast/` 경로로 접속**해서 확인하면 됩니다.
