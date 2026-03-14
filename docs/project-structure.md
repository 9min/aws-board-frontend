# 프로젝트 구조 가이드

## 프로젝트 루트 구조

백엔드는 별도로 구성되어 있으므로(NestJS + Prisma + AWS), 프론트엔드만 포함한다.

```
프로젝트-루트/
├── .vscode/                    # VSCode 설정 (settings.json, extensions.json 등)
├── .github/                    # GitHub Actions 워크플로우
│   └── workflows/
│       └── ci.yml              # CI/CD 파이프라인 (lint → type-check → test → build → deploy)
├── src/
│   ├── app/                    # 앱 진입점, 라우팅 설정
│   │   ├── router.ts           # TanStack Router 인스턴스
│   │   ├── routeTree.gen.ts    # 자동 생성 라우트 트리 (수정 금지)
│   │   └── routes/             # 파일 기반 라우트 (TanStack Router)
│   │       ├── __root.tsx      # 루트 레이아웃
│   │       ├── index.tsx       # / (홈)
│   │       ├── login.tsx       # /login
│   │       ├── register.tsx    # /register
│   │       └── posts/
│   │           ├── new.tsx     # /posts/new
│   │           └── $postId/
│   │               ├── index.tsx  # /posts/:postId
│   │               └── edit.tsx   # /posts/:postId/edit
│   ├── components/             # 컴포넌트
│   │   ├── ui/                 # 기본 UI 컴포넌트 (Button, Input 등)
│   │   ├── layout/             # 레이아웃 컴포넌트 (Header 등)
│   │   └── feature/            # 기능별 컴포넌트
│   │       ├── auth/           # 인증 관련 (LoginForm, RegisterForm)
│   │       ├── post/           # 게시글 관련 (PostCard, PostForm)
│   │       ├── comment/        # 댓글 관련 (CommentList, CommentForm)
│   │       └── file/           # 파일 업로드 관련 (FileUpload)
│   ├── contexts/               # React Context (AuthContext)
│   ├── hooks/                  # 커스텀 훅
│   ├── lib/                    # 외부 라이브러리 설정
│   │   ├── apiClient.ts        # axios 인스턴스 (baseURL, 인터셉터)
│   │   ├── tokenStorage.ts     # JWT 토큰 저장/조회
│   │   └── queryClient.ts      # TanStack Query 클라이언트 설정
│   ├── services/               # REST API 호출 함수 (도메인별 분리)
│   ├── types/                  # TypeScript 타입 정의 (DTO, 응답 타입 등)
│   ├── utils/                  # 유틸리티 함수
│   ├── constants/              # 상수 정의 (API 엔드포인트 등)
│   ├── assets/                 # 정적 에셋 (이미지 등)
│   └── test/
│       └── setup.ts            # Vitest 전역 설정
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

API 클라이언트, JWT 토큰 저장소, TanStack Query 클라이언트를 포함한다.

```ts
// src/lib/apiClient.ts
import axios from "axios";
import { tokenStorage } from "@/lib/tokenStorage";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// 요청 인터셉터: JWT 토큰 자동 첨부
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
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
      tokenStorage.clearTokens();
      const isAuthRoute = ["/login", "/register"].some((path) =>
        window.location.pathname.startsWith(path),
      );
      if (!isAuthRoute) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
```

```ts
// src/lib/tokenStorage.ts
const ACCESS_TOKEN_KEY = "access_token";

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string) => localStorage.setItem(ACCESS_TOKEN_KEY, token),
  clearTokens: () => localStorage.removeItem(ACCESS_TOKEN_KEY),
  hasAccessToken: () => Boolean(localStorage.getItem(ACCESS_TOKEN_KEY)),
};
```

### `src/services/` — REST API 호출 함수

도메인별로 파일을 분리하여 API 호출 함수를 정의한다.

```ts
// src/services/authService.ts
import { AUTH_ENDPOINTS } from "@/constants/apiEndpoints";
import { apiClient } from "@/lib/apiClient";
import type { LoginRequest, LoginResponse, RegisterRequest } from "@/types/auth";
import { handleApiError } from "@/utils/error";

export const authService = {
  async register(body: RegisterRequest): Promise<void> {
    try {
      await apiClient.post(AUTH_ENDPOINTS.REGISTER, body);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async login(body: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<{ data: LoginResponse }>(
        AUTH_ENDPOINTS.LOGIN,
        body,
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
```

```ts
// src/services/postService.ts
import { POST_ENDPOINTS } from "@/constants/apiEndpoints";
import { apiClient } from "@/lib/apiClient";
import type { Post, PostListResponse, CreatePostRequest, PostSearchParams } from "@/types/post";
import { handleApiError } from "@/utils/error";

export const postService = {
  async getPosts(params?: PostSearchParams): Promise<PostListResponse> {
    try {
      const response = await apiClient.get(POST_ENDPOINTS.BASE, { params });
      const { items, nextCursor } = response.data.data;
      return { data: items, nextCursor };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async createPost(body: CreatePostRequest): Promise<Post> {
    try {
      const response = await apiClient.post(POST_ENDPOINTS.BASE, body);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
```

### `src/types/` — 타입 정의

백엔드 API의 요청/응답 DTO 타입을 정의한다.

```ts
// src/types/auth.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface AuthUser {
  id: number;
  email: string;
  nickname?: string;
  createdAt?: string;
}

export interface LoginResponse {
  accessToken: string;
}
```

```ts
// src/types/post.ts
export interface PostAuthor {
  id: number;
  nickname: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  author: PostAuthor;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  attachments?: Attachment[];
}

export interface PostListResponse {
  data: Post[];
  nextCursor: number | null;
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
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./src/app/routes",
      generatedRouteTree: "./src/app/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
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
