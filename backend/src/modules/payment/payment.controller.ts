import { Request, Response } from "express";
import {
  processPayment,
  handlePaymentCallback,
  retryFailedPayment,
} from "./payment.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const process = async (req: AuthRequest, res: Response) => {
  try {
    const payment = await processPayment({
      ...req.body,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      idempotencyKey:
        req.body.idempotencyKey ||
        (req.headers["idempotency-key"] as string | undefined),
    });

    res.json(payment);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const callback = async (req: Request, res: Response) => {
  const signature = req.headers["x-signature"];
  const timestamp = req.headers["x-timestamp"];
  const callbackSecret = global.process.env.PAYMENT_CALLBACK_SECRET;

  if (!callbackSecret || signature !== callbackSecret) {
    return res.status(401).json({
      message: "Callback no autorizado",
    });
  }

  if (timestamp) {
    const callbackTime = Number(timestamp);
    const fiveMinutes = 5 * 60 * 1000;

    if (!Number.isFinite(callbackTime) || Math.abs(Date.now() - callbackTime) > fiveMinutes) {
      return res.status(401).json({
        message: "Callback expirado",
      });
    }
  }

  try {
    const payment = await handlePaymentCallback({
      ...req.body,
      idempotencyKey:
        req.body.idempotencyKey ||
        (req.headers["idempotency-key"] as string | undefined),
    });

    res.json({
      message: "Callback procesado correctamente",
      payment,
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const retry = async (req: AuthRequest, res: Response) => {
  try {
    const payment = await retryFailedPayment(
      req.params.transactionId as string,
      req.user?.id,
      req.user?.role,
    );

    res.json({
      message: "Pago reenviado a procesamiento",
      payment,
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};
