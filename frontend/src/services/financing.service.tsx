import api from "../api/axios";
import type { Financing } from "../types/finance.types";

interface FinancingData {
  customerId?: string;
  cedula?: string;
  income?: number;
  company?: string;
  phone?: string;
  address?: string;
  productId: string;
  months: number;
  currency?: string;
}

interface LoanApplicationData {
  productId: string;
  months: number;
  cedula: string;
  income: number;
  company: string;
  phone: string;
  address: string;
}

interface CounterOfferData {
  approvedAmount?: number;
  approvedMonths?: number;
  approvedMonthlyPayment?: number;
  message?: string;
}

export const applyFinancing = async (data: FinancingData) => {
  const response = await api.post("/financing", data);
  return response.data as Financing;
};

export const applyForLoan = async (data: LoanApplicationData) => {
  const response = await api.post("/financing", data);
  return response.data as Financing;
};

export const getCustomerFinancings = async (customerId: string) => {
  const response = await api.get(`/financing/customer/${customerId}`);

  return response.data as Financing[];
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

export const cooperativeApproveFinancing = async (financingId: string) => {
  const response = await api.patch(
    `/financing/${financingId}/cooperative-approve`,
  );

  return response.data as Financing;
};

export const cooperativeRejectFinancing = async (
  financingId: string,
  reason = "Solicitud rechazada por CoopHispanica",
) => {
  const response = await api.patch(
    `/financing/${financingId}/cooperative-reject`,
    {
      reason,
    },
  );

  return response.data as Financing;
};

export const createCounterOffer = async (
  financingId: string,
  data: CounterOfferData,
) => {
  const response = await api.patch(
    `/financing/${financingId}/counter-offer`,
    data,
  );

  return response.data as Financing;
};

export const acceptCounterOffer = async (financingId: string) => {
  const response = await api.patch(`/financing/${financingId}/accept-offer`);
  return response.data as Financing;
};

export const getCooperativePaymentLink = async (financingId: string) => {
  const response = await api.get(`/financing/${financingId}/payment-link`);
  return response.data as { paymentUrl: string };
};
