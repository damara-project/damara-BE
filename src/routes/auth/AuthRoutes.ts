import { Router } from "express";
import passport from "passport";

const authRouter = Router();

/**
 * 로그인 폼 (지금은 임시 텍스트, 나중에 Nunjucks로 교체 예정)
 * GET /auth/login
 */
authRouter.get("/login", (req, res) => {
  // 추후: res.render("auth/login.njk", { user: req.user, query: req.query });
  return res.send("여기는 로그인 페이지입니다. (추후 Nunjucks 템플릿으로 교체 예정)");
});

/**
 * Local 로그인 처리
 * POST /auth/login
 */
authRouter.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login?error=1",
  })
);

/**
 * Kakao 로그인
 * GET /auth/kakao
 */
authRouter.get("/kakao", passport.authenticate("kakao"));

/**
 * Kakao 콜백
 * GET /auth/kakao/callback
 */
authRouter.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    successRedirect: "/",
    failureRedirect: "/auth/login?error=kakao",
  })
);

/**
 * 로그아웃
 * POST /auth/logout
 */
authRouter.post("/logout", (req, res, next) => {
  if (typeof req.logout === "function") {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/");
    });
  } else {
    return res.redirect("/");
  }
});

export default authRouter;



