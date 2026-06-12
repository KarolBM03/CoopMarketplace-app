import prisma from "../database/prisma";

type CooperativeMethod = "GET" | "POST";

const COOP_API_URL =
  process.env.COOP_API_URL || process.env.COOPERATIVE_BASE_URL;
const COOP_API_KEY =
  process.env.COOP_API_KEY || process.env.COOPERATIVE_API_KEY;
const COOP_PAYMENT_URL =
  process.env.COOP_PAYMENT_URL || "https://pagos.coophispanica.local";
const COOP_TIMEOUT_MS = Number(
  process.env.COOP_TIMEOUT_MS || process.env.COOPERATIVE_TIMEOUT_MS || 10000,
);
const COOP_RETRIES = Number(
  process.env.COOP_RETRIES || process.env.COOPERATIVE_RETRIES || 2,
);

const COOP_USERNAME = process.env.COOP_USERNAME;
const COOP_PASSWORD = process.env.COOP_PASSWORD;
const COOP_ENABLED = process.env.COOP_ENABLED === "true";

let coopTokenCache: {
  token: string;
  expiresAt: number;
} | null = null;

const isCoopConfigured = Boolean(
  COOP_ENABLED && COOP_API_URL && COOP_USERNAME && COOP_PASSWORD,
);

export const isCooperativeConfigured = () => isCoopConfigured;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const cooperativeRequest = async <T>(
  path: string,
  method: CooperativeMethod,
  body?: Record<string, unknown>,
): Promise<T> => {
  if (!isCoopConfigured) {
    throw new Error("CoopHispanica no configurada");
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= COOP_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), COOP_TIMEOUT_MS);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getCooperativeToken()}`,
      };

      if (COOP_API_KEY) {
        headers["x-api-key"] = COOP_API_KEY;
      }

      const response = await fetch(`${COOP_API_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const payload = (await response.json().catch(() => ({}))) as T & {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message || "Error llamando CoopHispanica");
      }

      return payload;
    } catch (error) {
      lastError = error;
      if (attempt < COOP_RETRIES) {
        await delay(300 * (attempt + 1));
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Error llamando CoopHispanica");
};

export const validateMemberCredentials = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  if (!isCoopConfigured) {
    return {
      valid: true,
      active: true,
      memberNumber: `SIM-${email.split("@")[0]}`,
      cooperativeMemberId: `COOP-MEMBER-${Date.now()}`,
      cooperativeStatus: "ACTIVE",
      simulated: true,
    };
  }

  return cooperativeRequest<{
    valid: boolean;
    active: boolean;
    memberNumber?: string;
    cooperativeMemberId?: string;
    cooperativeStatus?: string;
  }>("/members/validate", "POST", { email, password });
};

export const loginCooperative = async () => {
  if (!COOP_API_URL || !COOP_USERNAME || !COOP_PASSWORD) {
    throw new Error("Credenciales de cooperativa no configuradas");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (COOP_API_KEY) {
    headers["x-api-key"] = COOP_API_KEY;
  }

  const response = await fetch(`${COOP_API_URL}/api/Authentication`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      username: COOP_USERNAME,
      password: COOP_PASSWORD,
    }),
  });

  const data = await response.json();

  if (!response.ok || !(data?.data?.jwToken || data?.data?.jwtToken)) {
    throw new Error(data?.message || "No puedes iniciar sesión en cooperativa");
  }

  return data;
};

export const getCooperativeToken = async () => {
  if (coopTokenCache && coopTokenCache.expiresAt > Date.now()) {
    return coopTokenCache.token;
  }

  const login = await loginCooperative();

  const token = login.data.jwToken || login.data.jwtToken;

  coopTokenCache = {
    token,
    expiresAt: Date.now() + 1000 * 60 * 25,
  };

  return token;
};

export const getCooperativeHealth = () => ({
  enabled: isCoopConfigured,
  explicitlyEnabled: COOP_ENABLED,
  hasBaseUrl: Boolean(COOP_API_URL),
  hasApiKey: Boolean(COOP_API_KEY),
  hasCredentials: Boolean(COOP_USERNAME && COOP_PASSWORD),
  mode: isCoopConfigured ? "REAL" : "SIMULATED",
});

export const testCooperativeLogin = async () => {
  if (!isCoopConfigured) {
    return {
      success: true,
      simulated: true,
      message: "CoopHispanica no configurada; login simulado activo",
    };
  }

  const login = await loginCooperative();

  return {
    success: true,
    simulated: false,
    socioId: login.data?.socioId,
    username: login.data?.userName,
    email: login.data?.email,
    hasToken: Boolean(login.data?.jwToken || login.data?.jwtToken),
  };
};

export const findCooperativeMemberByCedula = async (identification: string) =>
  cooperativeRequest<unknown>(
    `/api/Socios/cedula/${encodeURIComponent(identification)}`,
    "GET",
  );

