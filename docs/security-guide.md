# 보안 가이드

## OWASP Top 10 체크리스트

### 1. 인젝션 방지

- 사용자 입력을 절대 직접 URL이나 쿼리 파라미터에 삽입하지 않는다.
- axios의 `params` 옵션을 사용하여 쿼리 파라미터를 전달한다.
- 입력값은 zod 등 스키마 검증 라이브러리로 검증한 후 API에 전달한다.

```ts
// 좋은 예: axios params 사용 (자동 인코딩)
const { data } = await apiClient.get("/api/v1/posts", {
  params: { keyword: userInput },
});

// 나쁜 예: 직접 문자열 결합
const { data } = await apiClient.get(`/api/v1/posts?keyword=${userInput}`);
```

### 2. 인증 취약점 방지

- JWT 토큰은 `lib/tokenStorage.ts`를 통해서만 관리한다.
- 토큰은 XSS 공격에 노출될 수 있는 위치에 저장하지 않는다.
- 모든 인증 요청에 `Authorization: Bearer {token}` 헤더를 포함한다.
- 401 응답 수신 시 즉시 토큰을 제거하고 로그인 페이지로 리다이렉트한다.

```ts
// apiClient.ts 응답 인터셉터에서 401 처리
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

### 3. XSS 방지

- React의 기본 이스케이핑을 활용한다.
- `dangerouslySetInnerHTML` 사용을 금지한다. 불가피한 경우 DOMPurify로 새니타이즈한다.
- JWT 토큰을 localStorage에 저장하는 경우 XSS 취약점이 생길 수 있음을 인지하고, CSP(Content Security Policy) 헤더를 설정한다.

```ts
// 좋은 예
<p>{userInput}</p>

// 나쁜 예
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// 불가피한 경우
import DOMPurify from "dompurify";
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### 4. CSRF 방지

- JWT Bearer 토큰 방식은 쿠키를 사용하지 않으므로 CSRF 위험이 낮다.
- httpOnly 쿠키로 토큰을 관리하는 경우 SameSite=Strict 또는 SameSite=Lax를 설정한다.

### 5. 보안 설정 오류 방지

- 프로덕션에서 디버그 모드를 비활성화한다.
- 보안 관련 HTTP 헤더를 설정한다.

```ts
// 권장 보안 헤더 (Vercel vercel.json 또는 미들웨어에서 설정)
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-XSS-Protection": "0",
  "Referrer-Policy": "strict-origin-when-cross-origin"
}
```

## JWT 토큰 보안

### 저장 방식 선택

| 방식 | XSS 취약성 | CSRF 취약성 | 권장 여부 |
|------|-----------|-----------|----------|
| localStorage | 있음 | 없음 | 주의 필요 (CSP 보완) |
| sessionStorage | 있음 | 없음 | 탭 닫으면 만료 |
| httpOnly 쿠키 | 없음 | 있음 (SameSite로 완화) | 권장 |
| 메모리 | 없음 | 없음 | 새로고침 시 소실 |

### 토큰 관리 규칙

- 토큰을 콘솔 로그에 출력하지 않는다.
- 토큰 만료 시 자동 로그아웃 처리한다.
- 로그아웃 시 토큰을 즉시 삭제한다.
- 토큰을 URL에 포함하지 않는다.

```ts
// src/lib/tokenStorage.ts
const TOKEN_KEY = "access_token";

export const tokenStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
};
```

## 입력 검증 및 새니타이제이션

### 원칙

- **클라이언트 측 검증 + 서버 측 검증 이중 구조**를 사용한다.
- 클라이언트 측 검증은 UX를 위해, 서버 측 검증은 보안을 위해 적용한다.
- 검증 라이브러리(zod, valibot 등)를 사용한다.

```ts
import { z } from "zod";

const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
});

// 서비스 함수에서 검증 후 API 호출
export async function createPost(input: unknown) {
  const validated = CreatePostSchema.parse(input);
  const { data } = await apiClient.post("/api/v1/posts", validated);
  return data;
}
```

### 파일 업로드 검증

- 허용 MIME 타입을 클라이언트에서도 검증한다.
- 파일 크기 제한을 클라이언트에서도 적용한다.
- S3 Presigned Post 방식으로 업로드 시 서버에서 조건을 부여한다.

