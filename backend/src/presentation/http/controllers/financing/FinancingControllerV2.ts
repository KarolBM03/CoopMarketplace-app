import { Request, Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import {
  AcceptCounterOfferUseCase,
  ApproveFinancingUseCase,
  ConfirmFinancingPaymentUseCase,
  CreateCounterOfferUseCase,
  CreateFinancingUseCase,
  GetAdminFinancingsUseCase,
  GetCustomerFinancingUseCase,
  GetFinancingPaymentLinkUseCase,
  RejectFinancingUseCase,
} from "../../../../application/use-cases/financing/FinancingUseCases";
import { LegacyFinancingRepository } from "../../../../infrastructure/repositories/LegacyFinancingRepository";
import { handleControllerError } from "../../../../shared/utils/controllerError";

export class FinancingControllerV2 {
  constructor(private readonly financingRepository = new LegacyFinancingRepository()) {}

  create = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new CreateFinancingUseCase(this.financingRepository);
      const financing = await useCase.execute({
        ...req.body,
        customerId: req.user?.role === "ADMIN" && req.body.customerId ? req.body.customerId : req.user?.id,
      });
      return res.status(201).json(financing);
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  getByCustomer = async (req: Request, res: Response) => {
    try {
      const useCase = new GetCustomerFinancingUseCase(this.financingRepository);
      return res.json(await useCase.execute(req.params.customerId as string));
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  adminFinancings = async (req: Request, res: Response) => {
    try {
      const useCase = new GetAdminFinancingsUseCase(this.financingRepository);
      return res.json(await useCase.execute(Number(req.query.page) || 1, Number(req.query.limit) || 10));
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  cooperativeApprove = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new ApproveFinancingUseCase(this.financingRepository);
      return res.json(await useCase.execute(req.params.financingId as string, req.user?.id));
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  cooperativeReject = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new RejectFinancingUseCase(this.financingRepository);
      return res.json(await useCase.execute(req.params.financingId as string, req.user?.id, req.body?.reason));
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  counterOffer = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new CreateCounterOfferUseCase(this.financingRepository);
      return res.json(await useCase.execute(req.params.financingId as string, req.body, req.user?.id));
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  acceptOffer = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new AcceptCounterOfferUseCase(this.financingRepository);
      return res.json(await useCase.execute(req.params.financingId as string, req.user?.id));
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  paymentLink = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new GetFinancingPaymentLinkUseCase(this.financingRepository);
      return res.json(await useCase.execute(req.params.financingId as string));
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  confirmPayment = async (req: Request, res: Response) => {
    try {
      const callbackSecret = process.env.COOP_CALLBACK_SECRET;
      const signature = req.headers["x-coop-signature"];

      if (callbackSecret && signature !== callbackSecret) {
        return res.status(401).json({ message: "Callback no autorizado" });
      }

      const useCase = new ConfirmFinancingPaymentUseCase(this.financingRepository);
      return res.json(await useCase.execute({
        financingId: req.params.financingId,
        externalReference: req.body.externalReference,
        cooperativeResponse: req.body,
      }));
    } catch (error) {
      return handleControllerError(error, res);
    }
  };
}



