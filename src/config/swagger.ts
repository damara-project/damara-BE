import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express, Request, Response, NextFunction } from "express";
import ENV from "@src/common/constants/ENV";

// 환경 변수에서 API 베이스 URL 가져오기 (배포 환경에서 설정)
const getServerUrl = () => {
  return ENV.ApiBaseUrl;
};

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
        url: getServerUrl(),
        description: ENV.NodeEnv === "production" ? "Production server" : "Development server",
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

/**
 * Swagger UI 설정
 * - 환경 변수 API_BASE_URL이 설정되어 있으면 해당 URL 사용
 * - 없으면 요청의 현재 서버 URL을 자동으로 사용 (동적)
 * - 배포 환경에서는 API_BASE_URL=https://your-domain.com 으로 설정
 * 
 * 사용법:
 *   - 개발: http://localhost:3000/api-docs
 *   - 배포: https://your-domain.com/api-docs
 *   - 환경 변수로 API_BASE_URL 설정 시 해당 URL이 기본 서버로 설정됨
 */
export const setupSwagger = (app: Express) => {
  // Swagger JSON 엔드포인트 (동적 서버 URL 포함)
  // 각 요청마다 현재 서버의 URL을 동적으로 설정
  app.get("/api-docs.json", (req: Request, res: Response) => {
    const currentServerUrl = `${req.protocol}://${req.get("host")}`;
    
    const dynamicSpec = {
      ...swaggerSpec,
      servers: [
        {
          url: currentServerUrl,
          description: "Current server (자동 감지)",
        },
        ...(ENV.ApiBaseUrl && ENV.ApiBaseUrl !== currentServerUrl
          ? [
              {
                url: ENV.ApiBaseUrl,
                description: "Configured API Base URL",
              },
            ]
          : []),
      ],
    };

    res.json(dynamicSpec);
  });

  // Swagger UI - 동적 JSON을 참조하도록 설정
  app.use(
    "/api-docs",
    swaggerUi.serve,
    (req: Request, res: Response, _next: NextFunction) => {
      void _next;
      // 동적 JSON URL을 사용하도록 설정
      const swaggerHtml = swaggerUi.generateHTML(
        {
          ...swaggerSpec,
          servers: [
            {
              url: `${req.protocol}://${req.get("host")}`,
              description: "Current server (자동 감지)",
            },
            ...(ENV.ApiBaseUrl && ENV.ApiBaseUrl !== `${req.protocol}://${req.get("host")}`
              ? [
                  {
                    url: ENV.ApiBaseUrl,
                    description: "Configured API Base URL",
                  },
                ]
              : []),
          ],
        },
        {
          swaggerOptions: {
            persistAuthorization: true,
            url: "/api-docs.json", // 동적 JSON 참조
          },
          customCss: ".swagger-ui .topbar { display: none }",
        },
      );

      res.send(swaggerHtml);
    },
  );
};

export default swaggerSpec;
