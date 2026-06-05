import { Response } from "express";
import { PrismaUserRepository } from "../../../../infrastructure/repositories/PrismaUserRepository";
import { ApproveSellerUseCase } from "../../../../application/use-cases/auth/ApproveSellerUseCase";
import { BlockUserUseCase } from "../../../../application/use-cases/auth/BlockUserUseCase";
import { ForgotPasswordUseCase } from "../../../../application/use-cases/auth/ForgotPasswordUseCase";
import { GetUserProfileUseCase } from "../../../../application/use-cases/auth/GetUserProfileUseCase";
import { LoginUserUseCase } from "../../../../application/use-cases/auth/LoginUserUseCase";
import { RefreshTokenUseCase } from "../../../../application/use-cases/auth/RefreshTokenUseCase";
import { RegisterUserUseCase } from "../../../../application/use-cases/auth/RegisterUserUseCase";
import { RejectSellerUseCase } from "../../../../application/use-cases/auth/RejectSellerUseCase";
import { ResendOTPUseCase } from "../../../../application/use-cases/auth/ResendOTPUseCase";
import { ResetPasswordUseCase } from "../../../../application/use-cases/auth/ResetPasswordUseCase";
import { UnblockUserUseCase } from "../../../../application/use-cases/auth/UnblockUserUseCase";
import { VerifyOTPUseCase } from "../../../../application/use-cases/auth/VerifyOTPUseCase";
import { AuthRequest } from "../../middlewares/auth.middleware";

const getStatusCode = (message: string) => {
  if (message.includes("no encontrado") || message.includes("no fue encontrado")) {
    return 404;
  }

  if (message.includes("bloquead") || message.includes("permisos")) {
    return 403;
  }

  if (message.includes("credenciales") || message.includes("Token")) {
    return 401;
  }

  return 400;
};

export class AuthControllerV2 {
  constructor(private readonly userRepository = new PrismaUserRepository()) {}

  private handleError(error: unknown, res: Response) {
    const message = error instanceof Error ? error.message : "Error inesperado";
    return res.status(getStatusCode(message)).json({ message });
  }

  register = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new RegisterUserUseCase(this.userRepository);
      const result = await useCase.execute(req.body);

      return res.status(201).json(result);
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  login = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new LoginUserUseCase(this.userRepository);
      const result = await useCase.execute(req.body);

      return res.json(result);
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  refreshToken = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new RefreshTokenUseCase(this.userRepository);
      const result = await useCase.execute(req.body.refreshToken);

      return res.json(result);
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  verifyOTP = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new VerifyOTPUseCase(this.userRepository);
      const result = await useCase.execute(
        req.body.email,
        req.body.otpCode,
        req.body.channel || "email",
      );

      return res.json(result);
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  resendOTP = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new ResendOTPUseCase(this.userRepository);
      const result = await useCase.execute(req.body.email, req.body.channel || "email");

      return res.json(result);
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  forgotPassword = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new ForgotPasswordUseCase(this.userRepository);
      const result = await useCase.execute(req.body.email);

      return res.json(result);
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  resetPassword = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new ResetPasswordUseCase(this.userRepository);
      const token = (req.params.token || req.body.token) as string;
      const result = await useCase.execute(token, req.body.password);

      return res.json(result);
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  approveSeller = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new ApproveSellerUseCase(this.userRepository);
      const result = await useCase.execute(req.params.userId as string);

      return res.json(result);
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  rejectSeller = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new RejectSellerUseCase(this.userRepository);
      const result = await useCase.execute(req.params.userId as string);

      return res.json(result);
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  blockUser = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new BlockUserUseCase(this.userRepository);
      const result = await useCase.execute(req.params.userId as string);

      return res.json(result);
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  unblockUser = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new UnblockUserUseCase(this.userRepository);
      const result = await useCase.execute(req.params.userId as string);

      return res.json(result);
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  me = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new GetUserProfileUseCase(this.userRepository);
      const userId = req.params.userId || req.user?.id;
      const result = await useCase.execute(userId as string);

      return res.json(result);
    } catch (error) {
      return this.handleError(error, res);
    }
  };
}



