import z from "zod";

// 유저 생성 요청 스키마 정의
export const createUserSchema = z.object({
  user: z.object({
    email: z.email(), //명지대학교 이메일 형식이어야함
    passwordHash: z.string().min(8), //비밀번호는 8자 이상
    nickname: z.string().min(2),
    department: z.string().optional(),
    studentId: z.string().optional(),
    avatarUrl: z.string().optional(),
  }),
});

//타입 추론?
export type CreateUserReq = z.infer<typeof createUserSchema>;

//2. 사용자 수정 요청 타입
export const updateUserSchema = z.object({
  user: z.object({
    email: z.email().optional(),
    passwordHash: z.string().min(8).optional(),
    nickname: z.string().min(2).optional(),
    department: z.string().optional(),
    studentId: z.string().optional(),
    avatarUrl: z.string().optional(),
  }),
});
