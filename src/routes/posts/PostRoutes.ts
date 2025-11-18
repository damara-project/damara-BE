import { Router } from "express";

import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from "@src/controllers/post.controller";

const postRouter = Router();

// GET /api/posts - 전체 조회 (페이징 가능)
postRouter.get("/", getAllPosts);

// GET /api/posts/:id - 상세 조회
postRouter.get("/:id", getPostById);

// POST /api/posts - 상품 등록
postRouter.post("/", createPost);

// PUT /api/posts/:id - 상품 수정
postRouter.put("/:id", updatePost);

// DELETE /api/posts/:id - 상품 삭제
postRouter.delete("/:id", deletePost);

export default postRouter;

