// src/repos/ChatRoomRepo.ts

import ChatRoomModel, { ChatRoomCreationAttributes } from "../models/ChatRoom";
import PostModel from "../models/Post";
import { RouteError } from "../common/util/route-errors";
import HttpStatusCodes from "../common/constants/HttpStatusCodes";

export const ChatRoomRepo = {
  /**
   * 채팅방 생성
   * - Post가 존재하는지 확인
   * - Post당 하나의 채팅방만 생성 가능 (unique 제약)
   */
  async create(data: ChatRoomCreationAttributes) {
    try {
      // Post 존재 확인
      const post = await PostModel.findByPk(data.postId);
      if (!post) {
        throw new RouteError(HttpStatusCodes.NOT_FOUND, "POST_NOT_FOUND");
      }

      const chatRoom = await ChatRoomModel.create(data);
      return chatRoom.get();
    } catch (e: unknown) {
      // 이미 채팅방이 존재하는 경우
      if (e instanceof Error && e.name === "SequelizeUniqueConstraintError") {
        throw new RouteError(
          HttpStatusCodes.BAD_REQUEST,
          "CHAT_ROOM_ALREADY_EXISTS"
        );
      }
      throw e;
    }
  },

  /**
   * ID로 채팅방 조회
   */
  async findById(id: string) {
    const chatRoom = await ChatRoomModel.findByPk(id, {
      include: [
        {
          model: PostModel,
          as: "post",
          attributes: ["id", "title", "authorId"],
        },
      ],
    });
    return chatRoom ? chatRoom.get() : null;
  },

  /**
   * Post ID로 채팅방 조회
   */
  async findByPostId(postId: string) {
    const chatRoom = await ChatRoomModel.findOne({
      where: { postId },
      include: [
        {
          model: PostModel,
          as: "post",
          attributes: ["id", "title", "authorId"],
        },
      ],
    });
    return chatRoom ? chatRoom.get() : null;
  },

  /**
   * 채팅방 삭제
   */
  async delete(id: string) {
    const deleted = await ChatRoomModel.destroy({ where: { id } });
    if (deleted === 0) {
      throw new RouteError(HttpStatusCodes.NOT_FOUND, "CHAT_ROOM_NOT_FOUND");
    }
  },
};
