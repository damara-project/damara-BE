import { Router } from "express";

import {
  getAllPosts,
  getPostsByStudentId,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from "../../controllers/post.controller";

const postRouter = Router();

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: 전체 상품 조회 (페이징 가능)
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: 상품 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */
// GET /api/posts - 전체 조회 (페이징 가능)
postRouter.get("/", getAllPosts);

/**
 * @swagger
 * /api/posts/student/{studentId}:
 *   get:
 *     summary: 학번으로 상품 조회
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: 작성자 학번
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: 해당 학번의 상품 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */
// GET /api/posts/student/:studentId - 학번으로 상품 조회
postRouter.get("/student/:studentId", getPostsByStudentId);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: 상품 상세 조회
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 상품 UUID
 *     responses:
 *       200:
 *         description: 상품 상세 정보
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: 상품을 찾을 수 없음
 */
// GET /api/posts/:id - 상세 조회
postRouter.get("/:id", getPostById);

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: 상품 등록
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *               - deadline
 *               - authorId
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               authorId:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: 이미지 URL 배열
 *     responses:
 *       201:
 *         description: 상품 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: 유효성 검증 실패
 */
// POST /api/posts - 상품 등록
postRouter.post("/", createPost);

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: 상품 수정
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: 상품을 찾을 수 없음
 */
// PUT /api/posts/:id - 상품 수정
postRouter.put("/:id", updatePost);

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: 상품 삭제
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 삭제 성공
 *       404:
 *         description: 상품을 찾을 수 없음
 */
// DELETE /api/posts/:id - 상품 삭제
postRouter.delete("/:id", deletePost);

export default postRouter;
