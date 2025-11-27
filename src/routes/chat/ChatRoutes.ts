import { Router } from "express";

import {
  createChatRoom,
  getOrCreateChatRoomByPostId,
  getChatRoomById,
  sendMessage,
  getMessagesByChatRoomId,
  markMessageAsRead,
  markAllMessagesAsRead,
  getUnreadMessageCount,
  deleteChatRoom,
  deleteMessage,
} from "../../controllers/chat.controller";

const chatRouter = Router();

/**
 * @swagger
 * /api/chat/rooms:
 *   post:
 *     summary: 채팅방 생성
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatRoom
 *             properties:
 *               chatRoom:
 *                 type: object
 *                 required:
 *                   - postId
 *                 properties:
 *                   postId:
 *                     type: string
 *                     format: uuid
 *                     example: "123e4567-e89b-12d3-a456-426614174000"
 *           example:
 *             chatRoom:
 *               postId: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       201:
 *         description: 채팅방 생성 성공
 *       400:
 *         description: 유효성 검증 실패 또는 이미 채팅방이 존재함
 *       404:
 *         description: Post를 찾을 수 없음
 */
chatRouter.post("/rooms", createChatRoom);

/**
 * @swagger
 * /api/chat/rooms/post/{postId}:
 *   get:
 *     summary: Post ID로 채팅방 조회 또는 생성
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 채팅방 조회 또는 생성 성공
 */
chatRouter.get("/rooms/post/:postId", getOrCreateChatRoomByPostId);

/**
 * @swagger
 * /api/chat/rooms/{id}:
 *   get:
 *     summary: 채팅방 ID로 조회
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 채팅방 조회 성공
 *       404:
 *         description: 채팅방을 찾을 수 없음
 */
chatRouter.get("/rooms/:id", getChatRoomById);

/**
 * @swagger
 * /api/chat/messages:
 *   post:
 *     summary: 메시지 전송
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: object
 *                 required:
 *                   - chatRoomId
 *                   - senderId
 *                   - content
 *                 properties:
 *                   chatRoomId:
 *                     type: string
 *                     format: uuid
 *                   senderId:
 *                     type: string
 *                     format: uuid
 *                   content:
 *                     type: string
 *                     minLength: 1
 *                   messageType:
 *                     type: string
 *                     enum: [text, image, file]
 *                     default: text
 *           example:
 *             message:
 *               chatRoomId: "123e4567-e89b-12d3-a456-426614174000"
 *               senderId: "a87522bd-bc79-47b0-a73f-46ea4068a158"
 *               content: "안녕하세요! 공동구매 참여하고 싶습니다."
 *               messageType: "text"
 *     responses:
 *       201:
 *         description: 메시지 전송 성공
 *       400:
 *         description: 유효성 검증 실패
 *       404:
 *         description: 채팅방 또는 발신자를 찾을 수 없음
 */
chatRouter.post("/messages", sendMessage);

/**
 * @swagger
 * /api/chat/rooms/{chatRoomId}/messages:
 *   get:
 *     summary: 채팅방의 메시지 목록 조회
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: chatRoomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: 메시지 목록 조회 성공
 *       404:
 *         description: 채팅방을 찾을 수 없음
 */
chatRouter.get("/rooms/:chatRoomId/messages", getMessagesByChatRoomId);

/**
 * @swagger
 * /api/chat/messages/{id}/read:
 *   patch:
 *     summary: 메시지 읽음 처리
 *     tags: [Chat]
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
 *     responses:
 *       200:
 *         description: 읽음 처리 성공
 *       404:
 *         description: 메시지를 찾을 수 없음
 */
chatRouter.patch("/messages/:id/read", markMessageAsRead);

/**
 * @swagger
 * /api/chat/rooms/{chatRoomId}/read-all:
 *   patch:
 *     summary: 채팅방의 모든 메시지 읽음 처리
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: chatRoomId
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
 *     responses:
 *       204:
 *         description: 읽음 처리 성공
 */
chatRouter.patch("/rooms/:chatRoomId/read-all", markAllMessagesAsRead);

/**
 * @swagger
 * /api/chat/rooms/{chatRoomId}/unread-count:
 *   get:
 *     summary: 읽지 않은 메시지 수 조회
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: chatRoomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 읽지 않은 메시지 수 조회 성공
 */
chatRouter.get("/rooms/:chatRoomId/unread-count", getUnreadMessageCount);

/**
 * @swagger
 * /api/chat/rooms/{id}:
 *   delete:
 *     summary: 채팅방 삭제
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: 채팅방 삭제 성공
 *       404:
 *         description: 채팅방을 찾을 수 없음
 */
chatRouter.delete("/rooms/:id", deleteChatRoom);

/**
 * @swagger
 * /api/chat/messages/{id}:
 *   delete:
 *     summary: 메시지 삭제
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: 메시지 삭제 성공
 *       404:
 *         description: 메시지를 찾을 수 없음
 */
chatRouter.delete("/messages/:id", deleteMessage);

export default chatRouter;
