import { Request, Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import {
  adminApproveFinancing,
  approveFinancing,
  createFinancing,
  getAdminFinancings,
  getCustomerFinancing,
  getSellerPendingFinancings,
  payDownPayment,
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

export const getPendingBySeller = async (req: Request, res: Response) => {
  try {
    const financings = await getSellerPendingFinancings(
      req.params.sellerId as string,
    );

    res.json(financings);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const sellerApprove = async (req: AuthRequest, res: Response) => {
  try {
    const financing = await approveFinancing(
      req.params.financingId as string,
      req.user?.role === "ADMIN" && req.body.sellerId
        ? (req.body.sellerId as string)
        : (req.user?.id as string),
      req.user?.id,
    );

    res.json(financing);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const adminApprove = async (req: AuthRequest, res: Response) => {
  try {
    const financing = await adminApproveFinancing(
      req.params.financingId as string,
      req.user?.id,
    );

    res.json(financing);
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

export const reject = async (req: AuthRequest, res: Response) => {
  try {
    const financing = await rejectFinancing(
      req.params.financingId as string,
      req.user?.id,
      req.user?.role,
      req.body?.reason,
    );
    res.json(financing);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const payInicial = async (req: AuthRequest, res: Response) => {
  try {
    const financing = await payDownPayment(
      req.params.financingId as string,
      req.user?.id,
      req.headers["idempotency-key"] as string | undefined,
    );
    res.json(financing);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};
