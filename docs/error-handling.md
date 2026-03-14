# 에러 핸들링 가이드

## 프론트엔드 에러 처리

### Error Boundary

React Error Boundary를 사용하여 컴포넌트 트리의 에러를 포착한다.

```tsx
import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("에러 발생:", error, errorInfo);
    // 에러 리포팅 서비스로 전송
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
```

### Error Boundary 배치 전략

```
App
├── ErrorBoundary (전체 앱 - 치명적 에러)
│   ├── Layout
│   │   ├── ErrorBoundary (페이지 단위)
│   │   │   └── Page
│   │   │       ├── ErrorBoundary (위젯/섹션 단위)
│   │   │       │   └── Widget
```

- **전체 앱**: 예상치 못한 치명적 에러 포착
- **페이지 단위**: 페이지별 에러 격리
- **위젯/섹션 단위**: 독립 기능의 에러가 전체 페이지에 영향을 주지 않도록 격리

## REST API 에러 처리

### HTTP 상태 코드 기반 처리

axios는 2xx 외의 상태 코드에서 에러를 throw한다. 응답 인터셉터에서 공통 처리하거나 서비스 함수에서 개별 처리한다.

```ts
// src/lib/apiClient.ts — 공통 에러 처리 (응답 인터셉터)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      tokenStorage.clearToken();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);
```

### 서비스 함수에서의 에러 처리

서비스 함수는 axios 에러를 의미 있는 앱 에러로 변환한다.

```ts
import { apiClient } from "@/lib/apiClient";
import { createAppError, isAxiosError } from "@/utils/error";
import type { Post } from "@/types/post";

export async function getPostById(id: number): Promise<Post> {
  try {
    const { data } = await apiClient.get<Post>(`/api/v1/posts/${id}`);
    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw createAppError("NOT_FOUND", "게시글을 찾을 수 없습니다.");
      }
      if (error.response?.status === 403) {
        throw createAppError("FORBIDDEN", "접근 권한이 없습니다.");
      }
    }
    throw createAppError("SERVER_ERROR", "데이터를 불러오는 중 오류가 발생했습니다.");
  }
}
```

### 앱 에러 타입 및 헬퍼

```ts
// src/types/error.ts
export interface AppError {
  code: string;
  message: string;
  details?: string;
}

// src/utils/error.ts
import axios from "axios";

export function createAppError(
  code: string,
  message: string,
  details?: string,
): AppError {
  return { code, message, details };
}

export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return "알 수 없는 오류가 발생했습니다.";
}

export function isAxiosError(error: unknown) {
  return axios.isAxiosError(error);
}

function isAppError(error: unknown): error is AppError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  );
}
```

### HTTP 상태 코드별 처리 방법

| HTTP 상태 | 상황 | 처리 방법 |
|----------|------|----------|
| `400 Bad Request` | 잘못된 요청 데이터 | 유효성 검증 오류 안내 |
| `401 Unauthorized` | 인증 필요 | 로그인 페이지로 리다이렉트 |
| `403 Forbidden` | 권한 없음 | 접근 권한 없음 안내 |
| `404 Not Found` | 리소스 없음 | 리소스 없음 안내 |
| `409 Conflict` | 중복 데이터 | 중복 안내 (이미 존재하는 이메일 등) |
| `422 Unprocessable Entity` | 유효성 검증 실패 | 필드별 에러 메시지 표시 |
| `429 Too Many Requests` | 요청 초과 | 잠시 후 재시도 안내 |
| `500 Internal Server Error` | 서버 오류 | 일시적 오류 안내 + 재시도 버튼 |

```ts
export function handleApiError(error: unknown): AppError {
  if (!isAxiosError(error)) {
    return createAppError("UNKNOWN_ERROR", "알 수 없는 오류가 발생했습니다.");
  }

  const status = error.response?.status;
  const errorMap: Record<number, AppError> = {
    400: createAppError("BAD_REQUEST", "잘못된 요청입니다."),
    401: createAppError("UNAUTHORIZED", "로그인이 필요합니다."),
    403: createAppError("FORBIDDEN", "접근 권한이 없습니다."),
    404: createAppError("NOT_FOUND", "요청한 리소스를 찾을 수 없습니다."),
    409: createAppError("CONFLICT", "이미 존재하는 데이터입니다."),
    429: createAppError("TOO_MANY_REQUESTS", "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."),
    500: createAppError("SERVER_ERROR", "서버 오류가 발생했습니다."),
  };

  return status ? (errorMap[status] ?? createAppError("SERVER_ERROR", "서버 오류가 발생했습니다.")) : createAppError("NETWORK_ERROR", "네트워크 오류가 발생했습니다.");
}
```

