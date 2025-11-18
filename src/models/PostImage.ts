// src/models/PostImage.ts

import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@src/db";
import PostModel from "./Post";

// ----------------------------
// TypeScript 타입 정의
// ----------------------------

/**
 * DB 컬럼 기반 attributes
 * 실제 post_images 테이블의 컬럼 스키마를 TypeScript로 옮겨온 타입
 */
export interface PostImageAttributes {
  id: string;
  postId: string; // posts.id와 외래키 관계
  imageUrl: string;
  sortOrder: number;
  createdAt?: Date;
}

/**
 * Create 시 필요한 값(자동 생성되는 id 제거)
 */
export type PostImageCreationAttributes = Optional<
  PostImageAttributes,
  "id" | "sortOrder" | "createdAt"
>;

/**
 * Sequelize 모델 타입 선언
 */
export class PostImageModel
  extends Model<PostImageAttributes, PostImageCreationAttributes>
  implements PostImageAttributes
{
  public id!: string;
  public postId!: string;
  public imageUrl!: string;
  public sortOrder!: number;

  public readonly createdAt!: Date;
}

// ----------------------------
// Sequelize 모델 초기화
// ----------------------------
PostImageModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "post_id",
      references: {
        model: PostModel,
        key: "id",
      },
    },

    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: "image_url",
    },

    sortOrder: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0,
      field: "sort_order",
    },
  },

  {
    sequelize,
    tableName: "post_images",
    timestamps: true, // createdAt만 사용, updatedAt은 필요 없음
    underscored: true,
    updatedAt: false, // 이미지는 수정하지 않으므로 updatedAt 불필요
  }
);

// ----------------------------
// 관계 설정 (Associations)
// Post와 PostImage의 1:N 관계 설정
// ----------------------------
PostModel.hasMany(PostImageModel, {
  foreignKey: "postId",
  as: "images", // PostModel.images로 접근 가능
});

PostImageModel.belongsTo(PostModel, {
  foreignKey: "postId",
  as: "post", // PostImageModel.post로 접근 가능
});

export default PostImageModel;

