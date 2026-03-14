# 상태 관리 전략

## 상태 분류

| 구분 | 정의 | 예시 | 관리 도구 |
|------|------|------|----------|
| 서버 상태 | REST API에서 가져오는 비동기 데이터 | 게시글 목록, 사용자 프로필 | TanStack Query |
| 클라이언트 상태 | 클라이언트에서만 존재하는 전역 상태 | 인증 정보, 테마 설정 | React Context / Zustand |
| UI 상태 | 특정 컴포넌트의 로컬 상태 | 모달 열림, 입력값 | useState / useReducer |

## 서버 상태 관리

### 권장 패턴: TanStack Query

REST API 기반 프로젝트에서 TanStack Query를 사용한다. 캐싱, 자동 재시도, 백그라운드 리페칭을 지원한다.

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "@/services/postService";
import type { CreatePostRequest } from "@/types/post";

// 페이지 기반 목록 조회
export function usePaginatedPosts(params: { page: number; search?: string; limit?: number }) {
  return useQuery({
    queryKey: ["posts", "paged", params],
    queryFn: () => postService.getPagedPosts(params),
  });
}

// 단건 조회
export function usePost(id: number) {
  return useQuery({
    queryKey: ["posts", id],
    queryFn: () => postService.getPost(id),
  });
}

// 생성 + 캐시 무효화
export function useCreatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreatePostRequest) => postService.createPost(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
```

### 커서 페이지네이션 패턴 (참고용)

커서 기반 무한 스크롤이 필요한 경우 `useInfiniteQuery`를 활용한다. 현재 프로젝트는 숫자 기반 페이지네이션(`usePaginatedPosts`)을 사용한다.

```tsx
import { useInfiniteQuery } from "@tanstack/react-query";
import { postService } from "@/services/postService";

// @deprecated — 현재는 usePaginatedPosts를 사용한다.
export function useInfinitePosts(params?: { search?: string; limit?: number }) {
  return useInfiniteQuery({
    queryKey: ["posts", params],
    queryFn: ({ pageParam }) =>
      postService.getPosts({ cursor: pageParam, ...params }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as number | undefined,
  });
}
```

### TanStack Query Provider 설정

```tsx
// src/lib/queryClient.ts — QueryClient 인스턴스를 별도 파일로 분리한다.
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1분
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// src/main.tsx — 앱 진입점에서 Provider를 설정한다.
// QueryClientProvider, ReactQueryDevtools, AuthProvider, RouterProvider를 래핑한다.
```

## 클라이언트 상태 관리

### React Context

전역 상태가 1~2개이고 업데이트 빈도가 낮을 때 사용한다.

```tsx
// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { tokenStorage } from "@/lib/tokenStorage";
import type { AuthUser, LoginResponse } from "@/types/auth";
import { decodeJwtPayload } from "@/utils/jwtDecode";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (response: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 앱 초기화 시 JWT 토큰을 디코딩하여 인증 상태 복원
    const token = tokenStorage.getAccessToken();
    if (token) {
      const payload = decodeJwtPayload(token);
      if (payload && payload.exp * 1000 > Date.now()) {
        setUser({ id: payload.sub, email: payload.email });
      } else {
        tokenStorage.clearTokens();
      }
    }
    setIsLoading(false);
  }, []);

  const login = (response: LoginResponse) => {
    tokenStorage.setAccessToken(response.accessToken);
    const payload = decodeJwtPayload(response.accessToken);
    if (payload) {
      setUser({ id: payload.sub, email: payload.email });
    }
  };

  const logout = () => {
    tokenStorage.clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: user !== null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.");
  }
  return context;
}
```

### Zustand

전역 상태가 3개 이상이거나 업데이트가 빈번할 때 사용한다.

```ts
// src/stores/useThemeStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),
    }),
    { name: "theme-storage" }
  )
);
```

### 선택 기준

| 기준 | React Context | Zustand |
|------|-------------|---------|
| 전역 상태 수 | 1~2개 | 3개 이상 |
| 업데이트 빈도 | 낮음 (인증, 테마) | 높음 |
| 리렌더링 최적화 | 수동 (memo, useMemo) | 자동 (selector) |
| 미들웨어 | 없음 | persist, devtools 등 |
| 설정 복잡도 | Provider 래핑 필요 | Provider 불필요 |

## UI 상태 관리

| 도구 | 사용 시점 | 예시 |
|------|----------|------|
| `useState` | 단순 토글, 단일 값 | 모달 열림, 탭 선택 |
| `useReducer` | 복잡한 상태 로직, 여러 필드 연관 | 다단계 폼, 복합 필터 |

```tsx
// useReducer 예제: 복잡한 폼 상태
interface FormState {
  values: Record<string, string>;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

type FormAction =
  | { type: "SET_FIELD"; field: string; value: string }
  | { type: "SET_ERROR"; field: string; error: string }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_END" };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, values: { ...state.values, [action.field]: action.value } };
    case "SET_ERROR":
      return { ...state, errors: { ...state.errors, [action.field]: action.error } };
    case "SUBMIT_START":
      return { ...state, isSubmitting: true };
    case "SUBMIT_END":
      return { ...state, isSubmitting: false };
  }
}
```

## 현재 상태 관리 구조

현재 프로젝트는 전역 클라이언트 상태가 인증 정보 하나이므로 Zustand 없이 React Context만 사용한다.

- **React Context**: `src/contexts/` 디렉토리에 Context 파일을 배치한다.
  - `AuthContext.tsx` — 인증 상태 (user, isAuthenticated, login, logout)
- **서버 상태**: TanStack Query (`src/hooks/` 아래의 커스텀 훅으로 캡슐화)

```
src/contexts/
└── AuthContext.tsx      # 현재 유일한 전역 클라이언트 상태
```

전역 클라이언트 상태가 3개 이상으로 증가하거나 업데이트 빈도가 높아지는 경우 `src/stores/`를 생성하고 Zustand를 도입한다.

```ts
// Zustand 도입 시 파일 네이밍 예시
// src/stores/useThemeStore.ts
// src/stores/useNotificationStore.ts
```

## 관련 문서

- [프로젝트 구조](project-structure.md)
- [성능 최적화 가이드](performance-guide.md)
