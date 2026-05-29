import { Request, Response } from "express";
import {
  requestPayout,
  approvePayout,
  rejectPayout,
  getSellerPayouts,
  getPendingPayouts,
} from "./payout.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const request = async (req: AuthRequest, res: Response) => {
  try {
    const payout = await requestPayout(
      req.user?.role === "ADMIN" && req.body.sellerId
        ? req.body.sellerId
        : req.user?.id,
      Number(req.body.amount),
      req.headers["idempotency-key"] as string | undefined,
    );

    res.status(201).json(payout);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const approve = async (req: AuthRequest, res: Response) => {
  try {
    const payout = await approvePayout(req.params.payoutId as string, req.user?.id);

    res.json(payout);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const reject = async (req: AuthRequest, res: Response) => {
  try {
    const payout = await rejectPayout(
      req.params.payoutId as string,
      req.user?.id,
      req.body.reason,
    );

    res.json(payout);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getBySeller = async (req: Request, res: Response) => {
  try {
    const payouts = await getSellerPayouts(req.params.sellerId as string);

    res.json(payouts);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getPending = async (_req: Request, res: Response) => {
  try {
    const payouts = await getPendingPayouts();

    res.json(payouts);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};
