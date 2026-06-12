import { Request, Response } from "express";
import {
  ApproveCooperativeLoanUseCase,
  CreateCooperativeInterbankTransactionUseCase,
  CreateCooperativeLoanApplicationUseCase,
  FindCooperativeMemberByCedulaUseCase,
  GetCooperativeEligibilityUseCase,
  GetCooperativeHealthUseCase,
  GetCooperativeInterbankTransactionsUseCase,
  GetCooperativeLoanApplicationHistoryUseCase,
  GetCooperativeLoanApplicationUseCase,
  GetCooperativeLoanGlobalPaymentsUseCase,
  GetCooperativeLoanTypesUseCase,
  GetCooperativeMemberDetailUseCase,
  GetCooperativePaymentDetailsUseCase,
  GetCooperativePaymentsByInstallmentUseCase,
  PayCooperativeInstallmentUseCase,
  PayCooperativeLoanUseCase,
  TestCooperativeLoginUseCase,
} from "../../../../application/use-cases/cooperative/CooperativeUseCases";
import { simulateCooperativeEventForFinancing } from "../../../../infrastructure/external-services/cooperative-webhook.service";

const handleError = (res: Response, error: unknown) =>
  res.status(400).json({
    message: error instanceof Error ? error.message : "Error en cooperativa",
  });

export class CooperativeController {
  health = (_req: Request, res: Response) => {
    try {
      return res.json(new GetCooperativeHealthUseCase().execute());
    } catch (error) {
      return handleError(res, error);
    }
  };

  testLogin = async (_req: Request, res: Response) => {
    try {
      return res.json(await new TestCooperativeLoginUseCase().execute());
    } catch (error) {
      return handleError(res, error);
    }
  };

  findMemberByCedula = async (req: Request, res: Response) => {
    try {
      const data = await new FindCooperativeMemberByCedulaUseCase().execute(
        String(req.params.cedula),
      );

      return res.json(data);
    } catch (error) {
      return handleError(res, error);
    }
  };

  memberDetail = async (req: Request, res: Response) => {
    try {
      const data = await new GetCooperativeMemberDetailUseCase().execute(
        String(req.params.socioId),
      );

      return res.json(data);
    } catch (error) {
      return handleError(res, error);
    }
  };

  eligibility = async (req: Request, res: Response) => {
    try {
      const data = await new GetCooperativeEligibilityUseCase().execute(
        String(req.params.socioId),
      );

      return res.json(data);
    } catch (error) {
      return handleError(res, error);
    }
  };

  loanTypes = async (_req: Request, res: Response) => {
    try {
      return res.json(await new GetCooperativeLoanTypesUseCase().execute());
    } catch (error) {
      return handleError(res, error);
    }
  };

  createLoanApplication = async (req: Request, res: Response) => {
    try {
      const data = await new CreateCooperativeLoanApplicationUseCase().execute(
        req.body,
      );

      return res.status(201).json(data);
    } catch (error) {
      return handleError(res, error);
    }
  };

  approveLoan = async (req: Request, res: Response) => {
    try {
      const data = await new ApproveCooperativeLoanUseCase().execute(req.body);

      return res.json(data);
    } catch (error) {
      return handleError(res, error);
    }
  };

  loanApplication = async (req: Request, res: Response) => {
    try {
      const data = await new GetCooperativeLoanApplicationUseCase().execute(
        String(req.params.solicitudPrestamoId),
      );

      return res.json(data);
    } catch (error) {
      return handleError(res, error);
    }
  };

  loanApplicationHistory = async (req: Request, res: Response) => {
    try {
      const data =
        await new GetCooperativeLoanApplicationHistoryUseCase().execute(
          String(req.params.solicitudPrestamoId),
        );

      return res.json(data);
    } catch (error) {
      return handleError(res, error);
    }
  };

  payLoan = async (req: Request, res: Response) => {
    try {
      return res.json(await new PayCooperativeLoanUseCase().execute(req.body));
    } catch (error) {
      return handleError(res, error);
    }
  };

  payInstallment = async (req: Request, res: Response) => {
    try {
      return res.json(
        await new PayCooperativeInstallmentUseCase().execute(req.body),
      );
    } catch (error) {
      return handleError(res, error);
    }
  };

  loanGlobalPayments = async (req: Request, res: Response) => {
    try {
      const data = await new GetCooperativeLoanGlobalPaymentsUseCase().execute(
        String(req.query.prestamoId || ""),
      );

      return res.json(data);
    } catch (error) {
      return handleError(res, error);
    }
  };

  paymentDetails = async (req: Request, res: Response) => {
    try {
      const data = await new GetCooperativePaymentDetailsUseCase().execute(
        String(req.query.pagoGlobalId || ""),
      );

      return res.json(data);
    } catch (error) {
      return handleError(res, error);
    }
  };

  paymentsByInstallment = async (req: Request, res: Response) => {
    try {
      const data =
        await new GetCooperativePaymentsByInstallmentUseCase().execute(
          String(req.query.cuotaPrestamoId || ""),
        );

      return res.json(data);
    } catch (error) {
      return handleError(res, error);
    }
  };

  createInterbankTransaction = async (req: Request, res: Response) => {
    try {
      const data =
        await new CreateCooperativeInterbankTransactionUseCase().execute(
          req.body,
        );

      return res.status(201).json(data);
    } catch (error) {
      return handleError(res, error);
    }
  };

  interbankTransactions = async (req: Request, res: Response) => {
    try {
      const data =
        await new GetCooperativeInterbankTransactionsUseCase().execute(
          req.query,
        );

      return res.json(data);
    } catch (error) {
      return handleError(res, error);
    }
  };

  simulateFinancingEvent = async (req: Request, res: Response) => {
    try {
      const data = await simulateCooperativeEventForFinancing({
        financingId: String(req.params.financingId),
        event: req.body.event,
      });

      return res.json(data);
    } catch (error) {
      return handleError(res, error);
    }
  };
}
