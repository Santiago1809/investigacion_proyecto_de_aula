import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    username: string;
    roles: number[];
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: number;
  }

  interface Session {
    accessToken: string;
    accessTokenExpiresAt: number;
    error?: string;
    user: {
      id: string;
      username: string;
      roles: number[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: number;
    error?: string;
    username?: string;
    roles?: number[];
  }
}
