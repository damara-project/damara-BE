//컨트롤러는 통상적으로, http 관련 로직만을 담당함

//1. 라우터와 컨트롤러는 리소스명.역할. 형태로 이름을 짓고, 서비스와 레포지토리는 PascalCase로 이름을 짓는다.
//2. 컨트롤러는 라우터에서 요청을 받아, 서비스를 호출하고, 응답을 반환한다.
//즉, 컨트롤러와 라우터는 kebab-case로 이름을 짓는다.
/**
 * 또한, controller는 http 요청과 응답만을 처리함
 *1. req.body 파싱 -> zod 스키마로 검증
  2. service 호출
  3. res.json 응답
 */
import { Request, Response, NextFunction } from "express";
import { UserService } from "@src/services/UserService";
import { parseReq } from "@src/routes/common/validation/parseReq";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import {
  createUserSchema,
  CreateUserReq,
  updateUserSchema,
  UpdateUserReq,
} from "@src/routes/common/validation/user-schemas";

/**
 * 1. 회원가입 컨트롤러
 * POST/ api /users
 * body : {users :{...}}
 *
 * next()를 사용하는 이유:
 * - 에러를 전역 에러 핸들러로 전달하여 중앙 집중식 처리
 * - 코드 중복 제거 (모든 컨트롤러에서 에러 처리 반복 불필요)
 * - 일관된 에러 응답 형태 보장
 * - ValidationError, EmailAlreadyExistsError는 RouteError를 상속받으므로
 *   전역 에러 핸들러에서 자동으로 처리됨
 */
export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    //1. 사용자 검증부터 use ParseReq function 제네릭 타입은 우리가 정의한 createUserSchema Type
    // parseReq는 커리 함수: parseReq(schema)(input) 형태로 사용
    const validatedData = parseReq<CreateUserReq>(createUserSchema)(req.body);
    const { user } = validatedData;

    const createdUser = await UserService.registerUser(user);

    res.status(HttpStatusCodes.CREATED).json(createdUser);
  } catch (error) {
    // 에러를 전역 에러 핸들러로 전달
    // server.ts의 에러 핸들러가 RouteError를 자동으로 처리함

    //원래는 에러를 다 잡아줬어야했는데, if(error instanceof RouteError) 이렇게 처리해줬어야했음
    //이렇게 하면 전역 에러 핸들러에서 자동으로 처리됨..
    next(error);
  }
}

//전체 조회 함수
export async function getAllUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const users = await UserService.listUsers();
    res.status(HttpStatusCodes.OK).json(users);
  } catch (error) {
    next(error);
  }
}

/**
 * 회원 수정 컨트롤러
 * PUT /api/users/:id
 * body: { user: { ... } }
 */
export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const validatedData = parseReq<UpdateUserReq>(updateUserSchema)(req.body);
    const { user } = validatedData;

    const updatedUser = await UserService.updateUser(id, user);

    res.status(HttpStatusCodes.OK).json(updatedUser);
  } catch (error) {
    next(error);
  }
}

/**
 * 회원 삭제 컨트롤러
 * DELETE /api/users/:id
 */
export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    await UserService.deleteUser(id);

    res.status(HttpStatusCodes.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
}
