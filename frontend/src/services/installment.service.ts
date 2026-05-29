import api from "../api/axios";
import { createIdempotencyKey } from "../utils/finance";

export const payInstallment = async (installmentId: string) => {
  const response = await api.patch(
    `/installments/pay/${installmentId}`,
    {},
    {
      headers: {
        "Idempotency-Key": createIdempotencyKey("installment"),
      },
    },
  );
  return response.data;
};