export const createCooperativeMember = async (data: {
  fullName: string;
  email: string;
  phone?: string;
  identification: string;
  role: "CUSTOMER" | "SELLER" | "SERVICE_PROVIDER" | "ADMIN";
}) =>
  cooperativeRequest<unknown>("/api/Socios", "POST", {
    nombreCompleto: data.fullName,
    email: data.email,
    telefonoPrincipal: data.phone,
    identificacion: data.identification,
    tipoRegistro: data.role,
  });

export const getCooperativeMemberDetail = async (socioId: number | string) =>
  cooperativeRequest<unknown>(`/api/Socios/detail/${socioId}`, "GET");

export const getCooperativeMemberEligibility = async (
  socioId: number | string,
) =>
  cooperativeRequest<unknown>(
    `/api/Socios/${socioId}/elegibilidad-prestamo`,
    "GET",
  );

export const getCooperativeLoanTypes = async () =>
  cooperativeRequest<unknown>("/api/v1/TipoPrestamo", "GET");

export const createCooperativeLoanApplication = async (data: {
  socioId: number;
  montoSolicitado: number;
  frecuenciaPago: number;
  cantidadCuotas: number;
  objetivoPrestamo: string;
  tipoPrestamoId: number;
}) =>
  cooperativeRequest<unknown>("/api/v1/SolicitudPrestamo", "POST", data);

export const approveCooperativeLoan = async (data: {
  solicitudPrestamoId: number;
  requiereDesembolso: boolean;
  actualizadoPor: string;
}) =>
  cooperativeRequest<unknown>("/api/v1/AprobacionPrestamo", "POST", data);

export const getCooperativeLoanApplication = async (
  solicitudPrestamoId: number | string,
) =>
  cooperativeRequest<unknown>(
    `/api/v1/SolicitudPrestamo/${solicitudPrestamoId}`,
    "GET",
  );

export const getCooperativeLoanApplicationHistory = async (
  solicitudPrestamoId: number | string,
) =>
  cooperativeRequest<unknown>(
    `/api/v1/HistorialEstadoSolicitudPrestamo/historial/${solicitudPrestamoId}`,
    "GET",
  );

export const payCooperativeLoan = async (data: {
  numeroCuentaPrestamo: string;
  numeroCuentaOrigen: string;
}) =>
  cooperativeRequest<unknown>("/api/v1/Loan/pagar-prestamo", "POST", data);

export const payCooperativeInstallment = async (data: {
  cuentaOrigen: string;
  cuentaPrestamoId: number;
  cuotaId: number;
  montoPagar?: number;
  canal?: string;
}) =>
  cooperativeRequest<unknown>(
    "/api/v1/Loan/pagar-cuota-seleccionada",
    "POST",
    data,
  );

export const getCooperativeLoanGlobalPayments = async (
  prestamoId: number | string,
) =>
  cooperativeRequest<unknown>(
    `/api/v1/Loan/pagos-globales?prestamoId=${prestamoId}`,
    "GET",
  );

export const getCooperativePaymentDetails = async (
  pagoGlobalId: number | string,
) =>
  cooperativeRequest<unknown>(
    `/api/v1/Loan/Detalles-Pagos?pagoGlobalId=${pagoGlobalId}`,
    "GET",
  );

export const getCooperativePaymentsByInstallment = async (
  cuotaPrestamoId: number | string,
) =>
  cooperativeRequest<unknown>(
    `/api/v1/Loan/obtener-pagos-por-cuota?cuotaPrestamoId=${cuotaPrestamoId}`,
    "GET",
  );

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
}) => cooperativeRequest<unknown>("/api/v1/InterBank", "POST", data);

export const getCooperativeInterbankTransactions = async (
  query: Record<string, unknown>,
) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const suffix = params.toString() ? `?${params.toString()}` : "";

  return cooperativeRequest<unknown>(
    `/api/v1/InterBank/Transactions${suffix}`,
    "GET",
  );
};

export const sendLoanApplication = async ({
  financingId,
}: {
  financingId: string;
}) => {
  const financing = await prisma.financing.findUnique({
    where: { id: financingId },
    include: { customer: true, product: true },
  });

  if (!financing) {
    throw new Error("Financiamiento no encontrado");
  }

  if (!isCoopConfigured) {
    return {
      success: true,
      externalLoanId: `COOP-LOAN-${Date.now()}`,
      externalReference: `COOP-REQ-${Date.now()}`,
      status: "SENT_TO_COOPERATIVE",
      message: "Solicitud simulada; configura COOP_API_URL y COOP_API_KEY",
      simulated: true,
    };
  }

  return cooperativeRequest<{
    success: boolean;
    externalLoanId?: string;
    externalReference?: string;
    status: string;
    message?: string;
  }>("/loans/applications", "POST", {
    financingId: financing.id,
    customerId: financing.customerId,
    fullName: financing.customer.fullName,
    email: financing.customer.email,
    phone: financing.phone || financing.customer.phone,
    cedula: financing.cedula,
    income: financing.income,
    company: financing.company,
    productId: financing.productId,
    productTitle: financing.product.title,
    requestedAmount: Number(financing.totalAmount),
    requestedMonths: financing.months,
    currency: financing.currency,
  });
};

