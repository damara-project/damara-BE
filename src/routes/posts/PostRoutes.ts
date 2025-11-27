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
 *               - post
 *             properties:
 *               post:
 *                 type: object
 *                 required:
 *                   - authorId
 *                   - title
 *                   - content
 *                   - price
 *                   - minParticipants
 *                   - deadline
 *                   - pickupLocation
 *                 properties:
 *                   authorId:
 *                     type: string
 *                     format: uuid
 *                     example: "a87522bd-bc79-47b0-a73f-46ea4068a158"
 *                     description: 작성자 UUID
 *                   title:
 *                     type: string
 *                     minLength: 1
 *                     maxLength: 200
 *                     example: "맛있는 치킨 공동구매"
 *                     description: 상품명
 *                   content:
 *                     type: string
 *                     minLength: 1
 *                     example: "BBQ 황금올리브치킨 2마리 세트를 함께 주문하실 분 구합니다!"
 *                     description: 상품 설명
 *                   price:
 *                     type: number
 *                     minimum: 0
 *                     example: 25000
 *                     description: 가격
 *                   minParticipants:
 *                     type: integer
 *                     minimum: 1
 *                     example: 2
 *                     description: 최소 참여 인원
 *                   deadline:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-11-27T23:59:59.000Z"
 *                     description: 마감 시간 (ISO 8601 형식)
 *                   pickupLocation:
 *                     type: string
 *                     maxLength: 200
 *                     example: "명지대학교 정문"
 *                     description: 픽업 장소
 *                   images:
 *                     type: array
 *                     items:
 *                       type: string
 *                       minLength: 1
 *                     example: ["https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400"]
 *                     description: 이미지 URL 배열 (선택사항)
 *           example:
 *             post:
 *               authorId: "a87522bd-bc79-47b0-a73f-46ea4068a158"
 *               title: "맛있는 치킨 공동구매"
 *               content: "BBQ 황금올리브치킨 2마리 세트를 함께 주문하실 분 구합니다!"
 *               price: 25000
 *               minParticipants: 2
 *               deadline: "2025-11-27T23:59:59.000Z"
 *               pickupLocation: "명지대학교 정문"
 *               images: ["https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400"]
 *     responses:
 *       201:
 *         description: 상품 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: 유효성 검증 실패
 *       404:
 *         description: 작성자를 찾을 수 없음
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
