import api from "../api/axios";
import type { Payout } from "../types/finance.types";
import { createIdempotencyKey } from "../utils/finance";

export const requestPayout = async (sellerId: string, amount: number) => {
  const response = await api.post("/payouts/request", {
    sellerId,
    amount,
  }, {
    headers: {
      "Idempotency-Key": createIdempotencyKey("payout"),
    },
  });

  return response.data;
};

export const getSellerPayouts = async (sellerId: string): Promise<Payout[]> => {
  const response = await api.get(`/payouts/seller/${sellerId}`);
  return response.data;
};

export const getPendingPayouts = async () => {
  const response = await api.get("/payouts/pending");
  return response.data;
};

export const approvePayout = async (payoutId: string) => {
  const response = await api.patch(`/payouts/${payoutId}/approve`);
  return response.data;
};

export const rejectPayout = async (
  payoutId: string,
  reason = "Retiro rechazado por administrador",
) => {
  const response = await api.patch(`/payouts/${payoutId}/reject`, {
    reason,
  });
  return response.data;
};
