import { Router } from "express";

import Paths from "@src/common/constants/Paths";
import userRouter from "@src/routes/users/UserRoutes";

const BaseRouter = Router();

BaseRouter.use(Paths.Users.Base, userRouter);

export default BaseRouter;
