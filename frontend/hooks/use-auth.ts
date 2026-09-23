import { User } from "@/lib/interfaces/auth";
import { create } from "zustand";

type AuthState = {
  token: string | null;
  setToken: (token: string | null) => void;
  user: User | null;
  setUser: (user: User | null) => void;
};

export const useAuth = create<AuthState>((set) => ({
  token: null,
  setToken: (token: string | null) => set({ token }),
  user: null,
  setUser: (user: User | null) => set({ user }),
}));
