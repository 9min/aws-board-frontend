# 성능 최적화 가이드

## React 렌더링 최적화

### React.memo 사용 기준

부모 리렌더링 시 props가 변경되지 않는 **무거운** 자식 컴포넌트에만 적용한다.

```tsx
// 좋은 예: 리스트 아이템처럼 반복 렌더링되는 무거운 컴포넌트
const TodoItem = React.memo(function TodoItem({ todo }: TodoItemProps) {
  return <div>{/* 복잡한 렌더링 */}</div>;
});

// 나쁜 예: 단순한 컴포넌트에 불필요하게 적용
const Label = React.memo(function Label({ text }: { text: string }) {
  return <span>{text}</span>;
});
```

### useMemo/useCallback 사용 기준

**기본적으로 사용하지 않고, 성능 문제가 확인된 후 적용한다.**

```tsx
// 좋은 예: 비용이 큰 계산
const sortedItems = useMemo(
  () => items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);

// 좋은 예: React.memo된 자식에 전달하는 콜백
const handleDelete = useCallback(
  (id: string) => deleteTodo(id),
  [deleteTodo]
);

// 나쁜 예: 단순한 값에 불필요하게 적용
const fullName = useMemo(() => `${first} ${last}`, [first, last]);
```

### 리렌더링 디버깅

React DevTools Profiler를 사용하여 불필요한 리렌더링을 확인한다.

1. React DevTools > Profiler 탭 열기
2. "Highlight updates when components render" 활성화
3. 인터랙션 수행 후 렌더링 결과 분석

## REST API 요청 최적화

### 불필요한 API 호출 방지

TanStack Query의 캐싱을 활용하여 동일한 데이터에 대한 중복 요청을 방지한다.

```ts
// 동일한 queryKey를 가진 컴포넌트는 캐시에서 데이터를 공유한다.
export function usePost(id: number) {
  return useQuery({
    queryKey: ["posts", id],  // id가 같으면 캐시 재사용
    queryFn: () => postService.getPost(id),
    staleTime: 1000 * 60,     // 1분간 fresh 상태 유지
  });
}
```

### 페이지네이션

현재 프로젝트는 페이지 기반 페이지네이션을 사용한다.

```ts
// 페이지 기반 페이지네이션
export function usePaginatedPosts(params: { page: number; search?: string; limit?: number }) {
  return useQuery({
    queryKey: ["posts", "paged", params],
    queryFn: () => postService.getPagedPosts(params),
  });
}
```

### 쿼리 무효화 범위 제한

캐시 무효화는 가능한 좁은 범위로 지정하여 불필요한 리페칭을 줄인다.

```ts
// 좋은 예: 특정 게시글만 무효화
queryClient.invalidateQueries({ queryKey: ["posts", postId] });

// 범위가 넓은 예: 모든 게시글 목록 무효화 (생성/삭제 시 필요)
queryClient.invalidateQueries({ queryKey: ["posts"] });
```

## 번들 크기 관리

### 코드 스플리팅

페이지 단위로 `React.lazy`와 `Suspense`를 사용한다.

```tsx
import { lazy, Suspense } from "react";

const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));

function App() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Suspense>
  );
}
```

### 트리 셰이킹

named import를 사용하여 필요한 것만 가져온다.

```ts
// 좋은 예: named import
import { format } from "date-fns";

// 나쁜 예: 전체 import
import * as dateFns from "date-fns";
```

### 번들 분석

`rollup-plugin-visualizer`로 번들 구성을 확인한다.

```ts
// vite.config.ts
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true, gzipSize: true }),
  ],
});
```

## 이미지 최적화

### 포맷 가이드

| 포맷 | 용도 | 특징 |
|------|------|------|
| WebP | 사진, 복잡한 이미지 | 높은 압축률, 대부분의 브라우저 지원 |
| SVG | 아이콘, 로고, 일러스트 | 벡터 기반, 크기 무관 선명 |
| PNG | 투명 배경 필요 시 | 무손실 압축, 파일 크기 큼 |

### 지연 로딩

뷰포트 밖 이미지는 지연 로딩한다.

```tsx
<img
  src="/images/photo.webp"
  alt="설명"
  loading="lazy"
  width={400}
  height={300}
/>
```

## 데이터 캐싱 전략

### TanStack Query 캐싱 설정

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분 동안 fresh 상태 유지
      gcTime: 1000 * 60 * 30,   // 30분 후 캐시에서 제거
    },
  },
});
```

### 데이터 유형별 캐싱 전략

| 데이터 유형 | staleTime | gcTime | 예시 |
|------------|-----------|--------|------|
| 거의 변하지 않는 데이터 | 30분 | 1시간 | 카테고리 목록, 설정 |
| 자주 변하는 데이터 | 1분 | 5분 | 알림, 채팅 |
| 사용자별 데이터 | 5분 | 30분 | 프로필, 할 일 목록 |
| 실시간 데이터 | 0 (항상 stale) | 5분 | 주가, 실시간 피드 |

## Core Web Vitals 기준

### 목표

| 지표 | 목표 | 설명 |
|------|------|------|
| LCP (Largest Contentful Paint) | < 2.5초 | 가장 큰 콘텐츠 렌더링 시간 |
| INP (Interaction to Next Paint) | < 200ms | 사용자 인터랙션 응답 시간 |
| CLS (Cumulative Layout Shift) | < 0.1 | 레이아웃 이동 정도 |

### 측정 도구

- **Lighthouse**: Chrome DevTools > Lighthouse 탭
- **web-vitals 라이브러리**: 실제 사용자 데이터 수집

```ts
import { onLCP, onINP, onCLS } from "web-vitals";

onLCP(console.log);
onINP(console.log);
onCLS(console.log);
```

## 관련 문서

- [상태 관리 전략](state-management.md)
- [디자인 가이드](design-guide.md)
- [데이터 모델링 가이드](data-modeling.md)
