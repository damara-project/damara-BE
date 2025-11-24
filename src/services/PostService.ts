// src/services/PostService.ts

import { PostRepo } from "../repos/PostRepo";
import { PostCreationAttributes } from "../models/Post";
import { RouteError } from "../common/util/route-errors";
import HttpStatusCodes from "../common/constants/HttpStatusCodes";
import UserModel from "../models/User";

export const PostService = {
  /**
   * 공동구매 상품 등록
   * - 작성자가 존재하는지 확인
   * - 이미지 URL 배열을 PostRepo로 전달
   */
  async createPost(
    data: PostCreationAttributes,
    imageUrls: string[] = [],
  ) {
    // 작성자 존재 확인
    const author = await UserModel.findByPk(data.authorId);
    if (!author) {
      throw new RouteError(
        HttpStatusCodes.NOT_FOUND,
        "AUTHOR_NOT_FOUND",
      );
    }

    const post = await PostRepo.create(data, imageUrls);
    return post?.get();
  },

  /**
   * ID로 상품 조회
   */
  async getPostById(id: string) {
    const post = await PostRepo.findById(id);
    if (!post) {
      throw new RouteError(HttpStatusCodes.NOT_FOUND, "POST_NOT_FOUND");
    }
    return post;
  },

  /**
   * 전체 조회 + pagination
   */
  async listPosts(limit = 20, offset = 0) {
    return await PostRepo.list(limit, offset);
  },

  /**
   * 작성자 ID로 조회
   */
  async listPostsByAuthor(authorId: string, limit = 20, offset = 0) {
    return await PostRepo.findByAuthorId(authorId, limit, offset);
  },

  /**
   * 작성자 학번으로 조회
   * - 학번으로 User를 찾은 뒤 해당 사용자의 게시글을 반환
   */
  async listPostsByStudentId(studentId: string, limit = 20, offset = 0) {
    const author = await UserModel.findOne({ where: { studentId } });
    if (!author) {
      throw new RouteError(HttpStatusCodes.NOT_FOUND, "AUTHOR_NOT_FOUND");
    }
    return await PostRepo.findByAuthorId(author.id, limit, offset);
  },

  /**
   * 부분 업데이트
   */
  async updatePost(id: string, patch: Partial<PostCreationAttributes>) {
    const updatedPost = await PostRepo.update(id, patch);
    return updatedPost?.get();
  },

  /**
   * 삭제
   */
  async deletePost(id: string) {
    await PostRepo.delete(id);
  },
};
