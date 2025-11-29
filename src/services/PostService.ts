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
  async createPost(data: PostCreationAttributes, imageUrls: string[] = []) {
    // 작성자 존재 확인
    const author = await UserModel.findByPk(data.authorId);
    if (!author) {
      throw new RouteError(HttpStatusCodes.NOT_FOUND, "AUTHOR_NOT_FOUND");
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
   * category 필터링 지원
   */
  async listPosts(limit = 20, offset = 0, category?: string | null) {
    return await PostRepo.list(limit, offset, category);
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

// 참여 기능을 위한 별도 Service
import { PostParticipantRepo } from "../repos/PostParticipantRepo";
import PostModel from "../models/Post";

export const PostParticipantService = {
  /**
   * 공동구매 참여
   * - 참여 후 currentQuantity 업데이트
   */
  async joinPost(postId: string, userId: string) {
    // 참여 처리
    const participant = await PostParticipantRepo.create({
      postId,
      userId,
    });

    // currentQuantity 업데이트
    const count = await PostParticipantRepo.countByPostId(postId);
    await PostModel.update(
      { currentQuantity: count },
      { where: { id: postId } }
    );

    return participant;
  },

  /**
   * 참여 취소
   * - 취소 후 currentQuantity 업데이트
   */
  async leavePost(postId: string, userId: string) {
    await PostParticipantRepo.delete(postId, userId);

    // currentQuantity 업데이트
    const count = await PostParticipantRepo.countByPostId(postId);
    await PostModel.update(
      { currentQuantity: count },
      { where: { id: postId } }
    );
  },

  /**
   * 게시글의 참여자 목록 조회
   */
  async getParticipants(postId: string) {
    return await PostParticipantRepo.findByPostId(postId);
  },

  /**
   * 사용자가 참여한 게시글 목록 조회
   */
  async getParticipatedPosts(userId: string) {
    return await PostParticipantRepo.findByUserId(userId);
  },

  /**
   * 사용자가 특정 게시글에 참여했는지 확인
   */
  async isParticipant(postId: string, userId: string) {
    return await PostParticipantRepo.isParticipant(postId, userId);
  },
};
