import { create } from "zustand";
import type { User } from "../types/auth.types";

interface AuthState {
  user: User | null;

  accessToken: string | null;
  refreshToken: string | null;

  login: (user: User, accessToken: string, refreshToken: string) => void;
  setSession: (user: User, accessToken: string, refreshToken: string) => void;

  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),

  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),

  login: (user, accessToken, refreshToken) => {
    localStorage.setItem("user", JSON.stringify(user));

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    set({
      user,
      accessToken,
      refreshToken,
    });
  },

  setSession: (user, accessToken, refreshToken) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    set({
      user,
      accessToken,
      refreshToken,
    });
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  },
}));
