// src/services/ChatService.ts

import { ChatRoomRepo } from "../repos/ChatRoomRepo";
import { MessageRepo } from "../repos/MessageRepo";
import { ChatRoomCreationAttributes } from "../models/ChatRoom";
import { MessageCreationAttributes } from "../models/Message";
import { RouteError } from "../common/util/route-errors";
import HttpStatusCodes from "../common/constants/HttpStatusCodes";
import UserModel from "../models/User";

export const ChatService = {
  /**
   * 채팅방 생성
   * - Post가 존재하는지 확인
   * - Post당 하나의 채팅방만 생성 가능
   */
  async createChatRoom(data: ChatRoomCreationAttributes) {
    const chatRoom = await ChatRoomRepo.create(data);
    return chatRoom;
  },

  /**
   * Post ID로 채팅방 조회 (없으면 생성)
   */
  async getOrCreateChatRoomByPostId(postId: string) {
    let chatRoom = await ChatRoomRepo.findByPostId(postId);

    if (!chatRoom) {
      // 채팅방이 없으면 생성
      chatRoom = await ChatRoomRepo.create({ postId });
    }

    return chatRoom;
  },

  /**
   * 채팅방 ID로 조회
   */
  async getChatRoomById(id: string) {
    const chatRoom = await ChatRoomRepo.findById(id);
    if (!chatRoom) {
      throw new RouteError(HttpStatusCodes.NOT_FOUND, "CHAT_ROOM_NOT_FOUND");
    }
    return chatRoom;
  },

  /**
   * 메시지 전송
   * - 채팅방 존재 확인
   * - 발신자 존재 확인
   */
  async sendMessage(data: MessageCreationAttributes) {
    // 채팅방 존재 확인
    const chatRoom = await ChatRoomRepo.findById(data.chatRoomId);
    if (!chatRoom) {
      throw new RouteError(HttpStatusCodes.NOT_FOUND, "CHAT_ROOM_NOT_FOUND");
    }

    // 발신자 존재 확인
    const sender = await UserModel.findByPk(data.senderId);
    if (!sender) {
      throw new RouteError(HttpStatusCodes.NOT_FOUND, "SENDER_NOT_FOUND");
    }

    const message = await MessageRepo.create(data);
    return message;
  },

  /**
   * 채팅방의 메시지 목록 조회
   */
  async getMessagesByChatRoomId(chatRoomId: string, limit = 50, offset = 0) {
    // 채팅방 존재 확인
    const chatRoom = await ChatRoomRepo.findById(chatRoomId);
    if (!chatRoom) {
      throw new RouteError(HttpStatusCodes.NOT_FOUND, "CHAT_ROOM_NOT_FOUND");
    }

    const messages = await MessageRepo.findByChatRoomId(
      chatRoomId,
      limit,
      offset
    );
    return messages;
  },

  /**
   * 메시지 읽음 처리
   */
  async markMessageAsRead(messageId: string, userId: string) {
    const message = await MessageRepo.markAsRead(messageId, userId);
    return message;
  },

  /**
   * 채팅방의 모든 메시지 읽음 처리
   */
  async markAllMessagesAsRead(chatRoomId: string, userId: string) {
    // 채팅방 존재 확인
    const chatRoom = await ChatRoomRepo.findById(chatRoomId);
    if (!chatRoom) {
      throw new RouteError(HttpStatusCodes.NOT_FOUND, "CHAT_ROOM_NOT_FOUND");
    }

    await MessageRepo.markAllAsRead(chatRoomId, userId);
  },

  /**
   * 읽지 않은 메시지 수 조회
   */
  async getUnreadMessageCount(chatRoomId: string, userId: string) {
    const count = await MessageRepo.countUnreadMessages(chatRoomId, userId);
    return count;
  },

  /**
   * 채팅방 삭제
   */
  async deleteChatRoom(id: string) {
    await ChatRoomRepo.delete(id);
  },

  /**
   * 메시지 삭제
   */
  async deleteMessage(id: string) {
    await MessageRepo.delete(id);
  },
};
