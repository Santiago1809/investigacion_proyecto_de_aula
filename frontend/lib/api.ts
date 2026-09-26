import axios from "axios";
import { getSession, signOut } from "next-auth/react";

const api = axios.create({
  baseURL:
    typeof window === "undefined"
      ? (process.env.BACKEND_URL ?? "http://localhost:3001")
      : (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001"),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const session = await getSession();
  const token = session?.accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const requestConfig = error.config as
      | (typeof error.config & { _retry?: boolean })
      | undefined;
    const requestUrl = requestConfig?.url ?? "";
    const isAuthEndpoint =
      requestUrl.endsWith("/auth/login") ||
      requestUrl.endsWith("/auth/refresh");

    if (
      typeof window !== "undefined" &&
      error.response?.status === 401 &&
      requestConfig &&
      !requestConfig._retry &&
      !isAuthEndpoint
    ) {
      requestConfig._retry = true;
      const refreshedSession = await getSession();

      if (refreshedSession?.accessToken && !refreshedSession.error) {
        requestConfig.headers.Authorization = `Bearer ${refreshedSession.accessToken}`;
        return api(requestConfig);
      }

      await signOut({ callbackUrl: "/login" });
    }

    return Promise.reject(error);
  },
);

export { api };
