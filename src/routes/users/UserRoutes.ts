// 고급웹프로그래밍_3_최원빈_60203042
import { Router } from "express";

import {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
  login,
} from "@src/controllers/user.controller";

const userRouter = Router();

// GET /api/users - 전체 사용자 조회
userRouter.get("/", getAllUsers);

// POST /api/users - 회원가입
userRouter.post("/", createUser);

// POST /api/users/login - 로그인 (학번 + 비밀번호)
userRouter.post("/login", login);

// PUT /api/users/:id - 회원 수정
userRouter.put("/:id", updateUser);

// DELETE /api/users/:id - 회원 삭제
userRouter.delete("/:id", deleteUser);

export default userRouter;
