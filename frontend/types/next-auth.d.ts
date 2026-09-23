import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    username: string;
    roles: number[];
    accessToken: string;
  }

  interface Session {
    accessToken: string;
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
    username?: string;
    roles?: number[];
  }
}
