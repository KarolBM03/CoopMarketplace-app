import { createIdempotencyKey } from "../utils/finance";
import { createOrder } from "./order.service";
import { processPayment } from "./payment.service";
import type { Order, OrderItem } from "../types/finance.types";

interface CheckoutSessionInput {
  customerId: string;
  items: Array<Pick<OrderItem, "productId" | "quantity">>;
}

interface ConfirmCheckoutInput {
  orderId: string;
  amount: number;
}

export const createCheckoutSession = async ({
  customerId,
  items,
}: CheckoutSessionInput): Promise<Order> => {
  return await createOrder(customerId, items);
};

export const confirmCheckout = async ({
  orderId,
  amount,
}: ConfirmCheckoutInput) => {
  const idempotencyKey = createIdempotencyKey("payment");

  return await processPayment(orderId, amount, idempotencyKey);
};
