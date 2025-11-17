// src/repos/UserRepo.ts (Sequelize 버전)
import { UserModel } from "@src/models/User";

import { UserCreationAttributes } from "@src/models/User";
import { EmailAlreadyExistsError } from "@src/common/util/route-errors";

export const UserRepo = {
  /**
   * 사용자 생성
   */
  async create(data: UserCreationAttributes) {
    try {
      const user = await UserModel.create(data);
      return user.get(); // plain object로 변환
    } catch (e: unknown) {
      // Sequelize 고유 에러 코드: unique constraint
      if (e instanceof Error && e.name === "SequelizeUniqueConstraintError") {
        throw new EmailAlreadyExistsError();
      }
      throw e;
    }
  },

  /**
   * 이메일 기반 조회
   */
  async findByEmail(email: string) {
    const user = await UserModel.findOne({
      where: { email },
    });
    return user ? user.get() : null;
  },

  /**
   * 부분 업데이트
   */
  async update(id: string, patch: Partial<UserCreationAttributes>) {
    const user = await UserModel.findByPk(id);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    await user.update(patch);

    return user.get();
  },

  /**
   * 삭제
   */
  async delete(id: string) {
    await UserModel.destroy({ where: { id } });
  },

  /**
   * 전체 조회 + pagination
   */
  async list(limit = 20, offset = 0) {
    const users = await UserModel.findAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return users.map((u) => u.get());
  },
};
