import prisma from "../../config/prisma";

interface LoanApplicationData {
  loanId: string;
}

interface DisburseLoanData {
  loanId: string;
  bankAccount: string;
}

type CooperativeMethod = "GET" | "POST";

const COOPERATIVE_BASE_URL = process.env.COOPERATIVE_BASE_URL;
const COOPERATIVE_API_KEY = process.env.COOPERATIVE_API_KEY;
const COOPERATIVE_TIMEOUT_MS = Number(process.env.COOPERATIVE_TIMEOUT_MS || 10000);
const COOPERATIVE_RETRIES = Number(process.env.COOPERATIVE_RETRIES || 2);

const isCooperativeConfigured = Boolean(COOPERATIVE_BASE_URL && COOPERATIVE_API_KEY);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const cooperativeRequest = async <T>(
  path: string,
  method: CooperativeMethod,
  body?: Record<string, unknown>,
): Promise<T> => {
  if (!isCooperativeConfigured) {
    throw new Error("Cooperativa no configurada");
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= COOPERATIVE_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), COOPERATIVE_TIMEOUT_MS);

    try {
      const response = await fetch(`${COOPERATIVE_BASE_URL}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${COOPERATIVE_API_KEY}`,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const payload = (await response.json().catch(() => ({}))) as T & {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message || "Error llamando cooperativa");
      }

      return payload;
    } catch (error) {
      lastError = error;

      if (attempt < COOPERATIVE_RETRIES) {
        await delay(300 * (attempt + 1));
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Error llamando cooperativa");
};

export const sendLoanApplication = async ({ loanId }: LoanApplicationData) => {
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: { user: true },
  });

  if (!loan) {
    throw new Error("Prestamo no encontrado");
  }

  if (!isCooperativeConfigured) {
    const simulatedResponse = {
      success: true,
      cooperativeReference: `COOP-${Date.now()}`,
      status: "PENDING",
      message: "Solicitud simulada; configura COOPERATIVE_BASE_URL y COOPERATIVE_API_KEY",
    };

    await prisma.loan.update({
      where: { id: loan.id },
      data: {
        externalLoanId: simulatedResponse.cooperativeReference,
        externalReference: simulatedResponse.cooperativeReference,
        externalStatus: simulatedResponse.status,
        cooperativeResponse: simulatedResponse,
      },
    });

    return simulatedResponse;
  }

  const response = await cooperativeRequest<{
    success: boolean;
    cooperativeReference?: string;
    externalLoanId?: string;
    status: string;
    message?: string;
  }>("/loans/applications", "POST", {
    loanId: loan.id,
    userId: loan.userId,
    fullName: loan.user.fullName,
    email: loan.user.email,
    amount: loan.amount,
    months: loan.months,
    income: loan.income,
    company: loan.company,
    documentId: loan.documentId,
  });

  await prisma.loan.update({
    where: { id: loan.id },
    data: {
      externalLoanId: response.externalLoanId || response.cooperativeReference,
      externalReference: response.cooperativeReference,
      externalStatus: response.status,
      cooperativeResponse: response,
    },
  });

  return response;
};

export const disburseLoan = async ({ loanId, bankAccount }: DisburseLoanData) => {
  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  const financing = !loan
    ? await prisma.financing.findUnique({ where: { id: loanId } })
    : null;

  if (!loan && !financing) {
    throw new Error("Prestamo o financiamiento no encontrado");
  }

  if (!isCooperativeConfigured) {
    return {
      success: true,
      transactionReference: `DISB-${Date.now()}`,
      status: "PROCESSING",
      bankAccount,
      simulated: true,
    };
  }

  return await cooperativeRequest<{
    success: boolean;
    transactionReference: string;
    status: string;
    bankAccount: string;
  }>("/loans/disburse", "POST", {
    loanId,
    bankAccount,
  });
};

export const verifyBankAccount = async (bankAccount: string) => {
  if (!isCooperativeConfigured) {
    const isValid = bankAccount.length >= 10;

    return {
      verified: isValid,
      bankAccount,
      message: isValid ? "Cuenta bancaria valida" : "Cuenta bancaria invalida",
      simulated: true,
    };
  }

  return await cooperativeRequest<{
    verified: boolean;
    bankAccount: string;
    message?: string;
  }>("/bank-accounts/verify", "POST", { bankAccount });
};

export const getTransactionStatus = async (reference: string) => {
  if (!isCooperativeConfigured) {
    return {
      reference,
      status: "SUCCESS",
      processedAt: new Date(),
      simulated: true,
    };
  }

  return await cooperativeRequest<{
    reference: string;
    status: string;
    processedAt?: string;
  }>(`/transactions/${reference}/status`, "GET");
};

