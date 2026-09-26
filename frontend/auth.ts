import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { api } from "@/lib/api";

type BackendLoginResponse = {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresAt?: number;
  user?: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    roles_id: number[];
  };
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email o nombre de usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        try {
          const response = await api.post<BackendLoginResponse>("/auth/login", {
            email,
            password,
          });
          const data = response.data;

          const accessToken = data.accessToken ?? data.token;

          if (
            !accessToken ||
            !data.refreshToken ||
            !data.accessTokenExpiresAt ||
            !data.user
          ) {
            return null;
          }

          return {
            id: data.user.id,
            name: data.user.fullName,
            email: data.user.email,
            username: data.user.username,
            roles: data.user.roles_id,
            accessToken,
            refreshToken: data.refreshToken,
            accessTokenExpiresAt: data.accessTokenExpiresAt,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpiresAt = user.accessTokenExpiresAt;
        token.username = user.username;
        token.roles = user.roles;
      }

      const shouldRefresh =
        typeof token.refreshToken === "string" &&
        typeof token.accessTokenExpiresAt === "number" &&
        Date.now() >= token.accessTokenExpiresAt - 30_000;

      if (shouldRefresh) {
        try {
          const response = await api.post<BackendLoginResponse>(
            "/auth/refresh",
            { refreshToken: token.refreshToken },
          );
          const data = response.data;
          const accessToken = data.accessToken ?? data.token;

          if (
            !accessToken ||
            !data.refreshToken ||
            !data.accessTokenExpiresAt
          ) {
            throw new Error("Respuesta de actualización inválida");
          }

          token.accessToken = accessToken;
          token.refreshToken = data.refreshToken;
          token.accessTokenExpiresAt = data.accessTokenExpiresAt;
          delete token.error;
        } catch {
          token.error = "RefreshAccessTokenError";
        }
      }

      return token;
    },
    session({ session, token }) {
      session.accessToken =
        typeof token.accessToken === "string" ? token.accessToken : "";
      session.error = typeof token.error === "string" ? token.error : undefined;
      session.user.id = token.sub ?? "";
      session.user.username =
        typeof token.username === "string" ? token.username : "";
      session.user.roles = Array.isArray(token.roles)
        ? token.roles.filter((role): role is number => typeof role === "number")
        : [];

      return session;
    },
  },
});
