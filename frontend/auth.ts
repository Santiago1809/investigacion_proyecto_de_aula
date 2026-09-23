import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { api } from "@/lib/api";

type BackendLoginResponse = {
  token?: string;
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

          if (!data.token || !data.user) {
            return null;
          }

          return {
            id: data.user.id,
            name: data.user.fullName,
            email: data.user.email,
            username: data.user.username,
            roles: data.user.roles_id,
            accessToken: data.token,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.username = user.username;
        token.roles = user.roles;
      }

      return token;
    },
    session({ session, token }) {
      session.accessToken =
        typeof token.accessToken === "string" ? token.accessToken : "";
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
