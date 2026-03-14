# PRD: AWS Board (커뮤니티 게시판)

## 1. 프로젝트 개요

### 서비스 목적

AWS Board는 사용자들이 자유롭게 게시글을 작성하고 댓글로 소통할 수 있는 커뮤니티 게시판 서비스다. 회원 가입 후 인증된 사용자가 게시글과 댓글을 작성하며, 파일 첨부 기능도 제공한다.

### 배경 및 동기

Vite + React + TypeScript 프론트엔드와 NestJS + Prisma 백엔드를 연동하는 풀스택 실습 프로젝트다. AWS EC2에 백엔드를 배포하고, Vercel에 프론트엔드를 배포하는 실전 경험을 목표로 한다.

### 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | Vite + React + TypeScript |
| 라우팅 | TanStack Router |
| 서버 상태 관리 | TanStack Query (React Query) |
| HTTP 클라이언트 | Axios (`lib/apiClient.ts`) |
| 린트/포매팅 | Biome |
| 테스트 | Vitest |
| 백엔드 | NestJS + Prisma (별도 구성) |
| 백엔드 서버 | AWS EC2 (`http://3.38.166.223:3000`) |
| 프론트엔드 배포 | Vercel |
| 파일 저장소 | AWS S3 (Presigned URL 기반) |

---

## 2. 대상 사용자

### 페르소나

| 구분 | 설명 |
|------|------|
| 일반 방문자 | 비로그인 상태로 게시글 목록 및 상세를 열람할 수 있는 사용자 |
| 회원 | 회원가입 후 로그인한 사용자. 게시글/댓글 작성, 수정, 삭제 가능 |

---

## 3. 기능 요구사항

### F1: 인증 ✅ 구현 완료

#### F1-1. 회원가입

- 이메일, 비밀번호, 닉네임을 입력하여 계정을 생성한다.
- 이메일 중복 및 형식 검증을 수행한다.
- 성공 시 로그인 페이지로 이동한다.

#### F1-2. 로그인

- 이메일과 비밀번호로 로그인한다.
- 성공 시 JWT 액세스 토큰을 발급받아 `localStorage`에 저장한다.
- 로그인 후 홈 페이지로 이동한다.

#### F1-3. 로그아웃

- 저장된 JWT 토큰을 삭제한다.
- 로그인 페이지로 이동한다.

#### F1-4. 세션 유지

- 페이지 새로고침 시 `localStorage`의 토큰으로 인증 상태를 복원한다.
- `GET /api/v1/auth/me`를 호출하여 현재 사용자 정보를 확인한다.
- 토큰 만료(401) 시 자동으로 로그아웃 처리 후 로그인 페이지로 이동한다.

---

### F2: 게시글 🔲 구현 예정

#### F2-1. 게시글 목록 조회

- 커서 기반 페이지네이션으로 게시글 목록을 조회한다.
- 키워드 검색을 지원한다 (`keyword` 파라미터).
- 각 게시글에는 제목, 작성자 닉네임, 작성일, 조회수, 댓글 수를 표시한다.
- 비로그인 사용자도 조회 가능하다.

#### F2-2. 게시글 상세 조회

- 특정 게시글의 제목, 본문, 첨부파일, 작성자, 작성일, 조회수를 표시한다.
- 댓글 목록을 함께 표시한다.
- 비로그인 사용자도 조회 가능하다.

#### F2-3. 게시글 작성

- 로그인한 사용자만 작성 가능하다.
- 제목과 본문을 입력한다.
- 파일 첨부를 지원한다 (F4 참조).
- 제목 최대 200자 제한을 검증한다.

#### F2-4. 게시글 수정

- 게시글 작성자만 수정 가능하다.
- 제목, 본문을 수정할 수 있다.

#### F2-5. 게시글 삭제

- 게시글 작성자만 삭제 가능하다.
- 삭제 확인 다이얼로그를 표시한다.
- 삭제 후 게시글 목록으로 이동한다.

---

