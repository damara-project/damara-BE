// 고급웹프로그래밍_3_최원빈_60203042
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Damara BE API",
      version: "1.0.0",
      description:
        "공동구매 플랫폼 API 문서. TypeScript + Express + Sequelize + MySQL로 구현되었습니다.",
      contact: {
        name: "최원빈",
        studentId: "60203042",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        User: {
          type: "object",
          required: ["email", "password", "studentId"],
          properties: {
            id: {
              type: "string",
              description: "사용자 UUID",
            },
            email: {
              type: "string",
              format: "email",
              description: "이메일 주소",
            },
            password: {
              type: "string",
              format: "password",
              description: "비밀번호 (bcrypt 해시)",
            },
            studentId: {
              type: "string",
              description: "학번",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Post: {
          type: "object",
          required: ["title", "price", "deadline", "authorId"],
          properties: {
            id: {
              type: "string",
              description: "게시글 UUID",
            },
            title: {
              type: "string",
              description: "상품명",
            },
            price: {
              type: "number",
              description: "가격",
            },
            deadline: {
              type: "string",
              format: "date-time",
              description: "마감 시간",
            },
            authorId: {
              type: "string",
              description: "작성자 UUID",
            },
            images: {
              type: "array",
              items: {
                type: "string",
                description: "이미지 URL",
              },
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "에러 메시지",
            },
          },
        },
      },
    },
  },
  apis: [
    "./src/routes/**/*.ts",
    "./src/controllers/**/*.ts",
    "./src/server.ts",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default swaggerSpec;

