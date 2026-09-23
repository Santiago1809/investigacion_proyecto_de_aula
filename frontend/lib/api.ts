"use client";

import axios from "axios";
import { useAuth } from "@/hooks/use-auth";
import { redirect } from "next/navigation";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useAuth.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401 && error.config?.url !== "/auth/login") {
      useAuth.getState().setToken(null);
      redirect('/login');
    }

    return Promise.reject(error);
  },
);

export { api };
