# CLAUDE.md - 프로젝트 공통 규칙

## 기술 스택

- **프론트엔드**: Vite + React + TypeScript
- **백엔드**: NestJS + Prisma + AWS (별도 구성, `http://3.38.166.223:3000`)
- **린트/포매팅**: Biome
- **테스트**: Vitest
- **배포**: Vercel (프론트엔드만)
- **버전 관리**: Git (GitHub Flow)

## 핵심 규칙

### 언어

- 코드 내 주석, 커밋 메시지, PR 설명 등 모든 문서는 **한국어**로 작성한다.

### 코드 스타일

- Biome 설정을 따른다. (`biome.json` 참조)
- TypeScript strict 모드를 사용한다.
- `any` 타입 사용을 금지한다. 불가피한 경우 `unknown`을 사용하고 타입 가드를 적용한다.
- 함수형 컴포넌트와 훅을 사용한다. 클래스 컴포넌트는 사용하지 않는다.
- 네이밍 컨벤션:
  - 컴포넌트: `PascalCase`
  - 함수/변수: `camelCase`
  - 상수: `UPPER_SNAKE_CASE`
  - 타입/인터페이스: `PascalCase`
  - 파일명: 컴포넌트는 `PascalCase.tsx`, 그 외는 `camelCase.ts`

### 브랜치 전략

- GitHub Flow 기반: `main` → `feature/*`, `fix/*`, `hotfix/*`
- 직접 `main` 푸시 금지. 반드시 PR을 통해 머지한다.

### 커밋 컨벤션

- Gitmoji + Conventional Commits 형식
- 예: `✨ feat: 사용자 로그인 기능 추가`
- 예: `🐛 fix: 토큰 만료 시 리다이렉트 오류 수정`

### 테스트 (TDD)

- **TDD(Test-Driven Development) 방식으로 개발한다.** 테스트 코드를 먼저 작성한 후 구현 코드를 작성한다.
- TDD 사이클: Red(실패하는 테스트 작성) → Green(테스트를 통과하는 최소 구현) → Refactor(코드 개선)
- 새로운 기능에는 반드시 테스트 코드를 포함한다.
- Vitest를 사용하며, 테스트 파일은 `*.test.ts` 또는 `*.test.tsx` 형식을 따른다.

### API 연동 규칙

- API 클라이언트는 `lib/apiClient.ts`에서 단일 인스턴스로 생성하여 사용한다.
- axios 인스턴스에 `baseURL`, 요청/응답 인터셉터를 설정한다.
- JWT 토큰은 `lib/tokenStorage.ts`를 통해 관리한다. (localStorage 또는 httpOnly 쿠키)
- 모든 인증 요청은 `Authorization: Bearer {token}` 헤더를 포함한다.
- API 에러는 HTTP 상태 코드 기반으로 처리한다. 상세 내용은 [error-handling.md](docs/error-handling.md) 참조.
- 직접 `fetch`/`axios`를 호출하지 않고 반드시 `lib/apiClient.ts` 인스턴스를 사용한다.

### 보안

- **기능 개발 시 보안 검토를 필수로 수행한다.** 구현 완료 후 보안 체크리스트를 점검한다.
- 환경변수로 시크릿을 관리한다. 코드에 하드코딩 금지.
- `VITE_API_BASE_URL`은 클라이언트에 노출 가능하지만, 민감한 키(시크릿)는 절대 클라이언트에 포함하지 않는다.
- JWT 토큰은 XSS 공격에 노출되지 않도록 안전하게 관리한다.
- 사용자 입력은 반드시 검증하고 새니타이즈한다.
- OWASP Top 10을 준수한다.
- 보안 관련 상세 체크리스트는 [security-guide.md](docs/security-guide.md)를 참조한다.

### 에러 처리

- 프론트엔드: Error Boundary + try-catch 패턴
- REST API: HTTP 상태 코드 기반으로 에러를 처리한다. `{ data, error }` 패턴으로 래핑하여 사용한다.

## 상세 문서 참조

각 항목에 대한 상세 내용은 아래 문서를 참조한다.

| 문서 | 설명 |
|------|------|
| [docs/prd.md](docs/prd.md) | 프로젝트 요구사항 정의서 (PRD) |
| [docs/git-workflow.md](docs/git-workflow.md) | Git 워크플로우 및 브랜치 전략 |
| [docs/commit-convention.md](docs/commit-convention.md) | 커밋 메시지 컨벤션 |
| [docs/project-structure.md](docs/project-structure.md) | 프로젝트 폴더 구조 가이드 |
| [docs/lint-config.md](docs/lint-config.md) | Biome 린트/포매팅 설정 |
| [docs/design-guide.md](docs/design-guide.md) | 디자인 가이드 (UI 컨벤션 + 디자인 시스템) |
| [docs/testing-guide.md](docs/testing-guide.md) | 테스트 코드 가이드 |
| [docs/security-guide.md](docs/security-guide.md) | 보안 가이드 |
| [docs/cicd-guide.md](docs/cicd-guide.md) | CI/CD 설정 가이드 |
| [docs/code-review-checklist.md](docs/code-review-checklist.md) | 코드 리뷰 체크리스트 |
| [docs/error-handling.md](docs/error-handling.md) | 에러 핸들링 가이드 |
| [docs/dev-environment.md](docs/dev-environment.md) | 개발 환경 셋업 가이드 |
| [docs/state-management.md](docs/state-management.md) | 상태 관리 전략 |
| [docs/performance-guide.md](docs/performance-guide.md) | 성능 최적화 가이드 |
| [docs/data-modeling.md](docs/data-modeling.md) | API 데이터 모델 (DTO/타입 정의) 가이드 |
