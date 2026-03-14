# 테스트 코드 가이드

## 개발 방법론: TDD (Test-Driven Development)

본 프로젝트는 **TDD 방식**으로 개발한다. 모든 기능 개발 시 아래 사이클을 따른다.

### TDD 사이클

1. **Red**: 실패하는 테스트를 먼저 작성한다.
2. **Green**: 테스트를 통과하는 **최소한의** 구현 코드를 작성한다.
3. **Refactor**: 테스트가 통과하는 상태를 유지하면서 코드를 개선한다.

### TDD 개발 흐름

```
1. 요구사항 분석
2. 테스트 케이스 설계 (정상 케이스 + 엣지 케이스)
3. 테스트 코드 작성 (Red - 컴파일/실행 실패 확인)
4. 최소 구현 (Green - 테스트 통과 확인)
5. 리팩토링 (Refactor - 테스트 통과 유지)
6. 2~5 반복
```

### TDD 실천 예시

```ts
// 1단계: Red - 실패하는 테스트 작성
import { describe, it, expect } from "vitest";
import { validateEmail } from "@/utils/validateEmail";

describe("validateEmail", () => {
  it("올바른 이메일 형식이면 true를 반환한다", () => {
    expect(validateEmail("user@example.com")).toBe(true);
  });

  it("@가 없으면 false를 반환한다", () => {
    expect(validateEmail("userexample.com")).toBe(false);
  });

  it("빈 문자열이면 false를 반환한다", () => {
    expect(validateEmail("")).toBe(false);
  });
});

// 2단계: Green - 테스트를 통과하는 최소 구현
// src/utils/validateEmail.ts
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 3단계: Refactor - 필요 시 코드 개선 (테스트 통과 유지)
```

### TDD 적용 범위

| 대상 | TDD 적용 | 비고 |
|------|---------|------|
| 유틸리티 함수 | 필수 | 순수 함수이므로 TDD에 가장 적합 |
| 서비스 함수 | 필수 | 비즈니스 로직의 핵심 |
| 커스텀 훅 | 필수 | 상태 로직 검증 |
| 컴포넌트 | 권장 | 사용자 인터랙션 중심으로 테스트 |
| E2E 시나리오 | 선택 | 핵심 플로우에 한해 적용 |

### TDD 주의사항

- 한 번에 하나의 테스트만 추가한다. 여러 테스트를 동시에 작성하지 않는다.
- Green 단계에서는 테스트를 통과하는 **가장 단순한 코드**를 작성한다. 과도한 설계를 하지 않는다.
- Refactor 단계에서 새로운 기능을 추가하지 않는다. 기능 추가는 새 테스트부터 시작한다.
- 테스트가 실패하는 상태에서 다른 기능 개발로 넘어가지 않는다.

### TDD + 보안 검토 통합 프로세스

기능 개발 시 TDD 사이클과 보안 검토를 아래 순서로 통합하여 진행한다.

```
1. 요구사항 분석
2. 테스트 케이스 설계 (기능 + 보안 테스트 포함)
3. TDD 사이클 (Red → Green → Refactor)
4. 보안 검토 (아래 체크리스트 점검)
5. 코드 리뷰
```

#### 기능 개발 시 보안 검토 체크리스트

기능 구현을 완료할 때마다 아래 항목을 점검한다.

- [ ] **입력 검증**: 사용자 입력에 대해 zod 등으로 스키마 검증을 적용했는가?
- [ ] **인젝션 방지**: axios `params` 옵션을 사용하고, 직접 URL 문자열 결합을 하지 않았는가?
- [ ] **XSS 방지**: `dangerouslySetInnerHTML`을 사용하지 않았는가? 불가피한 경우 새니타이즈했는가?
- [ ] **인증/인가**: 보호가 필요한 데이터/페이지에 인증 확인이 적용되었는가?
- [ ] **파일 업로드 권한**: 로그인한 사용자만 파일 업로드 기능에 접근 가능한가?
- [ ] **시크릿 노출**: 코드에 API 키, 비밀번호 등이 하드코딩되지 않았는가?
- [ ] **에러 노출**: 에러 메시지에 내부 구현 세부사항(스택 트레이스 등)이 노출되지 않는가?
- [ ] **권한 경계**: 다른 사용자의 게시글/댓글/첨부파일에 접근할 수 없는가? (수평적 권한 상승 방지)

