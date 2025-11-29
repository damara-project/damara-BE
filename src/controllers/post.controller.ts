// src/controllers/post.controller.ts

import { Request, Response, NextFunction } from "express";
import { PostService, PostParticipantService } from "../services/PostService";
import { PostCreationAttributes } from "../models/Post";
import { parseReq } from "../routes/common/validation/parseReq";
import HttpStatusCodes from "../common/constants/HttpStatusCodes";
import {
  createPostSchema,
  CreatePostReq,
  updatePostSchema,
  UpdatePostReq,
} from "../routes/common/validation/post-schemas";

/**
 * 공동구매 상품 전체 목록
 * GET /api/posts?limit&offset&category
 *
 * - pagination 기본값은 (20, 0)
 * - category 쿼리 파라미터로 필터링 가능
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
    const category = req.query.category
      ? (req.query.category as string)
      : undefined;

    const posts = await PostService.listPosts(limit, offset, category);

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

    // deadline과 category를 명시적으로 처리
    const { images = [], deadline, category, ...postData } = post;

    const createdPost = await PostService.createPost(
      {
        ...postData,
        deadline: new Date(deadline),
        category: category || null,
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

/**
 * 공동구매 참여
 * POST /api/posts/:id/participate
 * body: { userId }
 */
export async function joinPost(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        error: "USER_ID_REQUIRED",
      });
    }

    const participant = await PostParticipantService.joinPost(id, userId);
    const post = await PostService.getPostById(id);

    res.status(HttpStatusCodes.CREATED).json({
      participant,
      post: {
        ...post,
        currentQuantity: post.currentQuantity,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 공동구매 참여 취소
 * DELETE /api/posts/:id/participate/:userId
 */
export async function leavePost(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id, userId } = req.params;

    await PostParticipantService.leavePost(id, userId);
    const post = await PostService.getPostById(id);

    res.status(HttpStatusCodes.OK).json({
      post: {
        ...post,
        currentQuantity: post.currentQuantity,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 게시글의 참여자 목록 조회
 * GET /api/posts/:id/participants
 */
export async function getParticipants(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const participants = await PostParticipantService.getParticipants(id);

    res.status(HttpStatusCodes.OK).json(participants);
  } catch (error) {
    next(error);
  }
}

/**
 * 사용자가 참여한 게시글 목록 조회
 * GET /api/posts/user/:userId/participated
 */
export async function getParticipatedPosts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { userId } = req.params;
    const posts = await PostParticipantService.getParticipatedPosts(userId);

    res.status(HttpStatusCodes.OK).json(posts);
  } catch (error) {
    next(error);
  }
}

/**
 * 사용자가 특정 게시글에 참여했는지 확인
 * GET /api/posts/:id/participate/:userId
 */
export async function checkParticipation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id, userId } = req.params;
    const isParticipant = await PostParticipantService.isParticipant(
      id,
      userId
    );

    res.status(HttpStatusCodes.OK).json({ isParticipant });
  } catch (error) {
    next(error);
  }
}