### F3: 댓글 🔲 구현 예정

#### F3-1. 댓글 목록 조회

- 게시글 상세 페이지에서 해당 게시글의 댓글 목록을 표시한다.
- 각 댓글에는 작성자 닉네임, 내용, 작성일을 표시한다.
- 비로그인 사용자도 조회 가능하다.

#### F3-2. 댓글 작성

- 로그인한 사용자만 작성 가능하다.
- 내용을 입력하여 댓글을 작성한다.

#### F3-3. 댓글 수정

- 댓글 작성자만 수정 가능하다.

#### F3-4. 댓글 삭제

- 댓글 작성자만 삭제 가능하다.

---

### F4: 파일 첨부 🔲 구현 예정

- 게시글 작성/수정 시 파일을 첨부할 수 있다.
- AWS S3 Presigned URL을 통해 클라이언트에서 직접 S3에 업로드한다.
- 업로드 완료 후 백엔드에 첨부파일 정보(fileName, fileKey, fileSize, mimeType)를 등록한다.
- 게시글 상세에서 첨부파일 목록을 표시하고 다운로드 링크를 제공한다.

---

## 4. 화면(페이지) 목록

| 페이지 | 경로 | 상태 | 설명 |
|--------|------|------|------|
| 홈 | `/` | ✅ 구현 완료 | 서비스 진입점 (게시글 목록으로 이동 예정) |
| 로그인 | `/login` | ✅ 구현 완료 | 이메일/비밀번호 로그인 폼 |
| 회원가입 | `/register` | ✅ 구현 완료 | 이메일/비밀번호/닉네임 입력 폼 |
| 게시글 목록 | `/posts` | 🔲 구현 예정 | 커서 페이지네이션 + 키워드 검색 |
| 게시글 상세 | `/posts/:id` | 🔲 구현 예정 | 게시글 본문 + 댓글 목록 |
| 게시글 작성 | `/posts/new` | 🔲 구현 예정 | 제목/본문/파일 첨부 입력 폼 |
| 게시글 수정 | `/posts/:id/edit` | 🔲 구현 예정 | 기존 내용 수정 폼 |

---

## 5. 비기능 요구사항

### 성능

- 게시글 목록은 커서 기반 페이지네이션으로 불필요한 데이터 로딩을 최소화한다.
- TanStack Query를 통해 서버 상태를 캐싱하여 중복 API 호출을 줄인다.
- 상세 가이드: [docs/performance-guide.md](performance-guide.md)

### 보안

- JWT 토큰은 `localStorage`에 저장하며, XSS 방지를 위해 사용자 입력을 반드시 새니타이즈한다.
- 인증이 필요한 기능(게시글 작성·수정·삭제, 댓글 작성·수정·삭제)은 서버에서 권한을 검증한다.
- 클라이언트에는 민감한 시크릿을 포함하지 않는다. `VITE_API_BASE_URL`만 환경변수로 노출한다.
- OWASP Top 10 기준을 준수한다.
- 상세 가이드: [docs/security-guide.md](security-guide.md)

### 접근성

- 폼 요소에 적절한 `label`과 `aria` 속성을 제공한다.
- 키보드 내비게이션을 지원한다.
- 에러 메시지는 시각적으로 명확하게 표시한다.

---

## 6. API 연동 명세

### 인증

| 메서드 | 엔드포인트 | 인증 필요 | 설명 |
|--------|-----------|-----------|------|
| `POST` | `/api/v1/auth/register` | X | 회원가입 |
| `POST` | `/api/v1/auth/login` | X | 로그인 (JWT 발급) |
| `GET` | `/api/v1/auth/me` | O | 현재 사용자 정보 조회 |

### 게시글

