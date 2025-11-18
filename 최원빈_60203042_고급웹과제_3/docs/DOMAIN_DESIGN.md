# 공동구매 상품(Post) 도메인 설계

## 1. 도메인 개요

### User (회원)
- 한 사용자가 여러 상품을 등록할 수 있음 (1:N 관계)
- 회원가입, 수정, 삭제, 전체 조회 기능

### Post (공동구매 상품)
- 당근마켓 스타일의 공동구매 상품
- 제목, 내용, 가격, 마감일, 상태(모집중/모집완료/취소됨)
- 여러 이미지 업로드 가능 (PostImage 테이블로 관리)
- 작성자(User)와 n:1 관계

### PostImage (상품 이미지)
- 하나의 Post에 여러 이미지 첨부 가능 (1:N 관계)
- 이미지 URL과 정렬 순서 저장

## 2. 데이터베이스 스키마

### users 테이블 (이미 존재)
```sql
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  student_id VARCHAR(20),
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### posts 테이블 (신규)
```sql
CREATE TABLE posts (
  id CHAR(36) PRIMARY KEY,
  author_id CHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  target_quantity INT NOT NULL DEFAULT 1,
  current_quantity INT NOT NULL DEFAULT 0,
  status ENUM('open', 'closed', 'cancelled') NOT NULL DEFAULT 'open',
  deadline DATETIME NOT NULL,
  pickup_location VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_author_id (author_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at DESC)
);
```

### post_images 테이블 (신규)
```sql
CREATE TABLE post_images (
  id CHAR(36) PRIMARY KEY,
  post_id CHAR(36) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  INDEX idx_post_id (post_id, sort_order)
);
```

## 3. API 엔드포인트 설계

### User API
- `GET /api/users` - 전체 조회
- `POST /api/users` - 회원가입
- `PUT /api/users/:id` - 회원 수정
- `DELETE /api/users/:id` - 회원 삭제

### Post API
- `GET /api/posts` - 전체 조회 (페이징, 필터링)
- `GET /api/posts/:id` - 상세 조회
- `POST /api/posts` - 상품 등록
- `PUT /api/posts/:id` - 상품 수정
- `DELETE /api/posts/:id` - 상품 삭제

## 4. 파일 구조

```
src/
├── models/
│   ├── User.ts (이미 존재)
│   └── Post.ts (신규)
├── repos/
│   ├── UserRepo.ts (이미 존재)
│   └── PostRepo.ts (신규)
├── services/
│   ├── UserService.ts (이미 존재)
│   └── PostService.ts (신규)
├── controllers/
│   ├── user.controller.ts (수정 필요 - updateUser, deleteUser 추가)
│   └── post.controller.ts (신규)
├── routes/
│   ├── users/
│   │   └── UserRoutes.ts (수정 필요)
│   └── posts/
│       └── PostRoutes.ts (신규)
├── routes/common/validation/
│   ├── user-schemas.ts (이미 존재)
│   └── post-schemas.ts (신규)
└── views/
    ├── users.html (이미 존재)
    └── posts.html (신규)
```