```ts
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function validateFile(file: File): void {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("허용되지 않는 파일 형식입니다.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("파일 크기는 10MB 이하여야 합니다.");
  }
}
```

## 인증/인가 보안 패턴

### 보호된 라우트 패턴

```tsx
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;

  return children;
}
```

### 권한 검증

- 서버에서 최종 권한을 검증하므로, 클라이언트의 권한 분기는 UX 목적으로만 사용한다.
- 인가 실패(403 Forbidden) 시 적절한 오류 메시지를 사용자에게 안내한다.

## 환경변수 및 시크릿 관리

### 환경변수 규칙

```
# .env.example
VITE_API_BASE_URL=
```

- `VITE_` 접두사가 붙은 변수는 클라이언트에 노출된다.
- `VITE_API_BASE_URL`은 클라이언트에 노출되어도 안전하다.
- 시크릿(서비스 키, 결제 키 등)은 절대 클라이언트에 포함하지 않는다.
- `.env` 파일을 `.gitignore`에 반드시 포함한다.
- `.env.example` 파일에 필요한 환경변수 키만 기재한다 (값 없이).
- 코드에 시크릿을 하드코딩하지 않는다.

## 기능 개발 시 보안 검토 프로세스

모든 기능 개발은 TDD 사이클 완료 후 아래 보안 검토를 수행한다.

### 검토 시점

- 기능 구현 완료 시 (PR 생성 전)
- 코드 리뷰 시 (리뷰어가 재확인)

### 보안 검토 체크리스트

| 검토 항목 | 확인 내용 |
|-----------|----------|
| 입력 검증 | 사용자 입력에 zod 등 스키마 검증 적용 여부 |
| 인젝션 방지 | axios params 옵션 사용, URL 직접 결합 없음 |
| XSS 방지 | `dangerouslySetInnerHTML` 미사용 또는 DOMPurify 적용 |
| 인증/인가 | 보호 대상 데이터·페이지에 인증 확인 적용 |
| JWT 보안 | 토큰 노출 없음, 만료 처리 구현 |
| 시크릿 관리 | 코드 내 API 키·비밀번호 하드코딩 없음 |
| 에러 메시지 | 내부 구현 세부사항(스택 트레이스) 미노출 |
| 권한 경계 | 수평적·수직적 권한 상승 불가 확인 |
| 파일 업로드 | MIME 타입·파일 크기 제한 적용 확인 |

### 보안 테스트 작성 가이드

기능 테스트와 함께 보안 관련 테스트를 반드시 작성한다.

**필수 보안 테스트 유형:**

1. **인증 우회 테스트**: 미인증 상태에서 보호된 리소스에 접근할 수 없는지 확인
2. **입력 검증 테스트**: 비정상 입력(빈 값, 초과 길이, 특수문자, 스크립트 태그)에 대한 처리 확인
3. **권한 경계 테스트**: 다른 사용자의 데이터에 접근·수정·삭제할 수 없는지 확인

```ts
// 인증 우회 테스트 예시
it("미인증 상태에서 보호된 API를 호출하면 401 에러를 반환한다", async () => {
  tokenStorage.clearToken();
  await expect(createPost({ title: "테스트", content: "내용" })).rejects.toThrow();
});

// 입력 검증 테스트 예시
it("제목이 빈 문자열이면 유효성 검증 에러를 반환한다", () => {
  expect(() => CreatePostSchema.parse({ title: "", content: "내용" })).toThrow();
});
```

## 의존성 취약점 스캔

- `npm audit`를 정기적으로 실행한다.
- CI 파이프라인에 의존성 스캔을 포함한다.
- 알려진 취약점이 있는 의존성은 즉시 업데이트한다.
- 사용하지 않는 의존성은 제거한다.

```bash
# 취약점 스캔
npm audit

# 자동 수정 시도
npm audit fix
```

## 관련 문서

- [에러 핸들링](error-handling.md)
- [CI/CD 가이드](cicd-guide.md)
- [코드 리뷰 체크리스트](code-review-checklist.md)
- [프로젝트 구조](project-structure.md)
