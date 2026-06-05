import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { PrismaOrderRepository } from "../../../infrastructure/repositories/PrismaOrderRepository";
import { CreateOrderUseCase } from "../../../application/use-cases/order/CreateOrderUseCase";
import { CancelOrderUseCase } from "../../../application/use-cases/order/CancelOrderUseCase";
import { GetOrdersByCustomerUseCase } from "../../../application/use-cases/order/GetOrdersByCustomerUseCase";
import { GetSellerSalesUseCase } from "../../../application/use-cases/order/GetSellerSalesUseCase";
import { GetOrderPaymentLinkUseCase } from "../../../application/use-cases/order/GetOrderPaymentLinkUseCase";
import { UpdateOrderStatusUseCase } from "../../../application/use-cases/order/UpdateOrderStatusUseCase";

const orderRepository = new PrismaOrderRepository();

export const createOrderController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const useCase = new CreateOrderUseCase(orderRepository);

    const order = await useCase.execute({
      customerId: req.user?.id as string,
      items: req.body.items,
    });

    res.status(201).json(order);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const cancelOrderController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const useCase = new CancelOrderUseCase(orderRepository);
    const order = await useCase.execute(req.params.orderId as string);

    res.json(order);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateOrderStatusController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const useCase = new UpdateOrderStatusUseCase(orderRepository);

    const order = await useCase.execute(
      req.params.orderId as string,
      req.body.status,
    );

    res.json(order);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const customerOrdersController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const useCase = new GetOrdersByCustomerUseCase(orderRepository);

    const customerId =
      req.user?.role === "ADMIN" && req.params.customerId
        ? req.params.customerId
        : req.user?.id;

    const orders = await useCase.execute(customerId as string);

    res.json(orders);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const sellerSalesController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const useCase = new GetSellerSalesUseCase(orderRepository);

    const sellerId =
      req.user?.role === "ADMIN" && req.params.sellerId
        ? req.params.sellerId
        : req.user?.id;

    const sales = await useCase.execute(sellerId as string);

    res.json(sales);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const orderPaymentLinkController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const useCase = new GetOrderPaymentLinkUseCase(orderRepository);
    const result = await useCase.execute(req.params.orderId as string);

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};



