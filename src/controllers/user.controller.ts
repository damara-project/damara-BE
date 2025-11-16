//컨트롤러는 통상적으로, http 관련 로직만을 담당함

//1. 라우터와 컨트롤러는 리소스명.역할. 형태로 이름을 짓고, 서비스와 레포지토리는 PascalCase로 이름을 짓는다.
//2. 컨트롤러는 라우터에서 요청을 받아, 서비스를 호출하고, 응답을 반환한다.
//즉, 컨트롤러와 라우터는 kebab-case로 이름을 짓는다.
//
import { Request, Response } from "express";
import { UserService } from "@src/services/UserService";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";

import {
  parseReq,
  createUserSchema,
  updateUserSchema,
  CreateUserReq,
  UpdateUserReq,
} from "@src/routes/common/validation/user-schemas";
