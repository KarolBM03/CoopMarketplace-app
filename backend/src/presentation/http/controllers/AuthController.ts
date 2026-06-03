import { Response } from "express";
import { PrismaUserRepository } from "../../../infrastructure/respositories/PrismaUserRepository";
import { RegisterUserUseCase } from "../../../application/use-cases/auth/RegisterUserUseCase";
import { LoginUserUseCase } from "../../../application/use-cases/auth/LoginUserUseCase";
import { RefreshTokenUseCase } from "../../../application/use-cases/auth/RefreshTokenUseCase";
import { ForgotPasswordUseCase } from "../../../application/use-cases/auth/ForgotPasswordUseCase";
import { ResetPasswordUseCase } from "../../../application/use-cases/auth/ResetPasswordUseCase";
import { VerifyOTPUseCase } from "../../../application/use-cases/auth/VerifyOTPUseCase";
import { ResendOTPUseCase } from "../../../application/use-cases/auth/ResendOTPUseCase";
import { ApproveSellerUseCase } from "../../../application/use-cases/auth/ApproveSellerUseCase";
import { RejectSellerUseCase } from "../../../application/use-cases/auth/RejectSellerUseCase";
import { BlockUserUseCase } from "../../../application/use-cases/auth/BlockUserUseCase";
import { UnblockUserUseCase } from "../../../application/use-cases/auth/UnblockUserUseCase";
import { GetUserProfileUseCase } from "../../../application/use-cases/auth/GetUserProfileUseCase";
import { AuthRequest } from "../../../middlewares/auth.middleware";

const userRepository = new PrismaUserRepository();

export const registerController = async (req: AuthRequest, res: Response) => {
  try {
    const useCase = new RegisterUserUseCase(userRepository);
    const result = await useCase.execute(req.body);

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const loginController = async (req: AuthRequest, res: Response) => {
  try {
    const useCase = new LoginUserUseCase(userRepository);
    const result = await useCase.execute(req.body);

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const refreshTokenController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const useCase = new RefreshTokenUseCase(userRepository);
    const result = await useCase.execute(req.body.refreshToken);

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const verifyOTPController = async (req: AuthRequest, res: Response) => {
  try {
    const useCase = new VerifyOTPUseCase(userRepository);

    const result = await useCase.execute(
      req.body.email,
      req.body.otpCode,
      req.body.channel || "email",
    );

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const resendOTPController = async (req: AuthRequest, res: Response) => {
  try {
    const useCase = new ResendOTPUseCase(userRepository);

    const result = await useCase.execute(
      req.body.email,
      req.body.channel || "email",
    );

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const forgotPasswordController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const useCase = new ForgotPasswordUseCase(userRepository);
    const result = await useCase.execute(req.body.email);

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const resetPasswordController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const useCase = new ResetPasswordUseCase(userRepository);

    const result = await useCase.execute(
      req.params.token as string,
      req.body.password,
    );

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const approveSellerController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const useCase = new ApproveSellerUseCase(userRepository);
    const result = await useCase.execute(req.params.userId as string);

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const rejectSellerController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const useCase = new RejectSellerUseCase(userRepository);
    const result = await useCase.execute(req.params.userId as string);

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const blockUserController = async (req: AuthRequest, res: Response) => {
  try {
    const useCase = new BlockUserUseCase(userRepository);
    const result = await useCase.execute(req.params.userId as string);

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const unblockUserController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const useCase = new UnblockUserUseCase(userRepository);
    const result = await useCase.execute(req.params.userId as string);

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const meController = async (req: AuthRequest, res: Response) => {
  try {
    const useCase = new GetUserProfileUseCase(userRepository);

    const userId = req.params.userId || req.user?.id;

    const result = await useCase.execute(userId as string);

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
