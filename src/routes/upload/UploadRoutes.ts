// src/routes/upload/UploadRoutes.ts

import { Router } from "express";
import { upload } from "../../config/multer";
import {
  uploadImage,
  uploadImages,
} from "../../controllers/upload.controller";

const uploadRouter = Router();

/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     summary: 단일 이미지 업로드
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: 이미지 파일 (최대 5MB)
 *     responses:
 *       200:
 *         description: 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrl:
 *                   type: string
 *                   description: 업로드된 이미지 URL
 */
// 단일 이미지 업로드
// POST /api/upload/image
uploadRouter.post("/image", upload.single("image"), uploadImage);

/**
 * @swagger
 * /api/upload/images:
 *   post:
 *     summary: 다중 이미지 업로드 (최대 10개)
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 이미지 파일 배열 (최대 10개, 각각 최대 5MB)
 *     responses:
 *       200:
 *         description: 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrls:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: 업로드된 이미지 URL 배열
 */
// 다중 이미지 업로드
// POST /api/upload/images
uploadRouter.post("/images", upload.array("images", 10), uploadImages);

export default uploadRouter;