export const getLoanStatus = async (externalLoanId: string) => {
  if (!isCoopConfigured) {
    return {
      externalLoanId,
      status: "UNDER_REVIEW",
      simulated: true,
    };
  }

  return cooperativeRequest<{
    externalLoanId: string;
    status: string;
    response?: unknown;
  }>(`/loans/${externalLoanId}/status`, "GET");
};

export const createPaymentLink = async ({
  reference,
  type,
  amount,
  currency = "DOP",
}: {
  reference: string;
  type: "ORDER" | "FINANCING";
  amount: number;
  currency?: string;
}) => {
  if (!isCoopConfigured) {
    return {
      paymentUrl: `${COOP_PAYMENT_URL}/pay?type=${type}&reference=${reference}&amount=${amount}&currency=${currency}`,
      externalPaymentId: `PAY-${Date.now()}`,
      status: "PAYMENT_LINK_CREATED",
      simulated: true,
    };
  }

  return cooperativeRequest<{
    paymentUrl: string;
    externalPaymentId?: string;
    status?: string;
  }>("/payments/link", "POST", {
    reference,
    type,
    amount,
    currency,
  });
};

export const confirmPayment = async (reference: string) => {
  if (!isCoopConfigured) {
    return {
      reference,
      status: "PAYMENT_CONFIRMED",
      externalReference: `CONF-${Date.now()}`,
      confirmedAt: new Date().toISOString(),
      simulated: true,
    };
  }

  return cooperativeRequest<{
    reference: string;
    status: string;
    externalReference?: string;
    confirmedAt?: string;
  }>("/payments/confirm", "POST", { reference });
};

export const getInstallments = async (externalLoanId: string) => {
  if (!isCoopConfigured) {
    return [];
  }

  return cooperativeRequest<
    Array<{
      externalInstallmentId: string;
      number: number;
      amount: number;
      dueDate: string;
      status: string;
      paidAmount?: number;
    }>
  >(`/loans/${externalLoanId}/installments`, "GET");
};

export const syncInstallments = async (financingId: string) => {
  const financing = await prisma.financing.findUnique({
    where: { id: financingId },
  });

  if (!financing?.externalLoanId) {
    return [];
  }

  const installments = await getInstallments(financing.externalLoanId);

  for (const installment of installments) {
    await prisma.installment.upsert({
      where: {
        id: installment.externalInstallmentId,
      },
      update: {
        amount: installment.amount,
        dueDate: new Date(installment.dueDate),
        status: installment.status,
        externalStatus: installment.status,
        paidAmount: installment.paidAmount,
      },
      create: {
        id: installment.externalInstallmentId,
        financingId,
        number: installment.number,
        amount: installment.amount,
        dueDate: new Date(installment.dueDate),
        status: installment.status,
        externalStatus: installment.status,
        externalInstallmentId: installment.externalInstallmentId,
        paidAmount: installment.paidAmount,
      },
    });
  }

  return installments;
};

export const getLoanCounterOffer = async (externalLoanId: string) => {
  if (!isCoopConfigured) {
    return {
      approvedAmount: 0,
      approvedMonths: 0,
      approvedMonthlyPayment: 0,
      status: "NO_COUNTER_OFFER",
      simulated: true,
    };
  }

  return cooperativeRequest<{
    approvedAmount: number;
    approvedMonths: number;
    approvedMonthlyPayment: number;
    status: string;
  }>(`/loans/${externalLoanId}/counter-offer`, "GET");
};

export const verifyBankAccount = async (bankAccount: string) => {
  if (!isCoopConfigured) {
    const isValid = bankAccount.length >= 10;

    return {
      verified: isValid,
      bankAccount,
      message: isValid ? "Cuenta bancaria valida" : "Cuenta bancaria invalida",
      simulated: true,
    };
  }

  return cooperativeRequest<{
    verified: boolean;
    bankAccount: string;
    message?: string;
  }>("/bank-accounts/verify", "POST", { bankAccount });
};

export const getTransactionStatus = async (reference: string) => {
  if (!isCoopConfigured) {
    return {
      reference,
      status: "SUCCESS",
      processedAt: new Date(),
      simulated: true,
    };
  }

  return cooperativeRequest<{
    reference: string;
    status: string;
    processedAt?: string;
  }>(`/transactions/${reference}/status`, "GET");
};
