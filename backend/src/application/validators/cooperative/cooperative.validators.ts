import { z } from "zod";

const optionalText = z.string().trim().optional();
const requiredText = z.string().trim().min(1, "Campo requerido");
const positiveNumber = z.coerce.number().positive("Debe ser mayor que 0");
const positiveInt = z.coerce.number().int().positive("Debe ser mayor que 0");

export const createCooperativeLoanApplicationSchema = z.object({
  socioId: positiveInt,
  montoSolicitado: positiveNumber,
  frecuenciaPago: positiveInt,
  cantidadCuotas: positiveInt,
  objetivoPrestamo: requiredText,
  tipoPrestamoId: positiveInt,
});

export const approveCooperativeLoanSchema = z.object({
  solicitudPrestamoId: positiveInt,
  requiereDesembolso: z.boolean(),
  actualizadoPor: requiredText,
});

export const payCooperativeLoanSchema = z.object({
  numeroCuentaPrestamo: requiredText,
  numeroCuentaOrigen: requiredText,
});

export const payCooperativeInstallmentSchema = z.object({
  cuentaOrigen: requiredText,
  cuentaPrestamoId: positiveInt,
  cuotaId: positiveInt,
  montoPagar: positiveNumber.optional(),
  canal: optionalText,
});

export const createInterbankTransactionSchema = z.object({
  name: optionalText,
  description: optionalText,
  amount: positiveNumber,
  noAccountCoop: optionalText,
  identification: optionalText,
  nameAccountBank: optionalText,
  noAccountBank: optionalText,
  noAccountCoopAdmin: optionalText,
  accountBankId: requiredText,
  transferetionTypeId: requiredText,
  socioId: positiveInt,
  accountType: optionalText,
});

export const simulateCooperativeEventSchema = z.object({
  event: z.enum([
    "loan.approved",
    "loan.rejected",
    "contract.sent",
    "contract.signed",
    "down_payment.paid",
    "installment.paid",
    "loan.overdue",
    "loan.completed",
  ]),
});

export const cooperativeWebhookSchema = z.object({
  event: z.enum([
    "loan.approved",
    "loan.rejected",
    "contract.sent",
    "contract.signed",
    "down_payment.paid",
    "installment.paid",
    "loan.overdue",
    "loan.completed",
    "service.paid",
    "service.completed",
  ]),
  eventId: optionalText,
  externalLoanId: optionalText,
  solicitudPrestamoId: z.union([z.string(), z.number()]).optional(),
  loanId: optionalText,
  externalReference: optionalText,
  externalServiceId: optionalText,
  externalPaymentId: optionalText,
  serviceRequestId: optionalText,
  amount: z.coerce.number().optional(),
  approvedAmount: z.coerce.number().optional(),
  approvedMonths: z.coerce.number().int().positive().optional(),
  approvedMonthlyPayment: z.coerce.number().optional(),
  providerExternalId: optionalText,
  providerName: optionalText,
  reason: optionalText,
  message: optionalText,
}).passthrough();
