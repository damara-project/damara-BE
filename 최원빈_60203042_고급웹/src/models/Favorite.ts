// src/models/Favorite.ts

import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db";
import PostModel from "./Post";
import UserModel from "./User";

// ----------------------------
// TypeScript 타입 정의
// ----------------------------

/**
 * DB 컬럼 기반 attributes
 */
export interface FavoriteAttributes {
  id: string;
  userId: string; // users.id와 외래키 관계
  postId: string; // posts.id와 외래키 관계
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Create 시 필요한 값
 */
export type FavoriteCreationAttributes = Optional<
  FavoriteAttributes,
  "id" | "createdAt" | "updatedAt"
>;

/**
 * Sequelize 모델 타입 선언
 */
export class FavoriteModel
  extends Model<FavoriteAttributes, FavoriteCreationAttributes>
  implements FavoriteAttributes
{
  public id!: string;
  public userId!: string;
  public postId!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// ----------------------------
// Sequelize 모델 초기화
// ----------------------------
FavoriteModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
      references: {
        model: UserModel,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "post_id",
      references: {
        model: PostModel,
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    tableName: "favorites",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "post_id"], // 같은 사용자가 같은 게시글에 중복 관심 등록 방지
      },
      {
        fields: ["user_id"], // 사용자별 관심 목록 조회 최적화
      },
      {
        fields: ["post_id"], // 게시글별 관심 수 조회 최적화
      },
    ],
  }
);

// ----------------------------
// 관계 설정 (Associations)
// ----------------------------
FavoriteModel.belongsTo(PostModel, {
  foreignKey: "postId",
  as: "post",
});

FavoriteModel.belongsTo(UserModel, {
  foreignKey: "userId",
  as: "user",
});

PostModel.belongsToMany(UserModel, {
  through: FavoriteModel,
  foreignKey: "postId",
  otherKey: "userId",
  as: "favoritedBy", // PostModel.favoritedBy로 접근 가능
});

UserModel.belongsToMany(PostModel, {
  through: FavoriteModel,
  foreignKey: "userId",
  otherKey: "postId",
  as: "favorites", // UserModel.favorites로 접근 가능
});

export default FavoriteModel;
