import { query, DatabaseError } from "../db";
import {
  User,
  UserRow,
  mapUser,
  CreateUserInput,
  UpdateUserInput,
} from "@src/models/User";
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
  //create 함수
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
  async findByEmail(email: string): Promise<User | null> {
    const text = `SELECT ${Object.values(USER_COLUMNS).join(
      ", "
    )} FROM users WHERE email = $1`;
    const params = [email];
    const res = await query<UserRow>(text, params);
    return res.rows.length > 0 ? mapUser(res.rows[0]) : null;
  },
  async update(id: string, patch: UpdateUserInput): Promise<User> {
    const text = `
    UPDATE users SET ${Object.entries(patch)
      .map(
        ([key, value]) =>
          `${USER_COLUMNS[key as keyof typeof USER_COLUMNS]} = $${index + 1}`
      )
      .join(", ")} WHERE id = $1 RETURNING ${Object.values(USER_COLUMNS).join(
      ", "
    )}`;
    const params = [id, ...Object.values(patch)];
    const res = await query<UserRow>(text, params);
    return mapUser(res.rows[0]);
  },
};
