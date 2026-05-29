import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export const allowSelfOrAdmin =
  (paramName: string) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const resourceUserId = req.params[paramName];

    if (req.user.role === "ADMIN" || req.user.id === resourceUserId) {
      return next();
    }

    return res.status(403).json({ message: "No tienes permisos" });
  };

