import { query, DatabaseError } from "../db";
import { User, UserRow, mapUser, CreateUserInput } from "@src/models/User";
import { EmailAlreadyExistsError } from "@src/common/util/route-errors";

//RETURNING 동일한 컬럼에 여러번 쓰는 중복을 제거.

//SNAKE_CASE 사용.
//만약 DB USER의 스키마가 변한다면 여기만 바꾸면 되기에 repo/type
const USER_COLUMNS = {
  id: "id",
  email: "email",
  passwordHash: "password_hash",
  nickname: "nickname",
  department: "department",
  studentId: "student_id",
  avatarUrl: "avatar_url",
  createdAt: "created_at",
  updatedAt: "updated_at",
} as const;

export const UserRepo = {
  async create(data: CreateUserInput): Promise<User> {
    const text = `
     INSERT INTO users (
        email, password_hash, nickname,
        department, student_id, avatar_url
      )VALUES($1, $2, $3, $4, $5, $6) RETURNING ${Object.values(
        USER_COLUMNS
      ).join(", ")}`;
    //SQL 매개변수는 $1, $2, $3, $4, $5, $6로 표현한다.

    const params = [
      data.email,
      data.passwordHash,
      data.nickname,
      data.department ?? null,
      data.studentId ?? null,
      data.avatarUrl ?? null,
    ];

    try {
      const res = await query<UserRow>(text, params);
      return mapUser(res.rows[0]);
    } catch (e: unknown) {
      if (e instanceof DatabaseError && e.code === "23505") {
        // EmailAlreadyExistsError extends RouteError extends Error - safe
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const error = new EmailAlreadyExistsError() as Error;
        throw error;
      }
      throw e;
    }
  },
};