#### 보안 테스트 작성 예시

```ts
describe("PostForm 보안", () => {
  it("제목이 200자를 초과하면 제출 버튼이 비활성화된다", async () => {
    render(<PostForm onSubmit={vi.fn()} />);
    const titleInput = screen.getByLabelText("제목");
    await userEvent.type(titleInput, "가".repeat(201));
    expect(screen.getByRole("button", { name: "등록" })).toBeDisabled();
  });

  it("HTML 태그가 포함된 입력을 안전하게 처리한다", () => {
    const maliciousInput = '<script>alert("xss")</script>';
    render(<PostCard title={maliciousInput} />);
    // React는 기본적으로 이스케이핑하므로 script 태그가 실행되지 않는다
    expect(document.querySelector("script")).toBeNull();
  });
});
```

## 테스트 도구

- **테스트 프레임워크**: Vitest
- **컴포넌트 테스트**: @testing-library/react
- **E2E 테스트**: Playwright (필요 시)

## 테스트 파일 위치 및 네이밍

### 파일 위치

테스트 파일은 소스 파일과 동일한 디렉토리에 코로케이션(colocation) 방식으로 배치한다. (`*.test.ts(x)` 파일을 소스 파일 옆에 둔다.)

```
src/
├── components/
│   ├── feature/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── LoginForm.test.tsx   # 소스 파일 옆에 배치
│   │   └── post/
│   │       ├── PostCard.tsx
│   │       └── PostCard.test.tsx
├── hooks/
│   ├── useAuthMutation.ts
│   └── useAuthMutation.test.ts
├── services/
│   ├── authService.ts
│   └── authService.test.ts
└── test/
    └── setup.ts                     # Vitest 전역 설정
```

### 파일 네이밍

- 단위/통합 테스트: `*.test.ts` 또는 `*.test.tsx`
- E2E 테스트: `*.e2e.test.ts`

## 테스트 종류 및 범위

### 단위 테스트 (Unit Test)

- **대상**: 유틸리티 함수, 커스텀 훅, 서비스 함수, 순수 함수
- **목표**: 개별 함수/모듈의 입출력 검증
- **비율**: 전체 테스트의 약 70%

```ts
import { describe, it, expect } from "vitest";
import { formatDate } from "@/utils/formatDate";

describe("formatDate", () => {
  it("Date 객체를 YYYY-MM-DD 형식으로 변환한다", () => {
    const date = new Date("2024-01-15");
    expect(formatDate(date)).toBe("2024-01-15");
  });

  it("유효하지 않은 날짜에 대해 빈 문자열을 반환한다", () => {
    expect(formatDate(new Date("invalid"))).toBe("");
  });
});
```

### 통합 테스트 (Integration Test)

- **대상**: 컴포넌트, API 엔드포인트, 여러 모듈의 연동
- **목표**: 모듈 간 상호작용 검증
- **비율**: 전체 테스트의 약 20%

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/feature/auth/LoginForm";

