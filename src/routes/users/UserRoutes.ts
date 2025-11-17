import { Router } from "express";

import { createUser } from "@src/controllers/user.controller";

const userRouter = Router();

userRouter.post("/", createUser);

export default userRouter;
