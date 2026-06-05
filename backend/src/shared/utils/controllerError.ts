import { Response } from "express";

export const handleControllerError = (error: unknown, res: Response) => {
  const message = error instanceof Error ? error.message : "Error inesperado";
  return res.status(400).json({ message });
};



