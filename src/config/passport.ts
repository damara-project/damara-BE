import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { UserService } from "../services/UserService";
import { UserRepo } from "../repos/UserRepo";

/**
 * Passport Local Strategy
 * ---------------------------------------------------------------------------
 * - 기존 학번 로그인 로직(loginByStudentId)을 최대한 재사용한다.
 * - 입력 필드: studentId, password
 * - 성공 시: 세션에 user.id를 저장하고, req.user에 사용자 정보가 올라간다.
 */

passport.use(
  new LocalStrategy(
    {
      usernameField: "studentId",
      passwordField: "password",
      session: true,
    },
    async (studentId, password, done) => {
      try {
        // 기존 서비스 로직 재사용 (비밀번호 검증 포함)
        const userWithoutPassword =
          await UserService.loginByStudentId(studentId, password);
        return done(null, userWithoutPassword);
      } catch (error) {
        // 자격 증명 오류는 false로 처리하여 실패 플로우로 보낸다.
        return done(null, false, {
          message: "학번 또는 비밀번호를 확인해주세요.",
        });
      }
    }
  )
);

/**
 * 세션에 어떤 값을 저장할지 정의
 * - 여기서는 사용자 UUID(id)만 저장
 */
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

/**
 * 세션에서 사용자 정보 복원
 * - DB에서 전체 사용자 정보를 다시 읽어온다.
 */
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await UserRepo.findById(id);
    if (!user) {
      return done(null, false);
    }
    const { passwordHash, ...userWithoutPassword } = user;
    return done(null, userWithoutPassword);
  } catch (error) {
    return done(error as Error);
  }
});

export default passport;


