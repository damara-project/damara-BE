// src/controllers/post.controller.ts

import { Request, Response, NextFunction } from "express";
import { PostService } from "@src/services/PostService";
import { parseReq } from "@src/routes/common/validation/parseReq";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import {
  createPostSchema,
  CreatePostReq,
  updatePostSchema,
  UpdatePostReq,
} from "@src/routes/common/validation/post-schemas";

/**
 * 공동구매 상품 전체 조회 컨트롤러
 * GET /api/posts
 */
export async function getAllPosts(
  req: Request,
  res: Response,
  next: NextFunction,
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
 * 공동구매 상품 상세 조회 컨트롤러
 * GET /api/posts/:id
 */
export async function getPostById(
  req: Request,
  res: Response,
  next: NextFunction,
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
 * 공동구매 상품 등록 컨트롤러
 * POST /api/posts
 * body: { post: { ... } }
 */
export async function createPost(
  req: Request,
  res: Response,
  next: NextFunction,
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
      images,
    );

    res.status(HttpStatusCodes.CREATED).json(createdPost);
  } catch (error) {
    next(error);
  }
}

/**
 * 공동구매 상품 수정 컨트롤러
 * PUT /api/posts/:id
 * body: { post: { ... } }
 */
export async function updatePost(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const validatedData = parseReq<UpdatePostReq>(updatePostSchema)(req.body);
    const { post } = validatedData;

    // deadline이 있으면 Date 객체로 변환
    const updateData: any = { ...post };
    if (post.deadline) {
      updateData.deadline = new Date(post.deadline);
    }

    const updatedPost = await PostService.updatePost(id, updateData);

    res.status(HttpStatusCodes.OK).json(updatedPost);
  } catch (error) {
    next(error);
  }
}

/**
 * 공동구매 상품 삭제 컨트롤러
 * DELETE /api/posts/:id
 */
export async function deletePost(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    await PostService.deletePost(id);

    res.status(HttpStatusCodes.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
}

