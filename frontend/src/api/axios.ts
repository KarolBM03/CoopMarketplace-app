import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/auth.store";

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as RetryConfig | undefined;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url || "";
    const isAuthRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/auth/refresh-token");

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const { data } = await publicApi.post("/auth/refresh", {
          refreshToken,
        });

        useAuthStore
          .getState()
          .setSession(data.user, data.accessToken, data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(originalRequest);
      } catch {
        useAuthStore.getState().logout();
        toast.error("Tu sesion expiro. Inicia sesion nuevamente.");
        window.location.href = "/login";
      }
    }

    if (status === 403) {
      toast.error(error.response?.data?.message || "No tienes permisos");
    } else if (status && status >= 500) {
      toast.error("El servidor tuvo un problema. Intenta de nuevo.");
    } else if (!error.response) {
      toast.error("No se pudo conectar con el servidor.");
    }

    return Promise.reject(error);
  },
);

export default api;
