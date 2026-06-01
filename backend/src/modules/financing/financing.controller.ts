import { Request, Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import {
  acceptCounterOffer,
  approveByCooperative,
  confirmCooperativePayment,
  createCounterOffer,
  createFinancing,
  getAdminFinancings,
  getCooperativePaymentLink,
  getCustomerFinancing,
  rejectFinancing,
} from "./financing.service";

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const financing = await createFinancing({
      ...req.body,
      customerId:
        req.user?.role === "ADMIN" && req.body.customerId
          ? req.body.customerId
          : req.user?.id,
    });

    res.status(201).json(financing);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getByCustomer = async (req: Request, res: Response) => {
  try {
    const financings = await getCustomerFinancing(
      req.params.customerId as string,
    );

    res.json(financings);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const adminFinancings = async (req: Request, res: Response) => {
  try {
    const financings = await getAdminFinancings(
      Number(req.query.page) || 1,
      Number(req.query.limit) || 10,
    );
    res.json(financings);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const cooperativeApprove = async (req: AuthRequest, res: Response) => {
  try {
    const financing = await approveByCooperative(
      req.params.financingId as string,
      req.user?.id,
    );

    res.json(financing);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const cooperativeReject = async (req: AuthRequest, res: Response) => {
  try {
    const financing = await rejectFinancing(
      req.params.financingId as string,
      req.user?.id,
      req.body?.reason,
    );

    res.json(financing);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const counterOffer = async (req: AuthRequest, res: Response) => {
  try {
    const financing = await createCounterOffer(
      req.params.financingId as string,
      req.body,
      req.user?.id,
    );

    res.json(financing);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const acceptOffer = async (req: AuthRequest, res: Response) => {
  try {
    const financing = await acceptCounterOffer(
      req.params.financingId as string,
      req.user?.id,
    );

    res.json(financing);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const paymentLink = async (req: AuthRequest, res: Response) => {
  try {
    const result = await getCooperativePaymentLink(
      req.params.financingId as string,
    );

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const callbackSecret = process.env.COOP_CALLBACK_SECRET;
    const signature = req.headers["x-coop-signature"];

    if (callbackSecret && signature !== callbackSecret) {
      return res.status(401).json({ message: "Callback no autorizado" });
    }

    const financing = await confirmCooperativePayment({
      financingId: req.params.financingId as string,
      externalReference: req.body.externalReference,
      cooperativeResponse: req.body,
    });

    res.json(financing);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
