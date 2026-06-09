import { Response, Request } from "express";
import {
  ApproveAdminSellerUseCase,
  BlockAdminUserUseCase,
  GetAdminFinancialReportUseCase,
  GetAdminMetricsUseCase,
  GetFraudAlertsUseCase,
  GetSellersUseCase,
  GetUsersUseCase,
  RejectAdminSellerUseCase,
  UnblockAdminUserUseCase,
} from "../../../../application/use-cases/admin/AdminUseCases";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { LegacyAdminRepository } from "../../../../infrastructure/repositories/LegacyAdminRepository";
import { handleControllerError } from "../../../../shared/utils/controllerError";
import { ResolveFraudAlertUseCase } from "../../../../application/use-cases/admin/ResolveFraudAlertUseCase";

export class AdminControllerV2 {
  constructor(private readonly adminRepository = new LegacyAdminRepository()) {}

  metrics = async (_req: AuthRequest, res: Response) => {
    try {
      return res.json(
        await new GetAdminMetricsUseCase(this.adminRepository).execute(),
      );
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  financialReport = async (_req: AuthRequest, res: Response) => {
    try {
      return res.json(
        await new GetAdminFinancialReportUseCase(
          this.adminRepository,
        ).execute(),
      );
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  fraudAlerts = async (_req: AuthRequest, res: Response) => {
    try {
      return res.json(
        await new GetFraudAlertsUseCase(this.adminRepository).execute(),
      );
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  resolveFraudAlert = async (req: AuthRequest, res: Response) => {
    try {
      return res.json(
        await new ResolveFraudAlertUseCase(this.adminRepository).execute(
          req.params.alertId as string,
        ),
      );
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  users = async (_req: AuthRequest, res: Response) => {
    try {
      return res.json(
        await new GetUsersUseCase(this.adminRepository).execute(),
      );
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  blockUser = async (req: AuthRequest, res: Response) => {
    try {
      return res.json(
        await new BlockAdminUserUseCase(this.adminRepository).execute(
          req.params.userId as string,
          req.user?.id,
        ),
      );
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  unblockUser = async (req: AuthRequest, res: Response) => {
    try {
      return res.json(
        await new UnblockAdminUserUseCase(this.adminRepository).execute(
          req.params.userId as string,
          req.user?.id,
        ),
      );
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  approveSeller = async (req: AuthRequest, res: Response) => {
    try {
      return res.json(
        await new ApproveAdminSellerUseCase(this.adminRepository).execute(
          req.params.userId as string,
          req.user?.id,
        ),
      );
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  rejectSeller = async (req: AuthRequest, res: Response) => {
    try {
      return res.json(
        await new RejectAdminSellerUseCase(this.adminRepository).execute(
          req.params.userId as string,
          req.user?.id,
        ),
      );
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  sellers = async (_req: AuthRequest, res: Response) => {
    try {
      return res.json(
        await new GetSellersUseCase(this.adminRepository).execute(),
      );
    } catch (error) {
      return handleControllerError(error, res);
    }
  };
}
