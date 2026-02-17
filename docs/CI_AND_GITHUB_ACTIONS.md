# CI(지속적 통합)와 GitHub Actions 예시

## CI(Continuous Integration)란?

**코드를 저장소에 올릴 때마다 자동으로 빌드·테스트·배포 등을 실행해 주는 시스템**입니다.

- 개발자가 `git push`만 하면, 서버(여기서는 GitHub)가 정해진 작업을 대신 실행합니다.
- 예: 푸시 시 자동 빌드, 테스트 실행, 정적 사이트 배포, **주기적으로 외부 데이터를 가져와 JSON으로 저장 후 커밋** 등.

즉, **“자동으로 돌아가는 스크립트/작업”**이라고 보면 됩니다.

---

## GitHub Actions란?

GitHub에서 제공하는 **CI/CD 서비스**입니다.

- 저장소에 `.github/workflows/` 폴더 안에 **YAML 파일**을 넣으면, 그 파일이 “워크플로”가 됩니다.
- **언제 실행할지**(푸시 시, 스케줄 시, 수동 실행 등)와 **무엇을 할지**(체크아웃, Node 설치, 스크립트 실행, Git 푸시 등)를 단계별로 적습니다.

### 이 저장소에 이미 있는 예시: `deploy.yml`

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]   # ← main 브랜치에 push될 때 실행

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest   # ← GitHub가 제공하는 Linux 환경에서 실행
    steps:
      - uses: actions/checkout@v4        # 저장소 코드 가져오기
      - uses: actions/setup-node@v4      # Node.js 설치
        with:
          node-version: '20'
      - run: npm ci && npm run build    # 설치 후 빌드
      - uses: peaceiris/actions-gh-pages@v3   # dist 폴더를 GitHub Pages에 배포
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**동작 요약**: `main`에 push → GitHub 서버에서 코드 체크아웃 → Node 설치 → `npm ci` & `npm run build` → `dist`를 GitHub Pages에 배포.

---

## 웹사이트 데이터 → JSON 파일 → Git 업로드 예시

원하는 동작:

1. **특정 웹사이트**에서 데이터를 가져오고  
2. **JSON 파일**로 저장한 뒤  
3. 그 파일을 **같은 Git 저장소에 커밋·푸시**한다.

이건 **브라우저가 아니라 GitHub Actions(CI)에서만** 할 수 있습니다. 이 저장소에 다음 예시를 넣어 두었습니다.

| 파일 | 역할 |
|------|------|
| `.github/workflows/update-website-data.yml` | 스케줄/수동 실행 시 데이터 수집 스크립트 실행 → JSON 커밋 & 푸시 |
| `scripts/fetch-website-data.mjs` | 지정한 URL에서 데이터를 가져와 `public/data/`에 JSON으로 저장 |

### 사용 방법

1. **대상 URL 정하기**  
   - JSON을 주는 API 주소이거나,  
   - HTML 페이지면 스크립트에서 필요한 부분만 추출해 JSON으로 만듭니다.

2. **워크플로에서 URL 지정**  
   - `.github/workflows/update-website-data.yml` 안에 있는 `WEBSITE_DATA_URL` 값을 원하는 사이트 주소로 바꿉니다.

3. **실행**  
   - **수동**: GitHub 저장소 → Actions → "Update website data" 워크플로 선택 → "Run workflow"  
   - **자동**: 워크플로에 적어 둔 `schedule`(cron)에 따라 정해진 시간에 실행됩니다.

4. **결과**  
   - `public/data/` 아래에 JSON 파일이 생성되고, 그 변경분이 자동으로 커밋·푸시됩니다.  
   - 이후 `main` 푸시로 기존 `Deploy to GitHub Pages` 워크플로가 돌면, 새 JSON이 포함된 사이트가 배포됩니다.

자세한 스크립트 동작과 수정 방법은 `scripts/fetch-website-data.mjs` 주석과 `update-website-data.yml` 내용을 참고하면 됩니다.

---

## 실제 사용 시 할 일

1. **`.github/workflows/update-website-data.yml`** 열기  
2. **`env.WEBSITE_DATA_URL`** 값을 **데이터를 가져올 웹사이트 주소**로 변경  
   - JSON을 반환하는 API: 그대로 URL만 넣으면 됨  
   - HTML 페이지: 그대로 URL 넣으면 스크립트가 테이블을 추출해 JSON으로 저장함. 테이블이 여러 개면 `HTML_TABLE_SELECTOR`로 원하는 테이블만 지정 가능 (같은 파일 또는 워크플로에 env 추가)  
3. 저장 후 **main에 push**  
4. GitHub **Actions** 탭에서 **"Update website data"** 선택 → **Run workflow** 로 한 번 수동 실행해 보기  
5. 성공하면 `public/data/website-data.json` 이 생성되고 자동 커밋·푸시됨. 이후부터는 스케줄(기본 매일 00:00 UTC) 또는 수동 실행으로 갱신 가능