### 인증 에러 처리

```ts
// src/services/authService.ts
export async function login(body: LoginRequest): Promise<LoginResponse> {
  try {
    const { data } = await apiClient.post<LoginResponse>("/api/v1/auth/login", body);
    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw createAppError("AUTH_FAILED", "이메일 또는 비밀번호가 올바르지 않습니다.");
      }
    }
    throw createAppError("AUTH_ERROR", "로그인 중 오류가 발생했습니다.");
  }
}
```

### 컴포넌트에서의 에러 처리

```tsx
function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await getPosts();
        setPosts(data.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    }
    loadPosts();
  }, []);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  return <ul>{/* 렌더링 */}</ul>;
}
```

## TanStack Query에서의 에러 처리

```tsx
import { useQuery } from "@tanstack/react-query";
import { getPostById } from "@/services/postService";
import { getErrorMessage } from "@/utils/error";

export function usePost(id: number) {
  return useQuery({
    queryKey: ["post", id],
    queryFn: () => getPostById(id),
  });
}

// 컴포넌트에서 사용
function PostDetail({ id }: { id: number }) {
  const { data: post, isLoading, error } = usePost(id);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={getErrorMessage(error)} />;
  if (!post) return null;

  return <article>{/* 렌더링 */}</article>;
}
```

## 에러 응답 형식

앱 전체에서 일관된 에러 형식을 사용한다:

```ts
// 앱 에러 (서비스 → 컴포넌트)
interface AppError {
  code: string;
  message: string;       // 사용자에게 표시할 메시지
  details?: string;      // 추가 정보 (선택)
}
```

## 로깅 전략

### 로그 레벨

| 레벨 | 용도 | 예시 |
|------|------|------|
| `error` | 즉시 대응이 필요한 오류 | API 연결 실패, 인증 오류 |
| `warn` | 잠재적 문제 | 권한 거부 시도, 느린 응답 |
| `info` | 주요 이벤트 | 사용자 로그인, 게시글 작성 |
| `debug` | 디버깅용 상세 정보 | API 응답 데이터 |

### 로깅 규칙

- 프로덕션에서는 `info` 이상만 출력한다.
- 개인정보(비밀번호, 토큰 등)를 로그에 포함하지 않는다.
- 클라이언트에서는 에러 리포팅 서비스(Sentry 등)를 사용한다.

```ts
// 좋은 예
console.error("게시글 조회 실패", { postId, statusCode: error.response?.status });

// 나쁜 예
console.error(`에러: ${error}`);                    // 구조화되지 않음
console.error("로그인 실패", { password: "..." });   // 민감 정보 포함
```

## 사용자 에러 메시지 가이드라인

### 원칙

1. **사용자 친화적**: 기술 용어 대신 이해하기 쉬운 표현을 사용한다.
2. **구체적**: 무엇이 잘못되었는지 명확히 설명한다.
3. **해결 방법 제시**: 가능하면 사용자가 취할 수 있는 행동을 안내한다.
4. **내부 구현 숨김**: HTTP 상태 코드, 스택 트레이스 등을 노출하지 않는다.

### 예시

| 상황 | 나쁜 메시지 | 좋은 메시지 |
|------|-----------|-----------|
| 네트워크 오류 | `Network Error` | `일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.` |
| 401 Unauthorized | `Request failed with status code 401` | `로그인이 필요합니다.` |
| 403 Forbidden | `403 Forbidden` | `이 작업을 수행할 권한이 없습니다.` |
| JWT 만료 | `JWT expired` | `세션이 만료되었습니다. 다시 로그인해주세요.` |
| 중복 이메일 | `duplicate key value` | `이미 등록된 이메일 주소입니다.` |

## 관련 문서

- [보안 가이드](security-guide.md)
- [테스트 가이드](testing-guide.md)
- [코드 리뷰 체크리스트](code-review-checklist.md)
