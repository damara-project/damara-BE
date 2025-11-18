// src/controllers/upload.controller.ts

import { Request, Response, NextFunction } from "express";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";

/**
 * 이미지 업로드 컨트롤러
 * POST /api/upload/image
 * multipart/form-data: { image: File }
 */
export async function uploadImage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.file) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        error: "IMAGE_REQUIRED",
      });
    }

    // 업로드된 파일의 URL 생성
    const imageUrl = `/uploads/images/${req.file.filename}`;

    res.status(HttpStatusCodes.OK).json({
      url: imageUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 다중 이미지 업로드 컨트롤러
 * POST /api/upload/images
 * multipart/form-data: { images: File[] }
 */
export async function uploadImages(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        error: "IMAGES_REQUIRED",
      });
    }

    const files = Array.isArray(req.files) ? req.files : [req.files];
    const imageUrls = files.map((file) => ({
      url: `/uploads/images/${file.filename}`,
      filename: file.filename,
    }));

    res.status(HttpStatusCodes.OK).json({
      images: imageUrls,
    });
  } catch (error) {
    next(error);
  }
}

