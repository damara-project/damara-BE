import { Router } from "express";

import { createUser, getAllUsers } from "@src/controllers/user.controller";

const userRouter = Router();

// GET /api/users - 전체 사용자 조회
userRouter.get("/", getAllUsers);

// POST /api/users - 회원가입
userRouter.post("/", createUser);

export default userRouter;
