export type UUID = string;

// DB 컬럼과 1:1 매핑되는 Row 타입 (snake_case)
export interface UserRow {
  id: UUID;
  email: string;
  password_hash: string;
  nickname: string;
  department: string | null;
  student_id: string | null;
  avatar_url: string | null;
  created_at: string; // ISO string (TIMESTAMPTZ)
  updated_at: string; // ISO string (TIMESTAMPTZ)
}

// 애플리케이션에서 쓰기 편한 camelCase 도메인 모델
export interface User {
  id: UUID;
  email: string;
  passwordHash: string;
  nickname: string;
  department?: string | null;
  studentId?: string | null;
  avatarUrl?: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

//사용자 생성시 필요한 타입
export interface CreateUserInput {
  email: string;
  passwordHash: string;
  nickname: string;
  department?: string;
  studentId?: string;
  avatarUrl?: string;
}

//사용자 부분 업데이트 시 필요한 타입 (모든 필드는 optional)
export interface UpdateUserInput {
  email?: string;
  nickname?: string;
  department?: string;
  studentId?: string;
  avatarUrl?: string;
  // password 업데이트는 허용 안함
}

//client Domain Mapping
export function mapUser(user: UserRow): User {
  return {
    ...user,
    passwordHash: user.password_hash,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    department: user.department ?? null,
    studentId: user.student_id ?? null,
    avatarUrl: user.avatar_url ?? null,
  };
}

//