describe("LoginForm", () => {
  it("유효한 입력으로 폼을 제출하면 onSubmit이 호출된다", async () => {
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} isLoading={false} />);

    await userEvent.type(screen.getByLabelText("이메일"), "test@example.com");
    await userEvent.type(screen.getByLabelText("비밀번호"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "로그인" }));

    expect(handleSubmit).toHaveBeenCalledWith("test@example.com", "password123");
  });
});
```

### E2E 테스트 (End-to-End Test)

- **대상**: 핵심 사용자 시나리오 (로그인, 결제 등)
- **목표**: 전체 시스템의 동작 검증
- **비율**: 전체 테스트의 약 10%

## 테스트 커버리지

### 목표

| 항목 | 최소 목표 |
|------|----------|
| 전체 커버리지 | 70% |
| 비즈니스 로직 (services) | 90% |
| 유틸리티 함수 (utils) | 90% |
| 컴포넌트 | 60% |
| API 라우트 | 80% |

### 커버리지 실행

```bash
npx vitest run --coverage
```

## 테스트 작성 규칙

### describe/it 네이밍

- `describe`: 테스트 대상을 명시한다.
- `it`: 기대 동작을 한국어로 서술한다.

```ts
describe("AuthService", () => {
  describe("login", () => {
    it("올바른 자격 증명으로 토큰을 반환한다", () => {});
    it("잘못된 비밀번호로 에러를 던진다", () => {});
    it("존재하지 않는 사용자로 에러를 던진다", () => {});
  });
});
```

### AAA 패턴

모든 테스트는 Arrange-Act-Assert 패턴을 따른다.

```ts
it("사용자 이름을 업데이트한다", async () => {
  // Arrange: 테스트 데이터 및 환경 설정
  const user = createTestUser({ name: "기존이름" });

  // Act: 테스트 대상 실행
  const result = await updateUserName(user.id, "새이름");

  // Assert: 결과 검증
  expect(result.name).toBe("새이름");
});
```

### 테스트 격리

- 각 테스트는 독립적으로 실행 가능해야 한다.
- 테스트 간 상태를 공유하지 않는다.
- `beforeEach`에서 상태를 초기화한다.

## 모킹 전략

### 외부 의존성 모킹

API 호출, 데이터베이스 등 외부 의존성은 모킹한다.

```ts
import { vi } from "vitest";
import { fetchUser } from "@/services/userService";

vi.mock("@/services/userService");

const mockedFetchUser = vi.mocked(fetchUser);

it("사용자 정보를 정상적으로 표시한다", async () => {
  mockedFetchUser.mockResolvedValue({ id: "1", name: "홍길동" });
  // ...
});
```

### 모킹 최소화 원칙

- 외부 시스템 (API, DB, 파일 시스템)만 모킹한다.
- 내부 모듈의 모킹은 최소화한다.
- 모킹이 과도하면 테스트 대상의 설계를 재검토한다.

### 타이머 모킹

```ts
import { vi, beforeEach, afterEach } from "vitest";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it("5초 후에 자동으로 알림을 닫는다", () => {
  // ...
  vi.advanceTimersByTime(5000);
  // ...
});
```

## API 클라이언트 모킹 전략

### axios 모킹

`apiClient`는 axios 기반이므로 `vi.mock`으로 모킹한다.

```ts
import { vi } from "vitest";
import { apiClient } from "@/lib/apiClient";

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

const mockedGet = vi.mocked(apiClient.get);

it("게시글 목록을 정상적으로 조회한다", async () => {
  mockedGet.mockResolvedValue({
    data: { data: { items: [], total: 0, page: 1, totalPages: 1, limit: 10 }, error: null },
  });

  const result = await postService.getPagedPosts({ page: 1 });
  expect(result.data).toEqual([]);
});
```

### 인증 상태 모킹 (AuthContext)

```ts
import { vi } from "vitest";

// AuthContext 모킹
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    user: { id: 1, email: "test@example.com" },
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// 미인증 상태
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
  })),
}));
```

### 테스트 데이터 팩토리

```ts
// 게시글 팩토리 예시
import type { Post } from "@/types/post";

export function createTestPost(overrides: Partial<Post> = {}): Post {
  return {
    id: 1,
    title: "테스트 게시글",
    content: "테스트 내용",
    authorId: 1,
    author: { id: 1, nickname: "테스터" },
    viewCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}
```

### API 에러 시뮬레이션

```ts
import axios from "axios";

it("API 에러 시 AppError를 던진다", async () => {
  vi.mocked(apiClient.get).mockRejectedValue(
    Object.assign(new Error("Not Found"), {
      isAxiosError: true,
      response: { status: 404, data: { message: "게시글을 찾을 수 없습니다." } },
    })
  );

  await expect(postService.getPost(999)).rejects.toMatchObject({
    code: "NOT_FOUND",
  });
});
```

## 관련 문서

- [프로젝트 구조](project-structure.md)
- [CI/CD 가이드](cicd-guide.md)
- [데이터 모델링 가이드](data-modeling.md)
