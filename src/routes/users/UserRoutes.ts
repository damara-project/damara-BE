import { Request, Response } from 'express';
import { TSchema } from 'jet-validators/utils';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/util/route-errors';
import { parseReq } from '@src/routes/common/util';
import { UserService } from '@src/services/UserService';
import { CreateUserInput, UpdateUserInput, User } from '@src/models/User';

/******************************************************************************
 *                              Controller 설명
 ******************************************************************************
 * 
 * Controller는 HTTP 요청/응답을 처리하는 계층입니다.
 * 
 * 역할:
 * 1. HTTP 요청에서 데이터 추출 (req.body, req.params 등)
 * 2. 요청 데이터 검증 (parseReq 사용)
 * 3. Service 계층 호출 (비즈니스 로직 실행)
 * 4. 에러 처리 및 적절한 HTTP 상태 코드 반환
 * 5. 응답 데이터 형식화 및 전송
 * 
 * 계층 구조:
 * Controller (HTTP) → Service (비즈니스 로직) → Repository (DB)
 * 
 * 각 핸들러는 async 함수로 작성하고, 에러는 자동으로 server.ts의
 * 에러 핸들러로 전달됩니다.
 ******************************************************************************/

/******************************************************************************
 *                              타입 정의
 ******************************************************************************/

// 요청 본문 타입들
interface CreateUserReq {
  user: CreateUserInput;
}

interface UpdateUserReq {
  user: UpdateUserInput & { id: string };
}

// 응답 타입들
interface UserRes {
  user: User;
}

interface UsersRes {
  users: User[];
}

/******************************************************************************
 *                              검증 스키마
 ******************************************************************************/

// 회원가입 요청 검증 스키마
const createUserSchema: TSchema = {
  user: {
    type: 'object',
    required: true,
    properties: {
      email: { type: 'string', required: true },
      passwordHash: { type: 'string', required: true },
      nickname: { type: 'string', required: true },
      department: { type: 'string', required: false },
      studentId: { type: 'string', required: false },
      avatarUrl: { type: 'string', required: false },
    },
  },
};

// 사용자 수정 요청 검증 스키마
const updateUserSchema: TSchema = {
  user: {
    type: 'object',
    required: true,
    properties: {
      id: { type: 'string', required: true },
      email: { type: 'string', required: false },
      nickname: { type: 'string', required: false },
      department: { type: 'string', required: false },
      studentId: { type: 'string', required: false },
      avatarUrl: { type: 'string', required: false },
    },
  },
};

/******************************************************************************
 *                              핸들러 함수들
 ******************************************************************************/

/**
 * GET /api/users/all
 * 
 * 모든 사용자 목록을 조회합니다.
 * 
 * 동작 과정:
 * 1. UserService.getAllUsers() 호출
 * 2. 성공 시 200 OK와 함께 사용자 목록 반환
 * 3. 에러 발생 시 자동으로 에러 핸들러로 전달
 */
async function getAll(_req: Request, res: Response): Promise<Response> {
  // TODO: UserService에 getAllUsers 메서드 추가 필요
  // const users = await UserService.getAllUsers();
  // return res.status(HttpStatusCodes.OK).json({ users } as UsersRes);
  
  // 임시로 빈 배열 반환 (나중에 구현)
  return res.status(HttpStatusCodes.OK).json({ users: [] } as UsersRes);
}

/**
 * POST /api/users/add
 * 
 * 새로운 사용자를 등록합니다 (회원가입).
 * 
 * 동작 과정:
 * 1. req.body에서 { user: CreateUserInput } 형태로 데이터 추출
 * 2. parseReq로 요청 데이터 검증 (잘못된 데이터면 ValidationError 발생)
 * 3. UserService.registerUser() 호출하여 회원가입 처리
 *    - 이메일 중복 체크
 *    - 비밀번호 해싱
 *    - DB에 저장
 * 4. 성공 시 201 CREATED와 함께 생성된 사용자 정보 반환
 * 5. 에러 발생 시:
 *    - EmailAlreadyExistsError → 409 CONFLICT
 *    - ValidationError → 400 BAD_REQUEST
 *    - 기타 에러 → 500 INTERNAL_SERVER_ERROR
 */
async function add(req: Request, res: Response): Promise<Response> {
  // 1. 요청 데이터 검증 및 추출
  // parseReq는 검증 실패 시 자동으로 ValidationError를 throw합니다
  const { user } = parseReq<CreateUserReq>(createUserSchema)(req.body);

  // 2. Service 계층 호출 (비즈니스 로직 실행)
  const newUser = await UserService.registerUser(user);

  // 3. 성공 응답 반환
  return res.status(HttpStatusCodes.CREATED).json({ user: newUser } as UserRes);
}

/**
 * PUT /api/users/update
 * 
 * 기존 사용자 정보를 수정합니다.
 * 
 * 동작 과정:
 * 1. req.body에서 { user: UpdateUserInput & { id } } 형태로 데이터 추출
 * 2. parseReq로 요청 데이터 검증
 * 3. user.id와 user 객체에서 id를 제외한 나머지 필드를 분리
 * 4. UserService.updateUser(id, patch) 호출
 * 5. 성공 시 200 OK와 함께 수정된 사용자 정보 반환
 * 6. 사용자가 없으면 USER_NOT_FOUND 에러 발생 (Service에서 처리)
 */
async function update(req: Request, res: Response): Promise<Response> {
  // 1. 요청 데이터 검증 및 추출
  const { user } = parseReq<UpdateUserReq>(updateUserSchema)(req.body);

  // 2. id와 나머지 필드 분리
  const { id, ...patch } = user;

  // 3. Service 계층 호출
  const updatedUser = await UserService.updateUser(id, patch);

  // 4. 성공 응답 반환
  return res.status(HttpStatusCodes.OK).json({ user: updatedUser } as UserRes);
}

/**
 * DELETE /api/users/delete/:id
 * 
 * 사용자를 삭제합니다.
 * 
 * 동작 과정:
 * 1. req.params에서 id 추출 (URL 파라미터)
 * 2. UserService.deleteUser(id) 호출
 * 3. 성공 시 200 OK 반환 (본문 없음)
 * 4. 사용자가 없으면 USER_NOT_FOUND 에러 발생
 */
async function deleteUser(req: Request, res: Response): Promise<Response> {
  // 1. URL 파라미터에서 id 추출
  const { id } = req.params;

  // 2. id 검증 (간단한 체크)
  if (!id) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'User ID is required');
  }

  // 3. Service 계층 호출
  await UserService.deleteUser(id);

  // 4. 성공 응답 반환 (본문 없음)
  return res.status(HttpStatusCodes.OK).end();
}

/******************************************************************************
 *                              Export
 ******************************************************************************/

export const UserRoutes = {
  getAll,
  add,
  update,
  delete: deleteUser, // delete는 예약어라서 deleteUser로 함수명 사용
};