| 메서드 | 엔드포인트 | 인증 필요 | 설명 |
|--------|-----------|-----------|------|
| `GET` | `/api/v1/posts` | X | 게시글 목록 조회 (`cursor`, `limit`, `keyword`) |
| `GET` | `/api/v1/posts/:id` | X | 게시글 상세 조회 |
| `POST` | `/api/v1/posts` | O | 게시글 작성 |
| `PATCH` | `/api/v1/posts/:id` | O | 게시글 수정 (작성자만) |
| `DELETE` | `/api/v1/posts/:id` | O | 게시글 삭제 (작성자만) |

### 댓글

| 메서드 | 엔드포인트 | 인증 필요 | 설명 |
|--------|-----------|-----------|------|
| `GET` | `/api/v1/posts/:id/comments` | X | 댓글 목록 조회 |
| `POST` | `/api/v1/posts/:id/comments` | O | 댓글 작성 |
| `PATCH` | `/api/v1/comments/:id` | O | 댓글 수정 (작성자만) |
| `DELETE` | `/api/v1/comments/:id` | O | 댓글 삭제 (작성자만) |

### 파일 업로드 (S3)

| 메서드 | 엔드포인트 | 인증 필요 | 설명 |
|--------|-----------|-----------|------|
| `POST` | `/api/v1/files/presigned-url` | O | S3 Presigned URL 발급 |
| `POST` | `/api/v1/posts/:id/attachments` | O | 첨부파일 정보 등록 |

### 주요 요청/응답 타입

```ts
// 회원가입 요청
interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
}

// 로그인 응답
interface LoginResponse {
  accessToken: string;
  user: { id: number; email: string; nickname: string; createdAt: string };
}

// 게시글
interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  authorNickname: string;
  viewCount: number;
  commentCount: number;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

// 게시글 목록 응답 (커서 페이지네이션)
interface PostListResponse {
  data: Post[];
  nextCursor: string | null;
}

// 댓글
interface Comment {
  id: number;
  postId: number;
  authorId: number;
  authorNickname: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
```

상세 타입 정의는 [docs/data-modeling.md](data-modeling.md)를 참조한다.

---

## 7. 구현 현황

### 기능 체크리스트

| 기능 | 상태 |
|------|------|
| **인증** | |
| 회원가입 페이지 및 API 연동 | ✅ |
| 로그인 페이지 및 API 연동 | ✅ |
| 로그아웃 | ✅ |
| JWT 토큰 저장 및 세션 유지 | ✅ |
| 401 응답 시 자동 로그아웃 | ✅ |
| **게시글** | |
| 게시글 목록 페이지 | 🔲 |
| 커서 기반 페이지네이션 | 🔲 |
| 키워드 검색 | 🔲 |
| 게시글 상세 페이지 | 🔲 |
| 게시글 작성 페이지 | 🔲 |
| 게시글 수정 페이지 | 🔲 |
| 게시글 삭제 | 🔲 |
| **댓글** | |
| 댓글 목록 조회 | 🔲 |
| 댓글 작성 | 🔲 |
| 댓글 수정 | 🔲 |
| 댓글 삭제 | 🔲 |
| **파일 첨부** | |
| S3 Presigned URL 업로드 | 🔲 |
| 첨부파일 목록 표시 | 🔲 |
| **인프라/공통** | |
| 기본 UI 컴포넌트 (Button, Input) | ✅ |
| API 클라이언트 (`lib/apiClient.ts`) | ✅ |
| JWT 토큰 관리 (`lib/tokenStorage.ts`) | ✅ |
| Vercel 배포 설정 | ✅ |
| GitHub Actions CI | 🔲 |

---

## 관련 문서

| 문서 | 설명 |
|------|------|
| [data-modeling.md](data-modeling.md) | API 데이터 모델 (DTO/타입 정의) |
| [project-structure.md](project-structure.md) | 프로젝트 폴더 구조 가이드 |
| [error-handling.md](error-handling.md) | 에러 핸들링 가이드 |
| [security-guide.md](security-guide.md) | 보안 가이드 |
| [testing-guide.md](testing-guide.md) | 테스트 코드 가이드 |
| [state-management.md](state-management.md) | 상태 관리 전략 |
