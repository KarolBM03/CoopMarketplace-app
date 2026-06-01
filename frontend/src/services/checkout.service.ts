import { createOrder } from "./order.service";
import type { Order, OrderItem } from "../types/finance.types";

interface CheckoutSessionInput {
  customerId: string;
  items: Array<Pick<OrderItem, "productId" | "quantity">>;
}

export const createCheckoutSession = async ({
  customerId,
  items,
}: CheckoutSessionInput): Promise<Order> => {
  return await createOrder(customerId, items);
};

export const confirmCheckout = async () => {
  throw new Error("El pago se confirma desde CoopHispanica por callback");
};
