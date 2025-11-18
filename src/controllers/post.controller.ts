// 고급웹프로그래밍_3_최원빈_60203042
// src/controllers/post.controller.ts

import { Request, Response, NextFunction } from "express";
import { PostService } from "@src/services/PostService";
import { PostCreationAttributes } from "@src/models/Post";
import { parseReq } from "@src/routes/common/validation/parseReq";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import {
  createPostSchema,
  CreatePostReq,
  updatePostSchema,
  UpdatePostReq,
} from "@src/routes/common/validation/post-schemas";

/**
 * 공동구매 상품 전체 목록
 * GET /api/posts?limit&offset
 *
 * - pagination 기본값은 (20, 0)
 * - Service.listPosts로 위임하여 DB 접근을 추상화
 */
export async function getAllPosts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 20;
    const offset = req.query.offset
      ? parseInt(req.query.offset as string, 10)
      : 0;

    const posts = await PostService.listPosts(limit, offset);

    res.status(HttpStatusCodes.OK).json(posts);
  } catch (error) {
    next(error);
  }
}

/**
 * 특정 작성자의 상품 목록 (학번 기준)
 * GET /api/posts/student/:studentId
 */
export async function getPostsByStudentId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { studentId } = req.params;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 20;
    const offset = req.query.offset
      ? parseInt(req.query.offset as string, 10)
      : 0;

    const posts = await PostService.listPostsByStudentId(
      studentId,
      limit,
      offset
    );
    res.status(HttpStatusCodes.OK).json(posts);
  } catch (error) {
    next(error);
  }
}

/**
 * 공동구매 상품 상세 조회
 * GET /api/posts/:id
 *
 * - 존재하지 않으면 Service에서 RouteError(404)를 던짐
 */
export async function getPostById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const post = await PostService.getPostById(id);

    res.status(HttpStatusCodes.OK).json(post);
  } catch (error) {
    next(error);
  }
}

/**
 * 공동구매 상품 등록
 * POST /api/posts
 * body: { post: { ... } }
 *
 * - deadline 문자열을 Date 객체로 변환
 * - 이미지 배열을 그대로 Service.createPost에 전달
 */
export async function createPost(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const validatedData = parseReq<CreatePostReq>(createPostSchema)(req.body);
    const { post } = validatedData;

    // deadline을 Date 객체로 변환
    const { images = [], deadline, ...postData } = post;

    const createdPost = await PostService.createPost(
      {
        ...postData,
        deadline: new Date(deadline),
      },
      images
    );

    res.status(HttpStatusCodes.CREATED).json(createdPost);
  } catch (error) {
    next(error);
  }
}

/**
 * 공동구매 상품 수정
 * PUT /api/posts/:id
 * body: { post: { ...patch } }
 *
 * - 부분 업데이트를 허용하므로 Partial<PostCreationAttributes> 사용
 */
export async function updatePost(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const validatedData = parseReq<UpdatePostReq>(updatePostSchema)(req.body);
    const { post } = validatedData;

    // deadline을 분리하여 Date 객체로 변환
    const { deadline, ...patchWithoutDeadline } = post;
    const updateData: Partial<PostCreationAttributes> = {
      ...patchWithoutDeadline,
    };
    if (deadline) {
      updateData.deadline = new Date(deadline);
    }

    const updatedPost = await PostService.updatePost(id, updateData);

    res.status(HttpStatusCodes.OK).json(updatedPost);
  } catch (error) {
    next(error);
  }
}

/**
 * 공동구매 상품 삭제
 * DELETE /api/posts/:id
 *
 * - 성공 시 204 No Content
 */
export async function deletePost(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    await PostService.deletePost(id);

    res.status(HttpStatusCodes.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
}
