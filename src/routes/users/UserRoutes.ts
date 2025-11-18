import { Router } from "express";

import {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
} from "@src/controllers/user.controller";

const userRouter = Router();

// GET /api/users - 전체 사용자 조회
userRouter.get("/", getAllUsers);

// POST /api/users - 회원가입
userRouter.post("/", createUser);

// PUT /api/users/:id - 회원 수정
userRouter.put("/:id", updateUser);

// DELETE /api/users/:id - 회원 삭제
userRouter.delete("/:id", deleteUser);

export default userRouter;
