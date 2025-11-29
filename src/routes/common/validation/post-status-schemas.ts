import z from "zod";

/**
 * 게시글 상태 변경 요청 스키마
 */
export const updatePostStatusSchema = z.object({
  status: z.enum(["open", "closed", "in_progress", "completed", "cancelled"]),
});

export type UpdatePostStatusReq = z.infer<typeof updatePostStatusSchema>;

