import { Request, Response } from "express";
import { createOrder } from "./order.service";
import { updateOrderStatus } from "./order.service";
import { cancelOrder } from "./order.service";
import { getOrdersByCustomer } from "./order.service";
import { getSellerSales } from "./order.service";
import {
  confirmCooperativeOrderPayment,
  getOrderCooperativePaymentLink,
} from "./order.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const order = await createOrder({
      ...req.body,
      customerId:
        req.user?.role === "ADMIN" && req.body.customerId
          ? req.body.customerId
          : req.user?.id,
    });

    res.status(201).json(order);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const order = await updateOrderStatus(
      req.params.id as string,
      req.body.status,
    );

    res.json(order);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const cancel = async (req: Request, res: Response) => {
  try {
    const order = await cancelOrder(req.params.id as string);

    res.json(order);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getCustomerOrders = async (req: Request, res: Response) => {
  try {
    const orders = await getOrdersByCustomer(req.params.customerId as string);

    res.json(orders);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getSalesBySeller = async (req: Request, res: Response) => {
  try {
    const sales = await getSellerSales(req.params.sellerId as string);

    res.json(sales);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const cooperativePaymentLink = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const result = await getOrderCooperativePaymentLink(
      req.params.orderId as string,
      req.user?.id,
    );

    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const confirmCooperativePayment = async (
  req: Request,
  res: Response,
) => {
  try {
    const callbackSecret = process.env.COOP_CALLBACK_SECRET;
    const signature = req.headers["x-coop-signature"];

    if (callbackSecret && signature !== callbackSecret) {
      return res.status(401).json({ message: "Callback no autorizado" });
    }

    const order = await confirmCooperativeOrderPayment({
      orderId: req.params.orderId as string,
      externalReference: req.body.externalReference,
      cooperativeResponse: req.body,
    });

    res.json(order);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// simulador para ver si funciona el envio//

export const devConfirmPayment = async (req: AuthRequest, res: Response) => {
  try {
    const order = await confirmCooperativeOrderPayment({
      orderId: req.params.orderId as string,
      externalReference: `DEV-${Date.now()}`,
      cooperativeResponse: {
        mode: "DEV",
        confirmedBy: req.user?.id,
      },
    });

    res.json(order);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
