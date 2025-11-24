// src/config/multer.ts

// 고급웹프로그래밍_3_최원빈_60203042
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import fs from "fs";

// 업로드 디렉토리 설정
const uploadsDir = path.join(__dirname, "../public/uploads/images");

// 디렉토리가 없으면 생성
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 파일 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // 원본 파일명의 확장자 추출
    const ext = path.extname(file.originalname);
    // UUID로 고유한 파일명 생성 (Node.js 내장 crypto.randomUUID 사용)
    const filename = `${randomUUID()}${ext}`;
    cb(null, filename);
  },
});

// 파일 필터: 이미지 파일만 허용
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("이미지 파일만 업로드 가능합니다. (jpeg, jpg, png, gif, webp)"));
  }
};

// multer 인스턴스 생성
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 제한
  },
  fileFilter,
});

