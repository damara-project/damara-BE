declare module "passport-kakao" {
  export interface StrategyOptions {
    clientID: string;
    clientSecret?: string;
    callbackURL: string;
  }

  export interface Profile {
    id: string;
    username?: string;
    displayName?: string;
    _json?: any;
  }

  export class Strategy {
    constructor(
      options: StrategyOptions,
      verify: (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (error: any, user?: any) => void
      ) => void
    );
  }
}


