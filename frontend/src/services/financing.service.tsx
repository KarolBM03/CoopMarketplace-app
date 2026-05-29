import api from "../api/axios";
import type { Financing } from "../types/finance.types";
import { createIdempotencyKey } from "../utils/finance";

interface FinancingData {
  customerId: string;
  cedula?: string;
  income?: number;
  company?: string;
  phone?: string;
  address?: string;
  productId: string;
  downPayment: number;
  months: number;
}

interface LoanApplicationData {
  orderId?: string;
  productId: string;
  downPayment: number;
  months: number;
  cedula: string;
  income: number;
  company: string;
  phone: string;
  address: string;
}

export const applyFinancing = async (data: FinancingData) => {
  const response = await api.post("/financing", data);
  return response.data;
};

export const applyForLoan = async (data: LoanApplicationData) => {
  const response = await api.post("/financing", data);
  return response.data as Promise<Financing>;
};

export const getCustomerFinancings = async (customerId: string) => {
  const response = await api.get(`/financing/customer/${customerId}`);

  return response.data as Financing[];
};

export const getSellerPendingFinancings = async (sellerId: string) => {
  const response = await api.get(`/financing/seller/${sellerId}/pending`);

  return response.data;
};

export const approveFinancing = async (
  financingId: string,
  sellerId: string,
) => {
  const response = await api.patch(`/financing/${financingId}/seller-approve`, {
    sellerId,
  });

  return response.data;
};

export const getAdminFinancings = async (page = 1, limit = 10) => {
  const response = await api.get("/financing/admin", {
    params: {
      page,
      limit,
    },
  });
  return response.data;
};

export const rejectFinancing = async (financingId: string) => {
  const response = await api.patch(`/financing/${financingId}/reject`);
  return response.data;
};

export const adminApproveFinancing = async (financingId: string) => {
  const response = await api.patch(`/financing/${financingId}/admin-approve`);

  return response.data;
};

export const adminRejectFinancing = async (
  financingId: string,
  reason = "Solicitud rechazada por cooperativa",
) => {
  const response = await api.patch(`/financing/${financingId}/admin-reject`, {
    reason,
  });

  return response.data;
};

export const payDownPayment = async (financingId: string) => {
  const response = await api.patch(
    `/financing/${financingId}/pay-down-payment`,
    {},
    {
      headers: {
        "Idempotency-Key": createIdempotencyKey("down-payment"),
      },
    },
  );
  return response.data;
};
