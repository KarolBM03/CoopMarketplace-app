import api from "../api/axios";

export const getCooperativeHealth = async () => {
  const response = await api.get("/cooperative/health");
  return response.data;
};

export const testCooperativeLogin = async () => {
  const response = await api.post("/cooperative/test-login");
  return response.data;
};

export const findCooperativeMemberByCedula = async (cedula: string) => {
  const response = await api.get(`/cooperative/members/cedula/${cedula}`);
  return response.data;
};

export const getCooperativeMemberDetail = async (socioId: string) => {
  const response = await api.get(`/cooperative/members/${socioId}`);
  return response.data;
};

export const getCooperativeEligibility = async (socioId: string) => {
  const response = await api.get(`/cooperative/members/${socioId}/eligibility`);
  return response.data;
};

export const getCooperativeLoanTypes = async () => {
  const response = await api.get("/cooperative/loan-types");
  return response.data;
};

export const createCooperativeLoanApplication = async (data: {
  socioId: number;
  montoSolicitado: number;
  frecuenciaPago: number;
  cantidadCuotas: number;
  objetivoPrestamo: string;
  tipoPrestamoId: number;
}) => {
  const response = await api.post("/cooperative/loan-applications", data);
  return response.data;
};

export const approveCooperativeLoan = async (data: {
  solicitudPrestamoId: number;
  requiereDesembolso: boolean;
  actualizadoPor: string;
}) => {
  const response = await api.post("/cooperative/loan-applications/approve", data);
  return response.data;
};

export const getCooperativeLoanApplication = async (
  solicitudPrestamoId: string,
) => {
  const response = await api.get(
    `/cooperative/loan-applications/${solicitudPrestamoId}`,
  );
  return response.data;
};

export const getCooperativeLoanApplicationHistory = async (
  solicitudPrestamoId: string,
) => {
  const response = await api.get(
    `/cooperative/loan-applications/${solicitudPrestamoId}/history`,
  );
  return response.data;
};

export const payCooperativeLoan = async (data: {
  numeroCuentaPrestamo: string;
  numeroCuentaOrigen: string;
}) => {
  const response = await api.post("/cooperative/payments/loan", data);
  return response.data;
};

export const payCooperativeInstallment = async (data: {
  cuentaOrigen: string;
  cuentaPrestamoId: number;
  cuotaId: number;
  montoPagar?: number;
  canal?: string;
}) => {
  const response = await api.post("/cooperative/payments/installment", data);
  return response.data;
};

export const getCooperativeGlobalPayments = async (prestamoId: string) => {
  const response = await api.get("/cooperative/payments/global", {
    params: { prestamoId },
  });
  return response.data;
};

export const getCooperativePaymentDetails = async (pagoGlobalId: string) => {
  const response = await api.get("/cooperative/payments/details", {
    params: { pagoGlobalId },
  });
  return response.data;
};

export const getCooperativePaymentsByInstallment = async (
  cuotaPrestamoId: string,
) => {
  const response = await api.get("/cooperative/payments/by-installment", {
    params: { cuotaPrestamoId },
  });
  return response.data;
};

export const createCooperativeInterbankTransaction = async (data: {
  name?: string;
  description?: string;
  amount: number;
  noAccountCoop?: string;
  identification?: string;
  nameAccountBank?: string;
  noAccountBank?: string;
  noAccountCoopAdmin?: string;
  accountBankId: string;
  transferetionTypeId: string;
  socioId: number;
  accountType?: string;
}) => {
  const response = await api.post("/cooperative/interbank/transactions", data);
  return response.data;
};

export const getCooperativeInterbankTransactions = async (
  params: Record<string, string>,
) => {
  const response = await api.get("/cooperative/interbank/transactions", {
    params,
  });
  return response.data;
};

export const simulateCooperativeFinancingEvent = async (
  financingId: string,
  event: string,
) => {
  const response = await api.post(
    `/cooperative/financings/${financingId}/simulate-event`,
    { event },
  );

  return response.data;
};
