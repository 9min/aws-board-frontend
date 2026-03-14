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
  nickname: string;
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
```

### 게시글 (post.ts)

```ts
// src/types/post.ts
import type { CursorPaginatedResponse } from "./common";

export interface Post {
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

export interface CreatePostRequest {
  title: string;
  content: string;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
}

export interface PostSearchParams {
  cursor?: string;
  limit?: number;
  keyword?: string;
}

export type PostListResponse = CursorPaginatedResponse<Post>;

export interface Attachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
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

// 첨부 파일 등록 요청
export interface RegisterAttachmentRequest {
  fileName: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
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

```ts
// src/services/postService.ts
import { apiClient } from "@/lib/apiClient";
import type {
  Post,
  PostListResponse,
  PostSearchParams,
  CreatePostRequest,
  UpdatePostRequest,
} from "@/types/post";

export async function getPosts(params?: PostSearchParams): Promise<PostListResponse> {
  const { data } = await apiClient.get<PostListResponse>("/api/v1/posts", { params });
  return data;
}

export async function getPostById(id: number): Promise<Post> {
  const { data } = await apiClient.get<Post>(`/api/v1/posts/${id}`);
  return data;
}

export async function createPost(body: CreatePostRequest): Promise<Post> {
  const { data } = await apiClient.post<Post>("/api/v1/posts", body);
  return data;
}

export async function updatePost(id: number, body: UpdatePostRequest): Promise<Post> {
  const { data } = await apiClient.patch<Post>(`/api/v1/posts/${id}`, body);
  return data;
}

export async function deletePost(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/posts/${id}`);
}
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
