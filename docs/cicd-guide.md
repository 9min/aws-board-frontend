# CI/CD 설정 가이드

## 전체 구조

| 환경 | 인프라 | 트리거 |
|------|--------|--------|
| 로컬 개발 | localhost:5173 (Vite) | - |
| 프로덕션 | AWS S3 (정적 호스팅) | `main` 머지 |

패키지 매니저는 **pnpm**을 사용한다. CI 워크플로우는 `pnpm/action-setup`을 통해 pnpm을 설치하고 `pnpm install --frozen-lockfile`로 의존성을 고정한다.

백엔드는 AWS EC2에서 별도 운영하며, CloudFront(`https://dibhzpfpsg3ou.cloudfront.net`)를 통해 접근한다.

## GitHub Actions 워크플로우

### 파이프라인 구성

```
PR 생성/업데이트       → lint → type-check → test → build (검증만)
main 머지 (push)  → lint → type-check → test → build → deploy (S3)
```

| Job | 실행 시점 | 설명 |
|-----|-----------|------|
| `lint` | PR + main push | Biome 린트/포매팅 검사 |
| `type-check` | PR + main push | TypeScript 타입 검사 |
| `test` | PR + main push | Vitest 테스트 실행 |
| `build` | PR + main push | 빌드 성공 확인, 결과물 artifact 저장 |
| `deploy` | main push만 | S3에 빌드 결과물 업로드 |

### deploy Job 조건

```yaml
if: github.ref == 'refs/heads/main' && github.event_name == 'push'
```

PR에서는 deploy가 실행되지 않는다.

## GitHub Secrets 설정

GitHub 저장소 → Settings → Secrets and variables → Actions 에서 등록한다.

| Secret | 설명 | 예시 |
|--------|------|------|
| `VITE_API_BASE_URL` | 프로덕션 백엔드 URL | `https://dibhzpfpsg3ou.cloudfront.net` |
| `AWS_ACCESS_KEY_ID` | AWS IAM 액세스 키 | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM 시크릿 키 | - |
| `AWS_REGION` | S3 버킷 리전 | `ap-northeast-2` |
| `AWS_S3_BUCKET` | 프론트엔드 S3 버킷명 | `aws-board-frontend` |

### IAM 권한 최소화

배포용 IAM 사용자에게는 S3 버킷 접근 권한만 부여한다.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::aws-board-frontend",
        "arn:aws:s3:::aws-board-frontend/*"
      ]
    }
  ]
}
```

## S3 정적 호스팅 설정

### SPA 라우팅 처리

TanStack Router는 클라이언트 사이드 라우팅을 사용하므로, S3에서 404 응답을 `index.html`로 리다이렉트해야 한다.

S3 버킷 → 속성 → 정적 웹 사이트 호스팅:

| 항목 | 값 |
|------|-----|
| 인덱스 문서 | `index.html` |
| 오류 문서 | `index.html` |

### 버킷 퍼블릭 접근 설정

정적 호스팅용 버킷은 퍼블릭 읽기를 허용해야 한다.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::aws-board-frontend/*"
    }
  ]
}
```

## 환경변수 관리

| 파일 | 용도 | Git 추적 |
|------|------|----------|
| `.env.example` | 키 목록 (값 없음) | O |
| `.env.local` | 로컬 개발용 (`https://dibhzpfpsg3ou.cloudfront.net`) | X |
| GitHub Secrets | 프로덕션 빌드 시 주입 | - |

## 배포 체크리스트

### 프로덕션 배포 전 확인 사항

- [ ] 모든 CI 체크 통과 (lint, type-check, test, build)
- [ ] PR 리뷰 승인 완료
- [ ] GitHub Secrets 설정 확인 (`VITE_API_BASE_URL`, `AWS_*`)
- [ ] S3 버킷 정적 호스팅 설정 확인 (오류 문서 → `index.html`)
- [ ] 백엔드 API 스펙 변경 사항 확인
- [ ] 롤백 계획 수립 (이전 빌드 결과물 보관)

## 관련 문서

- [Git 워크플로우](git-workflow.md)
- [테스트 가이드](testing-guide.md)
- [린트 설정](lint-config.md)
- [보안 가이드](security-guide.md)
