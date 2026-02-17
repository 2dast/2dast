## Hi there 👋

이 저장소는 **React + Vite**로 만든 웹사이트 보일러플래이트이며 **GitHub Pages**로 배포할 수 있습니다.

### 📁 구조

```
git_start/
├── index.html           # Vite 진입점
├── vite.config.js       # Vite 설정 (GitHub Pages base 경로 포함)
├── package.json
├── src/
│   ├── main.jsx         # React 진입점
│   ├── App.jsx          # 루트 컴포넌트
│   ├── index.css        # 전역 스타일
│   └── components/
│       ├── Header.jsx
│       ├── Hero.jsx
│       ├── Content.jsx
│       └── Footer.jsx
└── .github/workflows/
    └── deploy.yml       # GitHub Actions (자동 배포)
```

### 🛠 로컬에서 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 으로 확인합니다.

### 📦 빌드

```bash
npm run build
```

`dist/` 폴더에 배포용 파일이 생성됩니다.

### 🚀 GitHub Pages 배포

1. 코드를 **main** 브랜치에 푸시합니다.
   ```bash
   git add .
   git commit -m "Add React + Vite boilerplate"
   git push origin main
   ```

2. GitHub 저장소 **Settings** → **Pages**로 이동합니다.

3. **Build and deployment**에서 **Source**를 **GitHub Actions**로 선택합니다.

4. main 브랜치에 푸시할 때마다 자동으로 빌드 후 배포됩니다.  
   배포 주소: `https://<사용자명>.github.io/git_start/`

### ✏️ 수정하기

- **src/App.jsx**: 페이지 구조·라우팅
- **src/components/**: 각 영역 컴포넌트
- **src/index.css**: 전역 색상·폰트 등
- **vite.config.js**: 저장소 이름이 바뀌면 `base` 값을 해당 경로로 변경 (예: `base: '/새저장소이름/'`)

---

<!--
**2dast/2dast** is a ✨ _special_ ✨ repository because its `README.md` (this file) appears on your GitHub profile.
-->
