import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../../infrastructure/database/prisma";

interface JwtPayload {
  id: string;
}

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        message: "No autorizado",
      });
    }

    const cleanToken = token.replace("Bearer ", "");

    const decoded = jwt.verify(
      cleanToken,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Usuario no encontrado",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: "Tu cuenta esta bloqueada",
      });
    }

    const { password: _, ...safeUser } = user;

    req.user = safeUser;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token no valido",
    });
  }
};



