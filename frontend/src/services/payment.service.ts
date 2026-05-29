import api from "../api/axios";

export const processPayment = async (
  orderId: string,
  amount: number,
  idempotencyKey?: string,
) => {
  const response = await api.post("/payments/process", {
    orderId,
    amount,
  }, {
    headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
  });

  return response.data;
};
