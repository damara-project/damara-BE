// src/services/UserService.ts

import { UserRepo } from "@src/repos/UserRepo";
import { UserCreationAttributes } from "@src/models/User";
import {
  EmailAlreadyExistsError,
  RouteError,
  InvalidCredentialsError,
  StudentIdAlreadyExistsError,
} from "@src/common/util/route-errors";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import bcrypt from "bcrypt";

export const UserService = {
  /**
   * 회원가입 기능
   * - Service는 DB 또는 HTTP를 몰라야 한다
   * - 순수 비즈니스 로직만 처리 (중복 체크, 비밀번호 해싱)
   */
  async registerUser(data: UserCreationAttributes) {
    // 1) 이메일 중복 검사
    const emailExists = await UserRepo.findByEmail(data.email);
    if (emailExists) {
      throw new EmailAlreadyExistsError();
    }

    // 2) 학번 중복 검사
    const studentIdExists = await UserRepo.findByStudentId(data.studentId);
    if (studentIdExists) {
      throw new StudentIdAlreadyExistsError();
    }

    // 3) 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(data.passwordHash, 10);

    // 4) UserRepo를 통해 회원 생성
    const user = await UserRepo.create({
      ...data,
      passwordHash: hashedPassword,
    });

    return user;
  },

  /**
   * 이메일로 사용자 조회 (로그인 시 사용 가능)
   */
  async getUserByEmail(email: string) {
    const user = await UserRepo.findByEmail(email);
    if (!user) {
      throw new RouteError(HttpStatusCodes.NOT_FOUND, "USER_NOT_FOUND");
    }
    return user;
  },

  /**
   * 부분 업데이트
   */
  async updateUser(id: string, patch: Partial<UserCreationAttributes>) {
    return await UserRepo.update(id, patch);
  },

  /**
   * 삭제
   */
  async deleteUser(id: string) {
    await UserRepo.delete(id);
  },

  /**
   * 전체 조회 + pagination
   */
  async listUsers(limit = 20, offset = 0) {
    return await UserRepo.list(limit, offset);
  },

  /**
   * 학번과 비밀번호로 로그인
   */
  async loginByStudentId(studentId: string, password: string) {
    // 1) 학번으로 사용자 찾기
    const user = await UserRepo.findByStudentId(studentId);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // 2) 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // 3) 비밀번호 해시는 제외하고 반환
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
};