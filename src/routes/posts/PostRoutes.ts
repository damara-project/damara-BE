import { Router } from "express";

import {
  getAllPosts,
  getPostsByStudentId,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  joinPost,
  leavePost,
  getParticipants,
  getParticipatedPosts,
  checkParticipation,
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
/**
 * @swagger
 * /api/posts/user/{userId}/participated:
 *   get:
 *     summary: 사용자가 참여한 게시글 목록 조회
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 참여한 게시글 목록 조회 성공
 */
// GET /api/posts/user/:userId/participated - 사용자가 참여한 게시글 목록 (더 구체적인 라우트를 먼저 배치)
postRouter.get("/user/:userId/participated", getParticipatedPosts);

/**
 * @swagger
 * /api/posts/{id}/participants:
 *   get:
 *     summary: 게시글의 참여자 목록 조회
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 참여자 목록 조회 성공
 */
// GET /api/posts/:id/participants - 참여자 목록 (더 구체적인 라우트를 먼저 배치)
postRouter.get("/:id/participants", getParticipants);

/**
 * @swagger
 * /api/posts/{id}/participate/{userId}:
 *   get:
 *     summary: 사용자가 특정 게시글에 참여했는지 확인
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 참여 여부 확인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isParticipant:
 *                   type: boolean
 */
// GET /api/posts/:id/participate/:userId - 참여 여부 확인 (더 구체적인 라우트를 먼저 배치)
postRouter.get("/:id/participate/:userId", checkParticipation);

/**
 * @swagger
 * /api/posts/{id}/participate:
 *   post:
 *     summary: 공동구매 참여
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *           example:
 *             userId: "a87522bd-bc79-47b0-a73f-46ea4068a158"
 *     responses:
 *       201:
 *         description: 참여 성공
 *       400:
 *         description: 이미 참여했거나 작성자는 참여할 수 없음
 *       404:
 *         description: 게시글 또는 사용자를 찾을 수 없음
 */
// POST /api/posts/:id/participate - 참여하기 (더 구체적인 라우트를 먼저 배치)
postRouter.post("/:id/participate", joinPost);

/**
 * @swagger
 * /api/posts/{id}/participate/{userId}:
 *   delete:
 *     summary: 공동구매 참여 취소
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 참여 취소 성공
 *       404:
 *         description: 참여 정보를 찾을 수 없음
 */
// DELETE /api/posts/:id/participate/:userId - 참여 취소 (더 구체적인 라우트를 먼저 배치)
postRouter.delete("/:id/participate/:userId", leavePost);

// DELETE /api/posts/:id - 상품 삭제 (일반 라우트는 마지막에 배치)
postRouter.delete("/:id", deletePost);

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
// GET /api/posts/:id - 상세 조회 (일반 라우트는 마지막에 배치)
// 주의: 더 구체적인 라우트들(:id/participate, :id/participants 등)이 먼저 정의되어야 함
postRouter.get("/:id", getPostById);

export default postRouter;
