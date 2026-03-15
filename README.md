# AWS Board

NestJS + AWS 기반 커뮤니티 게시판 실습 프로젝트의 프론트엔드입니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | React 19 + TypeScript + Vite |
| 라우팅 | TanStack Router (파일 기반) |
| 서버 상태 | TanStack Query |
| 스타일링 | Tailwind CSS 4 |
| HTTP | Axios |
| 검증 | Zod |
| 테스트 | Vitest + Testing Library |
| 린트/포맷 | Biome |
| 패키지 매니저 | pnpm |

## 시작하기

```bash
# 1. 저장소 클론
git clone <repository-url>
cd aws-board-frontend

# 2. 패키지 설치
pnpm install

# 3. 환경변수 설정
cp .env.example .env.local
# .env.local에서 VITE_API_BASE_URL 확인

# 4. 개발 서버 실행
pnpm dev
```

## 환경변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `VITE_API_BASE_URL` | 백엔드 API 서버 주소 | `https://dibhzpfpsg3ou.cloudfront.net` |

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 개발 서버 실행 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm preview` | 빌드 결과 미리보기 |
| `pnpm test` | 테스트 감시 모드 실행 |
| `pnpm test:run` | 테스트 1회 실행 |
| `pnpm test:ui` | Vitest UI 실행 |
| `pnpm lint` | 린트 검사 |
| `pnpm lint:fix` | 린트 자동 수정 |
| `pnpm format` | 코드 포매팅 |

## 주요 기능

- 회원가입 / 로그인 (JWT 인증)
- 게시글 CRUD + 페이지네이션 + 키워드 검색
- 댓글 CRUD
- AWS S3 파일 첨부 (Presigned URL)
- AWS S3 정적 호스팅 + GitHub Actions CI/CD

## 프로젝트 구조

```
src/
├── app/routes/       # 파일 기반 라우팅
├── components/       # UI / 레이아웃 / 기능 컴포넌트
├── services/         # API 호출
├── lib/              # apiClient, tokenStorage, queryClient
└── types/            # TypeScript 타입
```

## 관련 문서

| 문서 | 설명 |
|------|------|
| [docs/prd.md](docs/prd.md) | 프로젝트 요구사항 정의서 (PRD) |
| [docs/project-structure.md](docs/project-structure.md) | 프로젝트 폴더 구조 가이드 |
| [docs/data-modeling.md](docs/data-modeling.md) | API 데이터 모델 (DTO/타입 정의) 가이드 |
| [docs/git-workflow.md](docs/git-workflow.md) | Git 워크플로우 및 브랜치 전략 |
| [docs/commit-convention.md](docs/commit-convention.md) | 커밋 메시지 컨벤션 |
| [docs/design-guide.md](docs/design-guide.md) | 디자인 가이드 (UI 컨벤션 + 디자인 시스템) |
| [docs/testing-guide.md](docs/testing-guide.md) | 테스트 코드 가이드 |
| [docs/security-guide.md](docs/security-guide.md) | 보안 가이드 |
| [docs/error-handling.md](docs/error-handling.md) | 에러 핸들링 가이드 |
| [docs/state-management.md](docs/state-management.md) | 상태 관리 전략 |
| [docs/performance-guide.md](docs/performance-guide.md) | 성능 최적화 가이드 |
| [docs/cicd-guide.md](docs/cicd-guide.md) | CI/CD 설정 가이드 |
| [docs/dev-environment.md](docs/dev-environment.md) | 개발 환경 셋업 가이드 |

## 개발 규칙

- 모든 문서·커밋은 한국어로 작성
- TDD 방식 (테스트 먼저), Gitmoji + Conventional Commits
- GitHub Flow — main 직접 푸시 금지, PR 필수
