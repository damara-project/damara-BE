## About

This project was created with [express-generator-typescript](https://github.com/seanpmaxwell/express-generator-typescript).

## Service Architecture Overview

```mermaid
flowchart LR
  subgraph Client
    A[index.html<br/>대시보드 & 상품목록]
    B[users.html<br/>회원 관리]
    C[posts.html<br/>내 상품 관리]
  end

  subgraph Express
    R[BaseRouter (/api)]
    UC[User Controllers]
    PC[Post Controllers]
    UpC[Upload Controllers]
    App[app.ts<br/>middleware & error handler]
  end

  subgraph Services
    USvc[UserService]
    PSvc[PostService]
  end

  subgraph Data
    URepo[UserRepo]
    PRepo[PostRepo]
    Multer[multer disk storage]
  end

  DB[(MySQL<br/>Sequelize Models)]

  Client -->|fetch/forms| R
  R -->|/api/users| UC --> USvc --> URepo --> DB
  R -->|/api/posts| PC --> PSvc --> PRepo --> DB
  R -->|/api/upload| UpC --> Multer
  App --> DB
```

- **Views (`src/views` + `public/scripts`)**: Bootstrap + Handlebars UI로 회원/상품/이미지 시나리오를 구현했습니다.
- **Controllers (`src/controllers`)**: `parseReq`를 통해 Zod 검증을 수행하고, 모든 오류를 전역 핸들러로 위임합니다.
- **Services (`src/services`)**: 학번 로그인, 비밀번호 해시, 게시글-사용자 매핑 등 도메인 규칙을 처리합니다.
- **Repositories (`src/repos`)**: Sequelize 모델을 호출하여 MySQL과 통신하며, 이미지 업로드는 `multer`를 통해 정적 경로를 반환합니다.
- **Error & Infra (`app.ts`, `server.ts`)**: 미들웨어/정적 자원/글로벌 오류 응답을 담당하고, 서버 기동 시 DB sync를 강제합니다.

**IMPORTANT** for demo purposes I had to disable `helmet` in production. In any real world app you should change these 3 lines of code in `src/server.ts`:
```ts
// eslint-disable-next-line n/no-process-env
if (!process.env.DISABLE_HELMET) {
  app.use(helmet());
}
```

To just this:
```ts
app.use(helmet());
```


## Available Scripts

### `npm run clean-install`

Remove the existing `node_modules/` folder, `package-lock.json`, and reinstall all library modules.


### `npm run dev` or `npm run dev:hot` (hot reloading)

Run the server in development mode.<br/>

**IMPORTANT** development mode uses `swc` for performance reasons which DOES NOT check for typescript errors. Run `npm run type-check` to check for type errors. NOTE: you should use your IDE to prevent most type errors.


### `npm test` or `npm run test:hot` (hot reloading)

Run all unit-tests.


### `npm test -- "name of test file" (i.e. users).`

Run a single unit-test.


### `npm run lint`

Check for linting errors.


### `npm run build`

Build the project for production.


### `npm start`

Run the production build (Must be built first).


### `npm run type-check`

Check for typescript errors.


## Additional Notes

- If `npm run dev` gives you issues with bcrypt on MacOS you may need to run: `npm rebuild bcrypt --build-from-source`. 
