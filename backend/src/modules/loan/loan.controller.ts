import { Request, Response } from "express";
import {
  applyLoan,
  calculateLoan,
  getLoanStatus,
  syncLoanPayments,
} from "./loan.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const calculate = async (req: Request, res: Response) => {
  try {
    const result = calculateLoan(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const apply = async (req: AuthRequest, res: Response) => {
  try {
    const loan = await applyLoan({
      ...req.body,
      userId:
        req.user?.role === "ADMIN" && req.body.userId
          ? req.body.userId
          : req.user?.id,
    });
    res.status(201).json(loan);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const status = async (req: Request, res: Response) => {
  try {
    const loan = await getLoanStatus(req.params.loanId as string);
    res.json(loan);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const syncPayments = async (req: Request, res: Response) => {
  try {
    const result = await syncLoanPayments(req.params.loanId as string);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
