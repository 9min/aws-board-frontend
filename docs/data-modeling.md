# API 데이터 모델 가이드

백엔드 REST API의 요청/응답 구조를 TypeScript 타입으로 정의하는 방법을 설명한다.

## 타입 정의 원칙

### 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 요청 DTO | `[동사][리소스]Request` | `CreatePostRequest`, `LoginRequest` |
| 응답 DTO | `[리소스]Response` | `PostResponse`, `LoginResponse` |
| 도메인 모델 | `PascalCase` 단수형 | `Post`, `User`, `Comment` |
| 목록 응답 | `[리소스]ListResponse` | `PostListResponse` |
| 페이지네이션 | `PaginatedResponse<T>` | 제네릭 활용 |

### 파일 구성

도메인별로 파일을 분리한다.

```
src/types/
├── auth.ts        # 인증 관련 타입
├── post.ts        # 게시글 관련 타입
├── comment.ts     # 댓글 관련 타입
├── file.ts        # 파일 업로드 관련 타입
└── common.ts      # 공통 타입 (ApiResponse, Pagination 등)
```

## 공통 타입

```ts
// src/types/common.ts

// 공통 API 응답 래퍼 (필요 시 백엔드 응답 구조에 맞게 조정)
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// 커서 기반 페이지네이션 응답
export interface CursorPaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
}

// 에러 응답
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
```

## 도메인별 타입 정의

### 인증 (auth.ts)

```ts
// src/types/auth.ts
export interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
  nickname?: string;
  createdAt?: string;
}

// 로그인 응답: 액세스 토큰만 반환. 사용자 정보는 JWT payload에서 디코딩한다.
export interface LoginResponse {
  accessToken: string;
}
```

### 게시글 (post.ts)

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
  attachments?: import('./file').Attachment[];
}

export interface CreatePostRequest {
  title: string;
  content: string;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
}

// cursor: 커서 기반 페이지네이션용 (number 타입), page: 페이지 기반 페이지네이션용
export interface PostSearchParams {
  cursor?: number;
  limit?: number;
  search?: string;  // 키워드 검색 파라미터 (keyword 아님)
  page?: number;
}

// 커서 기반 페이지네이션 응답
export interface PostListResponse {
  data: Post[];
  nextCursor: number | null;
}

// 페이지 기반 페이지네이션 응답 (실제 사용 중)
export interface PagedPostListResponse {
  data: Post[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}
```

### 댓글 (comment.ts)

```ts
// src/types/comment.ts
export interface Comment {
  id: number;
  postId: number;
  authorId: number;
  authorNickname: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}
```

### 파일 업로드 (file.ts)

```ts
// src/types/file.ts

// S3 Presigned Post 응답
export interface PresignedPostResponse {
  url: string;
  fields: Record<string, string>;
}

// 첨부 파일 등록 요청: S3에 업로드된 오브젝트의 key만 전달한다.
export interface RegisterAttachmentRequest {
  key: string;
}

// 첨부 파일
export interface Attachment {
  id: number;
  postId: number;
  key: string;
  url: string;
  createdAt: string;
}
```

## 타입 작성 규칙

### 필드 타입 매핑

백엔드 NestJS/Prisma의 타입을 TypeScript로 변환한다.

| 백엔드 타입 | TypeScript 타입 | 비고 |
|------------|---------------|------|
| `string` | `string` | |
| `number` (Int/Float) | `number` | |
| `boolean` | `boolean` | |
| `DateTime` | `string` | ISO 8601 형식 |
| `null` 가능 필드 | `타입 \| null` | |
| 선택적 필드 | `타입?` 또는 `타입 \| undefined` | |

### 날짜 처리

백엔드에서 날짜는 ISO 8601 문자열(`"2024-01-01T00:00:00.000Z"`)로 반환된다.

```ts
// 날짜 포매팅 유틸리티 사용
import { formatDate } from "@/utils/formatDate";

// 컴포넌트에서 사용
<span>{formatDate(post.createdAt)}</span>
```

### 선택적 vs 필수 필드

```ts
// 생성 요청: 필수 필드만
interface CreatePostRequest {
  title: string;   // 필수
  content: string; // 필수
}

// 수정 요청: 모든 필드 선택적
interface UpdatePostRequest {
  title?: string;   // 선택
  content?: string; // 선택
}
```

## 서비스 함수와 타입 연동

백엔드는 모든 응답을 `{ data, error, meta }` 래퍼 구조로 반환한다. 서비스 함수에서 `.data.data`를 통해 실제 페이로드를 추출한다.

```ts
// src/services/postService.ts
import { POST_ENDPOINTS } from "@/constants/apiEndpoints";
import { apiClient } from "@/lib/apiClient";
import type {
  Post,
  PagedPostListResponse,
  PostSearchParams,
  CreatePostRequest,
  UpdatePostRequest,
} from "@/types/post";
import { handleApiError } from "@/utils/error";

export const postService = {
  async getPagedPosts(params: { page: number; limit?: number; search?: string }): Promise<PagedPostListResponse> {
    try {
      const response = await apiClient.get(POST_ENDPOINTS.BASE, { params });
      const { items, total, page, totalPages, limit } = response.data.data;
      return { data: items, total, page, totalPages, limit };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getPost(id: number): Promise<Post> {
    try {
      const response = await apiClient.get(POST_ENDPOINTS.DETAIL(id));
      return response.data.data;
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

  async updatePost(id: number, body: UpdatePostRequest): Promise<Post> {
    try {
      const response = await apiClient.patch(POST_ENDPOINTS.DETAIL(id), body);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async deletePost(id: number): Promise<void> {
    try {
      await apiClient.delete(POST_ENDPOINTS.DETAIL(id));
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
```

## 입력 유효성 검증 (zod)

API 요청 전 클라이언트 측 유효성 검증에 zod를 사용한다.

```ts
import { z } from "zod";

export const CreatePostSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요.").max(200, "제목은 200자 이내로 입력해주세요."),
  content: z.string().min(1, "내용을 입력해주세요."),
});

export type CreatePostFormData = z.infer<typeof CreatePostSchema>;
```

## 관련 문서

- [프로젝트 구조](project-structure.md)
- [에러 핸들링](error-handling.md)
- [개발 환경 셋업](dev-environment.md)
