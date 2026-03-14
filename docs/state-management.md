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
import { getPosts, createPost } from "@/services/postService";

// 조회
export function usePosts(cursor?: string) {
  return useQuery({
    queryKey: ["posts", cursor],
    queryFn: () => getPosts(cursor),
  });
}

// 생성 + 캐시 무효화
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
```

### 커서 페이지네이션 패턴

백엔드가 커서 기반 페이지네이션을 사용하는 경우 `useInfiniteQuery`를 활용한다.

```tsx
import { useInfiniteQuery } from "@tanstack/react-query";
import { getPosts } from "@/services/postService";

export function useInfinitePosts() {
  return useInfiniteQuery({
    queryKey: ["posts", "infinite"],
    queryFn: ({ pageParam }) => getPosts(pageParam as string | undefined),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
  });
}
```

### TanStack Query Provider 설정

```tsx
// src/app/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60, // 1분
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* 라우터 및 앱 컴포넌트 */}
    </QueryClientProvider>
  );
}
```

## 클라이언트 상태 관리

### React Context

전역 상태가 1~2개이고 업데이트 빈도가 낮을 때 사용한다.

```tsx
// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { tokenStorage } from "@/lib/tokenStorage";
import type { User } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 앱 초기화 시 토큰 존재 여부로 인증 상태 복원
    const token = tokenStorage.getToken();
    if (!token) {
      setIsLoading(false);
    }
    // 토큰이 있으면 유저 정보 조회 (필요 시)
    setIsLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    tokenStorage.setToken(token);
    setUser(userData);
  };

  const logout = () => {
    tokenStorage.clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth는 AuthProvider 내에서 사용해야 합니다");
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

## stores/ 디렉토리 구조

- **Zustand 사용 시**: `src/stores/` 디렉토리에 스토어 파일을 배치한다.
- **React Context만 사용 시**: `src/contexts/` 디렉토리에 Context 파일을 배치한다.
- 파일 네이밍: `use[도메인]Store.ts` (예: `useThemeStore.ts`, `useCartStore.ts`)

```
# Zustand 사용 시
src/stores/
├── useThemeStore.ts
└── useNotificationStore.ts

# React Context만 사용 시
src/contexts/
├── AuthContext.tsx
└── ThemeContext.tsx
```

## 관련 문서

- [프로젝트 구조](project-structure.md)
- [성능 최적화 가이드](performance-guide.md)
