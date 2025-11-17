import { query, DatabaseError } from "../db";
import {
  User,
  UserRow,
  mapUser,
  CreateUserInput,
  UpdateUserInput,
} from "@src/models/User";
import { EmailAlreadyExistsError } from "@src/common/util/route-errors";
import { buildUpdateSet } from "@src/routes/common/util/sql";

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
    } catch (e) {
      if (e instanceof DatabaseError && e.code === "23505") {
        throw new EmailAlreadyExistsError();
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
    // buildUpdateSet으로 SET 절과 값들 생성
    const { setClause, values } = buildUpdateSet(
      patch as Record<string, unknown>,
      {
        email: USER_COLUMNS.email,
        nickname: USER_COLUMNS.nickname,
        department: USER_COLUMNS.department,
        studentId: USER_COLUMNS.studentId,
        avatarUrl: USER_COLUMNS.avatarUrl,
      }
    );

    // UPDATE 쿼리 생성
    // setClause 예: "nickname = $1, department = $2"
    // id는 마지막 파라미터로 ($n)
    const text = `UPDATE users SET ${setClause} WHERE id = $${
      values.length + 1
    } RETURNING ${Object.values(USER_COLUMNS).join(", ")}`;

    // 파라미터는 [값들..., id] 순서
    const params = [...values, id];

    const res = await query<UserRow>(text, params);
    return mapUser(res.rows[0]);
  },

  async delete(id: string): Promise<void> {
    const text = `DELETE FROM users WHERE id = $1`;
    const params = [id];
    await query(text, params);
  },

  //사용자 전체 조회를 위한 조회함수. 페이지네이션을 위해 limit과 offset을 받는다.
  async list(limit = 20, offset = 0): Promise<User[]> {
    const text = `SELECT ${Object.values(USER_COLUMNS).join(
      ", "
    )} FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
    const params = [limit, offset];
    const res = await query<UserRow>(text, params);
    return res.rows.map(mapUser);
  },
};
