# 프로젝트 구조 가이드

## 프로젝트 루트 구조

백엔드는 별도로 구성되어 있으므로(NestJS + Prisma + AWS), 프론트엔드만 포함한다.

```
프로젝트-루트/
├── .vscode/                    # VSCode 설정 (settings.json, extensions.json 등)
├── .github/                    # GitHub Actions 워크플로우
│   └── workflows/
├── src/
│   ├── app/                    # 앱 진입점, 라우팅 설정
│   ├── components/             # 컴포넌트
│   │   ├── ui/                 # 기본 UI 컴포넌트 (Button, Input 등)
│   │   ├── layout/             # 레이아웃 컴포넌트 (Header, Footer 등)
│   │   └── feature/            # 기능별 컴포넌트
│   ├── hooks/                  # 커스텀 훅
│   ├── pages/                  # 페이지 컴포넌트
│   ├── lib/                    # 외부 라이브러리 설정
│   │   ├── apiClient.ts        # axios 인스턴스 (baseURL, 인터셉터)
│   │   └── tokenStorage.ts     # JWT 토큰 저장/조회
│   ├── services/               # REST API 호출 함수 (도메인별 분리)
│   ├── stores/                 # 상태 관리 (상세: state-management.md 참조)
│   ├── types/                  # TypeScript 타입 정의 (DTO, 응답 타입 등)
│   ├── utils/                  # 유틸리티 함수
│   └── constants/              # 상수 정의 (API 엔드포인트 등)
├── tests/                      # 테스트 파일
├── docs/                       # 프로젝트 문서
├── public/                     # 정적 파일
├── .env.example                # 환경변수 키 목록 (Git 추적)
├── .env.local                  # 로컬 환경변수 (Git 미추적)
├── index.html
├── biome.json                  # Biome 설정
├── package.json
├── tsconfig.json
├── vite.config.ts
└── CLAUDE.md                   # Claude Code 규칙
```

## 주요 디렉토리 설명

### `src/lib/` — 외부 라이브러리 설정

API 클라이언트와 JWT 토큰 저장소를 포함한다.

```ts
// src/lib/apiClient.ts
import axios from "axios";
import { tokenStorage } from "@/lib/tokenStorage";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터: JWT 토큰 자동 첨부
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 401 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenStorage.clearToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
```

```ts
// src/lib/tokenStorage.ts
const TOKEN_KEY = "access_token";

export const tokenStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
};
```

### `src/services/` — REST API 호출 함수

도메인별로 파일을 분리하여 API 호출 함수를 정의한다.

```ts
// src/services/authService.ts
import { apiClient } from "@/lib/apiClient";
import type { LoginRequest, LoginResponse } from "@/types/auth";

export async function login(body: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/api/v1/auth/login", body);
  return data;
}

export async function register(body: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/api/v1/auth/register", body);
  return data;
}
```

```ts
// src/services/postService.ts
import { apiClient } from "@/lib/apiClient";
import type { Post, PostListResponse, CreatePostRequest } from "@/types/post";

export async function getPosts(cursor?: string): Promise<PostListResponse> {
  const { data } = await apiClient.get<PostListResponse>("/api/v1/posts", {
    params: { cursor },
  });
  return data;
}

export async function createPost(body: CreatePostRequest): Promise<Post> {
  const { data } = await apiClient.post<Post>("/api/v1/posts", body);
  return data;
}
```

### `src/types/` — 타입 정의

백엔드 API의 요청/응답 DTO 타입을 정의한다.

```ts
// src/types/auth.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
    nickname: string;
  };
}
```

```ts
// src/types/post.ts
export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostListResponse {
  data: Post[];
  nextCursor: string | null;
}

export interface CreatePostRequest {
  title: string;
  content: string;
}
```

## 경로 Alias 설정

`@/` 경로 alias를 설정하여 상대 경로 대신 절대 경로를 사용한다.

### tsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### vite.config.ts

```ts
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
```

사용 예시:

```ts
// 좋은 예: alias 사용
import { apiClient } from "@/lib/apiClient";

// 나쁜 예: 상대 경로
import { apiClient } from "../../../lib/apiClient";
```

## 환경변수 파일 구조

| 파일 | 역할 | Git 추적 | 비고 |
|------|------|----------|------|
| `.env.example` | 환경변수 키 목록 (값 없음) | O | 팀원 온보딩용 |
| `.env.local` | 로컬 개발용 실제 값 | X | 각 개발자가 생성 |
| `.env` | 빌드/배포 시 사용 | X | CI/CD에서 주입 |

Vite 프로젝트에서는 클라이언트에서 접근할 환경변수에 `VITE_` 접두사를 붙인다.

```
# .env.example
VITE_API_BASE_URL=
```

상세 설정은 [개발 환경 셋업 가이드](dev-environment.md)를 참조한다.

## 네이밍 컨벤션

### 파일/폴더 이름

| 대상 | 규칙 | 예시 |
|------|------|------|
| React 컴포넌트 파일 | `PascalCase.tsx` | `LoginForm.tsx` |
| 훅 파일 | `camelCase.ts` | `useAuth.ts` |
| 서비스 파일 | `camelCase.ts` | `postService.ts` |
| 유틸리티 파일 | `camelCase.ts` | `formatDate.ts` |
| 타입 파일 | `camelCase.ts` | `post.ts` |
| 테스트 파일 | `*.test.ts(x)` | `LoginForm.test.tsx` |
| 상수 파일 | `camelCase.ts` | `apiEndpoints.ts` |

### 코드 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | `PascalCase` | `LoginForm`, `UserProfile` |
| 함수 | `camelCase` | `getUserById`, `formatDate` |
| 변수 | `camelCase` | `userName`, `isLoading` |
| 상수 | `UPPER_SNAKE_CASE` | `API_BASE_URL`, `MAX_RETRY` |
| 타입/인터페이스 | `PascalCase` | `User`, `ApiResponse` |
| Enum | `PascalCase` (멤버도) | `UserRole.Admin` |
| 커스텀 훅 | `use` 접두사 + `camelCase` | `useAuth`, `usePosts` |
| 이벤트 핸들러 | `handle` 접두사 | `handleSubmit`, `handleClick` |
| Boolean 변수 | `is`/`has`/`should` 접두사 | `isLoading`, `hasError` |

### 컴포넌트 구조

하나의 컴포넌트 파일은 다음 순서로 구성한다:

```tsx
// 1. import 문
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { User } from "@/types/user";

// 2. 타입 정의
interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading: boolean;
}

// 3. 컴포넌트 함수
export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  // 3-1. 훅
  const [email, setEmail] = useState("");

  // 3-2. 이벤트 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  // 3-3. 렌더링
  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

## 관련 문서

- [디자인 가이드](design-guide.md)
- [린트 설정](lint-config.md)
- [보안 가이드](security-guide.md)
- [개발 환경 셋업](dev-environment.md)
- [상태 관리 전략](state-management.md)
