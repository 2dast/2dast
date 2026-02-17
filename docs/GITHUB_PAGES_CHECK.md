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
