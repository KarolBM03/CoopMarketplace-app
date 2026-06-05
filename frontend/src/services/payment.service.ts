import api from "../api/axios";

export const processPayment = async (
  orderId: string,
  _amount: number,
  idempotencyKey?: string,
) => {
  const response = await api.post(`/orders/${orderId}/cooperative-payment-link`, {}, {
    headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
  });

  return response.data;
};
