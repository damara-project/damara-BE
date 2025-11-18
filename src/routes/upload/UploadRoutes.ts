// src/routes/upload/UploadRoutes.ts

// 고급웹프로그래밍_3_최원빈_60203042
import { Router } from "express";
import { upload } from "@src/config/multer";
import {
  uploadImage,
  uploadImages,
} from "@src/controllers/upload.controller";

const uploadRouter = Router();

// 단일 이미지 업로드
// POST /api/upload/image
uploadRouter.post("/image", upload.single("image"), uploadImage);

// 다중 이미지 업로드
// POST /api/upload/images
uploadRouter.post("/images", upload.array("images", 10), uploadImages);

export default uploadRouter;

