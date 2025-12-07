// src/services/FavoriteService.ts

import { FavoriteRepo } from "../repos/FavoriteRepo";
import { FavoriteCreationAttributes } from "../models/Favorite";

export const FavoriteService = {
  /**
   * 관심 등록
   */
  async addFavorite(postId: string, userId: string) {
    return await FavoriteRepo.create({ postId, userId });
  },

  /**
   * 관심 해제
   */
  async removeFavorite(postId: string, userId: string) {
    await FavoriteRepo.delete(postId, userId);
  },

  /**
   * 관심 여부 확인
   */
  async isFavorite(postId: string, userId: string) {
    return await FavoriteRepo.isFavorite(postId, userId);
  },

  /**
   * 사용자별 관심 목록 조회
   */
  async getFavorites(userId: string, limit = 20, offset = 0) {
    const favorites = await FavoriteRepo.findByUserId(userId, limit, offset);
    const total = await FavoriteRepo.countByUserId(userId);

    return {
      favorites,
      total,
    };
  },

  /**
   * 게시글별 관심 수 조회
   */
  async getFavoriteCount(postId: string) {
    return await FavoriteRepo.countByPostId(postId);
  },
};

