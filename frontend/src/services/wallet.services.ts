import api from "../api/axios";
import type { Wallet } from "../types/finance.types";
import { createIdempotencyKey } from "../utils/finance";

export const getWalletByUser = async (userId: string): Promise<Wallet> => {
  const response = await api.get(`/wallets/${userId}`);

  return response.data;
};

export const getMyWallet = async () => {
  const response = await api.get("/wallets/me");
  return response.data;
};

export const rechargeWallet = async (userId: string, amount: number) => {
  const response = await api.post(
    "/wallets/recharge",
    {
      userId,
      amount,
    },
    {
      headers: {
        "Idempotency-Key": createIdempotencyKey("wallet-recharge"),
      },
    },
  );

  return response.data;
};
