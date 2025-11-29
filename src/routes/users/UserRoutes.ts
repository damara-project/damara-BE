import { Router } from "express";

import {
  createUser,
  getAllUsers,
  getUserById,
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
 *               - user
 *             properties:
 *               user:
 *                 type: object
 *                 required:
 *                   - email
 *                   - passwordHash
 *                   - nickname
 *                   - studentId
 *                 properties:
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: "test@mju.ac.kr"
 *                     description: 명지대학교 이메일 형식 권장
 *                   passwordHash:
 *                     type: string
 *                     minLength: 8
 *                     format: password
 *                     example: "mypassword123"
 *                     description: 비밀번호 (8자 이상, 평문으로 전송하면 서버에서 해시화)
 *                   nickname:
 *                     type: string
 *                     minLength: 2
 *                     example: "홍길동"
 *                     description: 닉네임 (2자 이상)
 *                   studentId:
 *                     type: string
 *                     example: "20241234"
 *                     description: 학번 (필수, unique)
 *                   department:
 *                     type: string
 *                     example: "컴퓨터공학과"
 *                     description: 학과/부서 (선택사항)
 *                   avatarUrl:
 *                     type: string
 *                     format: uri
 *                     example: "https://example.com/avatar.jpg"
 *                     description: 프로필 이미지 URL (선택사항)
 *           example:
 *             user:
 *               email: "test@mju.ac.kr"
 *               passwordHash: "mypassword123"
 *               nickname: "홍길동"
 *               studentId: "20241234"
 *               department: "컴퓨터공학과"
 *               avatarUrl: "https://example.com/avatar.jpg"
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
 *   get:
 *     summary: 사용자 정보 조회
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 사용자 UUID
 *     responses:
 *       200:
 *         description: 사용자 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: 사용자를 찾을 수 없음
 */
// GET /api/users/:id - 사용자 정보 조회
userRouter.get("/:id", getUserById);

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
 *           format: uuid
 *         description: 사용자 UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *             properties:
 *               user:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                     format: email
 *                   passwordHash:
 *                     type: string
 *                     minLength: 8
 *                     format: password
 *                   nickname:
 *                     type: string
 *                     minLength: 2
 *                   studentId:
 *                     type: string
 *                   department:
 *                     type: string
 *                   avatarUrl:
 *                     type: string
 *                     format: uri
 *           example:
 *             user:
 *               nickname: "수정된닉네임"
 *               department: "수정된학과"
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