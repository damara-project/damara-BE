import { Router } from "express";

import {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
  login,
} from "../../controllers/user.controller";

const userRouter = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: 전체 사용자 조회
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: 건너뛸 항목 수
 *     responses:
 *       200:
 *         description: 사용자 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
// GET /api/users - 전체 사용자 조회
userRouter.get("/", getAllUsers);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: 회원가입
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - studentId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               studentId:
 *                 type: string
 *                 description: 학번
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: 유효성 검증 실패 또는 중복된 이메일/학번
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// POST /api/users - 회원가입
userRouter.post("/", createUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: 로그인 (학번 + 비밀번호)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - password
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: 학번
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: 잘못된 학번 또는 비밀번호
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// POST /api/users/login - 로그인 (학번 + 비밀번호)
userRouter.post("/login", login);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: 회원 정보 수정
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               studentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: 사용자를 찾을 수 없음
 */
// PUT /api/users/:id - 회원 수정
userRouter.put("/:id", updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: 회원 삭제
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 UUID
 *     responses:
 *       200:
 *         description: 삭제 성공
 *       404:
 *         description: 사용자를 찾을 수 없음
 */
// DELETE /api/users/:id - 회원 삭제
userRouter.delete("/:id", deleteUser);

export default userRouter;