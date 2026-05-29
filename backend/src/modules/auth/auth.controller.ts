import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  getUserById,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
} from "./auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const result = await registerUser(req.body);

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await loginUser(email, password);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const verify = async (req: Request, res: Response) => {
  try {
    const { email, otpCode, channel } = req.body;

    const result = await verifyOTP(email, otpCode, channel);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const resend = async (req: Request, res: Response) => {
  try {
    const { email, channel } = req.body;

    const result = await resendOTP(email, channel);

    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const result = await refreshAccessToken(req.body.refreshToken);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({
      message: error.message,
    });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const userId = (req.params.userId || (req as any).user?.id) as string;

    const user = await getUserById(userId);

    res.json(user);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const forgot = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const result = await forgotPassword(email);

    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const reset = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    const result = await resetPassword(token, password);

    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};
