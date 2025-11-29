# Changelog

모든 주요 변경사항은 이 파일에 기록됩니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며,
버전 관리는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

### Changed - 2025-11-24

#### 프로필 이미지 업로드 API 문서 업데이트

- **Swagger API 문서 개선**

  - `src/routes/users/UserRoutes.ts`: 사용자 정보 수정 API 예시에 `avatarUrl` 필드 추가
  - `src/routes/users/UserRoutes.ts`: 회원가입 API 예시를 실제 서버 URL 형식으로 업데이트
  - `src/routes/upload/UploadRoutes.ts`: 이미지 업로드 API 응답 스키마를 실제 형식에 맞게 수정 (`imageUrl` → `url`, `filename` 필드 추가)

- **문서화**
  - `docs/AVATAR_UPLOAD_FEATURE.md`: 프로필 이미지 업로드 기능 상세 문서 추가

**참고**: 프로필 이미지 업로드 기능은 이미 구현되어 있었으며, Swagger 문서만 업데이트했습니다.

### Added - 2025-11-24

#### 신뢰점수(Trust Score) 기능 추가

- **User 모델에 trustScore 필드 추가**

  - `src/models/User.ts`: `trustScore` 필드 추가 (기본값 50, 최소 0, 최대 100)
  - 데이터베이스 컬럼: `trust_score INTEGER NOT NULL DEFAULT 50`

- **회원가입 시 초기 점수 설정**

  - `src/repos/UserRepo.ts`: 회원가입 시 `trustScore` 기본값 50 자동 설정

- **API 응답에 trustScore 포함**

  - `POST /api/users`: 회원가입 응답에 `trustScore: 50` 포함
  - `POST /api/users/login`: 로그인 응답에 `trustScore` 포함
  - `GET /api/users/:id`: 사용자 정보 조회 응답에 `trustScore` 포함 (신규 추가)
  - `GET /api/users`: 전체 조회 응답에 `trustScore` 포함

- **신뢰점수 자동 업데이트 로직**

  - `src/services/PostService.ts`:
    - `updatePost()`: 게시글 상태가 `closed`로 변경 시 주최자 +10점, 참여자 +5점
    - `updatePost()`: 게시글 상태가 `cancelled`로 변경 시 주최자 -5점
    - `deletePost()`: 게시글 삭제 시 주최자 -5점
    - `PostParticipantService.leavePost()`: 참여 취소 시 참여자 -3점

- **UserService 신뢰점수 관리 메서드**

  - `updateTrustScore(userId, scoreChange)`: 신뢰점수 업데이트 (0~100 범위 제한)
  - `getUserById(id)`: 사용자 ID로 조회 (비밀번호 제외)

- **Swagger API 문서 업데이트**

  - `src/config/swagger.ts`: User 스키마에 `trustScore` 필드 추가
  - `src/routes/users/UserRoutes.ts`: `GET /api/users/:id` API 문서 추가

- **문서화**
  - `docs/TRUST_SCORE_FEATURE.md`: 신뢰점수 기능 상세 문서 추가

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
