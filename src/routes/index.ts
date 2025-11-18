import { Router } from "express";

import Paths from "@src/common/constants/Paths";
import userRouter from "@src/routes/users/UserRoutes";
import postRouter from "@src/routes/posts/PostRoutes";
import uploadRouter from "@src/routes/upload/UploadRoutes";

const BaseRouter = Router();

// User 라우터: /api/users
BaseRouter.use(Paths.Users.Base, userRouter);

// Post 라우터: /api/posts
BaseRouter.use(Paths.Posts.Base, postRouter);

// Upload 라우터: /api/upload
BaseRouter.use(Paths.Upload.Base, uploadRouter);

export default BaseRouter;
