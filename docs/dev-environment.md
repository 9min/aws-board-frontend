# 개발 환경 셋업 가이드

## 사전 요구사항

| 도구 | 최소 버전 | 비고 |
|------|----------|------|
| Node.js | >= 20 | LTS 권장 |
| pnpm | >= 9 | CI/CD와 동일한 패키지 매니저. `npm i -g pnpm`으로 설치 |

## 환경변수 설정

### 파일 역할

| 파일 | 역할 | Git 추적 |
|------|------|----------|
| `.env.example` | 환경변수 키 목록 (값 없음). 팀원 온보딩용 | O |
| `.env.local` | 로컬 개발용 실제 값. 각 개발자가 생성 | X |
| `.env` | 빌드/배포 시 사용. CI/CD에서 주입 | X |

### .env.local 구성 예시

```
VITE_API_BASE_URL=http://3.38.166.223:3000
```

백엔드 API의 Base URL을 설정한다. 로컬 개발 시에도 실제 백엔드 서버 URL을 사용한다.

### 환경별 관리

| 환경 | API_BASE_URL | 관리 방식 |
|------|-------------|----------|
| 로컬 | `http://3.38.166.223:3000` (또는 로컬 백엔드) | `.env.local` |
| Production | 프로덕션 백엔드 URL | GitHub Secrets (`VITE_API_BASE_URL`) |

## IDE 설정

### VSCode 필수 확장

| 확장 | ID | 용도 |
|------|----|------|
| Biome | `biomejs.biome` | 린트/포매팅 |
| Tailwind CSS IntelliSense | `bradlc.vscode-tailwindcss` | Tailwind 자동완성 |
| ES7+ React Snippets | `dsznajder.es7-react-js-snippets` | React 스니펫 |

### .vscode/settings.json 예제

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "'([^']*)'"]
  ]
}
```

### .vscode/extensions.json 예제

```json
{
  "recommendations": [
    "biomejs.biome",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

### 디버깅 설정 (.vscode/launch.json)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Vite 디버깅",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

## 로컬 개발 실행

### 실행 순서

```bash
# 1. .env.local 파일 확인 (없으면 .env.example 복사 후 값 입력)
cp .env.example .env.local

# 2. 의존성 설치 (pnpm 사용)
pnpm install

# 3. 개발 서버 실행
pnpm dev
```

### package.json scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write .",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run"
  }
}
```

## 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| API 요청 실패 (CORS) | 백엔드 CORS 설정 누락 | 백엔드 팀에 CORS 허용 요청 또는 Vite proxy 설정 |
| `.env.local` 미인식 | Vite 환경변수 접두사 누락 | `VITE_` 접두사 확인 |
| 401 Unauthorized | JWT 토큰 만료 또는 누락 | 토큰 갱신 또는 재로그인 |
| 404 Not Found | API Base URL 오설정 | `VITE_API_BASE_URL` 값 확인 |

## 관련 문서

- [프로젝트 구조](project-structure.md)
- [린트 설정](lint-config.md)
- [CI/CD 가이드](cicd-guide.md)
