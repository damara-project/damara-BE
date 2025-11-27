// src/models/ChatRoom.ts

import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db";
import PostModel from "./Post";

// ----------------------------
// TypeScript 타입 정의
// ----------------------------

/**
 * DB 컬럼 기반 attributes
 * 실제 chat_rooms 테이블의 컬럼 스키마를 TypeScript로 옮겨온 타입
 */
export interface ChatRoomAttributes {
  id: string;
  postId: string; // posts.id와 외래키 관계 (공동구매 게시글)
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Create 시 필요한 값(자동 생성되는 id 제거)
 */
export type ChatRoomCreationAttributes = Optional<
  ChatRoomAttributes,
  "id" | "createdAt" | "updatedAt"
>;

/**
 * Sequelize 모델 타입 선언
 */
export class ChatRoomModel
  extends Model<ChatRoomAttributes, ChatRoomCreationAttributes>
  implements ChatRoomAttributes
{
  public id!: string;
  public postId!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// ----------------------------
// Sequelize 모델 초기화
// ----------------------------
ChatRoomModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // 하나의 Post당 하나의 채팅방만
      field: "post_id",
      references: {
        model: PostModel,
        key: "id",
      },
      onDelete: "CASCADE", // Post 삭제 시 채팅방도 삭제
    },
  },
  {
    sequelize,
    tableName: "chat_rooms",
    timestamps: true,
    underscored: true,
  }
);

// ----------------------------
// 관계 설정 (Associations)
// ----------------------------
ChatRoomModel.belongsTo(PostModel, {
  foreignKey: "postId",
  as: "post", // ChatRoomModel.post로 접근 가능
});

PostModel.hasOne(ChatRoomModel, {
  foreignKey: "postId",
  as: "chatRoom", // PostModel.chatRoom으로 접근 가능
});

export default ChatRoomModel;
