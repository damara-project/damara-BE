# Changelog

모든 주요 변경사항은 이 파일에 기록됩니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며,
버전 관리는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

### Added - 2025-11-24

#### 카테고리 기능 추가
- **Post 모델에 category 필드 추가**
  - `src/models/Post.ts`: `category` 필드 추가 (nullable, string(50))
  - 카테고리 ID: `food`, `daily`, `beauty`, `electronics`, `school`, `freemarket`

- **API 필터링 기능 추가**
  - `GET /api/posts?category={categoryId}`: 카테고리별 게시글 조회 지원
  - `POST /api/posts`: 게시글 생성 시 `category` 필드 추가
  - `PUT /api/posts/{id}`: 게시글 수정 시 `category` 필드 업데이트 지원

- **Validation 스키마 업데이트**
  - `src/routes/common/validation/post-schemas.ts`: `createPostSchema`, `updatePostSchema`에 `category` 필드 추가

- **Repository 레이어 업데이트**
  - `src/repos/PostRepo.ts`: `list()` 메서드에 `category` 필터링 파라미터 추가

- **Service 레이어 업데이트**
  - `src/services/PostService.ts`: `listPosts()` 메서드에 `category` 파라미터 추가

- **Controller 레이어 업데이트**
  - `src/controllers/post.controller.ts`: 
    - `getAllPosts()`: Query 파라미터에서 `category` 추출 및 전달
    - `createPost()`: Request body에서 `category` 처리
    - `updatePost()`: Request body에서 `category` 업데이트 처리

- **Swagger API 문서 업데이트**
  - `src/config/swagger.ts`: Post 스키마에 `category` 필드 추가
  - `src/routes/posts/PostRoutes.ts`: 
    - `GET /api/posts`에 `category` 쿼리 파라미터 문서 추가
    - `POST /api/posts`에 `category` 필드 문서 추가
    - `PUT /api/posts/{id}`에 `category` 필드 문서 추가

- **문서화**
  - `docs/CATEGORY_FEATURE.md`: 카테고리 기능 상세 문서 추가

### Changed
- 없음

### Deprecated
- 없음

### Removed
- 없음

### Fixed
- 없음

### Security
- 없음

---

## [이전 변경사항]

### 2025-11-24 이전
- 채팅 기능 구현 (WebSocket 기반 실시간 채팅)
- 게시글 참여 기능 (참여/참여 취소)
- UI/UX 개선 (Daangn Market 스타일 → Ivory/White/Black 컬러 스킴)
- 사용자 인증 및 게시글 CRUD 기능
- 이미지 업로드 기능

---

## 변경사항 유형 설명

- **Added**: 새로운 기능 추가
- **Changed**: 기존 기능 변경
- **Deprecated**: 곧 제거될 기능
- **Removed**: 제거된 기능
- **Fixed**: 버그 수정
- **Security**: 보안 관련 변경사항

