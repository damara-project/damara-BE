import { UserRepo } from "@src/repos/UserRepo";
import { CreateUserInput, UpdateUserInput, User } from "@src/models/User";
import bcrypt from "bcrypt";

export const UserService = {
  /*
    1. Service는 Express를 몰라야한다.
    http와 독립적인 순수 비즈니스 계층임

    Repository는 SQL만 알면 되는 녀석,
    해싱/검증은 도메인 로직 따라서 Service에서 처리함

    Repository (SQL,DB) -> Service (해싱/검증) -> Controller (http)

    2.예를 들어 비밀번호 해싱은 Repo가 아니라 Service에서 처리한다.
    
    3. 중복 체크와 같은 비즈니즈 규칙은 싹 다 서비스에서 한다고 생각하라.

    4. Service는 여러 레포지토리들을 조합할 수 있다.
    유저 생성 후, Notification 레포지토리에 알림을 보낼 수 있다.
    유저 삭제시 , Chat 레포지토리에서 채팅 내역을 삭제할 수 있다.
    이런건 엔티티 간 흐름. 이런건 서비스에서 처리해야한다는 것이다.
   */

  //회원가입 함수
  async registerUser(data: CreateUserInput): Promise<User> {
    //1. 이메일 중복 검사
    const exists = await UserRepo.findByEmail(data.email);
    if (exists) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }
    //2. 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(data.passwordHash, 10);

    //3. 유저 생성
    const user = await UserRepo.create({
      ...data,
      passwordHash: hashedPassword,
    });
    return user;
  },

  //이메일로 사용자 조회하는 함수
  async getUserByEmail(email: string): Promise<User | null> {
    const user = await UserRepo.findByEmail(email);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }
    return user;
  },

  //사용자 수정함수
  async updateUser(id: string, patch: UpdateUserInput): Promise<User> {
    const user = await UserRepo.update(id, patch);
    return user;
  },

  //사용자 삭제함수
  async deleteUser(id: string): Promise<void> {
    await UserRepo.delete(id);
  },
};
