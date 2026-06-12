import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getMe } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";

interface Props {
  children: React.ReactNode;
  allowedRoles?: Array<"CUSTOMER" | "SELLER" | "SERVICE_PROVIDER" | "ADMIN">;
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const user = useAuthStore.getState().user;
  const logout = useAuthStore.getState().logout;

  const [checking, setChecking] = useState(true);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      if (!user) {
        setChecking(false);
        return;
      }

      const freshUser = await getMe();

      if (freshUser.isBlocked) {
        logout();
        setBlocked(true);
      }
    } catch (error) {
      const status =
        error instanceof AxiosError ? error.response?.status : undefined;

      if (status === 401 || status === 403) {
        logout();
        setBlocked(true);
      }
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Verificando sesión...
      </div>
    );
  }

  if (!user || blocked) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
