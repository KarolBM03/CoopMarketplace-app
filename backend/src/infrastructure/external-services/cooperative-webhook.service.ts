import { FinancingStatus, OrderStatus } from "@prisma/client";
import prisma from "../database/prisma";
import { createNotification } from "./notification.service";
import { createAuditLog } from "./audit.service";

const findFinancingByExternalLoan = async (externalLoanId?: string) => {
  if (!externalLoanId) return null;

  return await prisma.financing.findFirst({
    where: {
      OR: [
        { externalLoanId },
        { externalReference: externalLoanId },
      ],
    },
    include: {
      product: true,
      customer: true,
    },
  });
};

const updateFinancingFromCoop = async ({
  externalLoanId,
  status,
  externalStatus,
  data,
}: {
  externalLoanId?: string;
  status: FinancingStatus;
  externalStatus: string;
  data?: Record<string, any>;
}) => {
  const financing = await findFinancingByExternalLoan(externalLoanId);

  if (!financing) return null;

  return await prisma.financing.update({
    where: { id: financing.id },
    data: {
      status,
      externalStatus,
      cooperativeResponse: data as any,
      approvedAt:
        status === FinancingStatus.APPROVED_BY_COOPERATIVE
          ? new Date()
          : financing.approvedAt,
      rejectedAt: status === FinancingStatus.REJECTED ? new Date() : null,
      rejectionReason:
        status === FinancingStatus.REJECTED
          ? data?.reason || data?.message || "Solicitud rechazada"
          : financing.rejectionReason,
      activatedAt: status === FinancingStatus.ACTIVE ? new Date() : financing.activatedAt,
      approvedAmount: data?.approvedAmount ?? financing.approvedAmount,
      approvedMonths: data?.approvedMonths ?? financing.approvedMonths,
      approvedMonthlyPayment:
        data?.approvedMonthlyPayment ?? financing.approvedMonthlyPayment,
    },
    include: {
      product: true,
      customer: true,
      installments: { orderBy: { number: "asc" } },
    },
  });
};

const createOrderAfterDownPayment = async (externalLoanId?: string, payload?: any) => {
  const financing = await findFinancingByExternalLoan(externalLoanId);

  if (!financing) return null;

  const existingOrder = await prisma.order.findFirst({
    where: {
      externalReference: externalLoanId,
    },
  });

  if (existingOrder) return existingOrder;

  return await prisma.order.create({
    data: {
      customerId: financing.customerId,
      totalAmount: financing.totalAmount,
      currency: financing.currency,
      status: OrderStatus.PAID,
      externalPaymentId: payload?.externalPaymentId || payload?.paymentId,
      externalReference: externalLoanId,
      externalStatus: "DOWN_PAYMENT_PAID",
      cooperativeResponse: payload,
      items: {
        create: {
          productId: financing.productId,
          quantity: 1,
          price: Number(financing.totalAmount),
        },
      },
    },
  });
};

export const processCooperativeEvent = async (payload: any) => {
  const externalLoanId =
    payload.externalLoanId ||
    payload.solicitudPrestamoId ||
    payload.loanId ||
    payload.externalReference;

  switch (payload.event) {
    case "loan.approved": {
      const financing = await updateFinancingFromCoop({
        externalLoanId,
        status: FinancingStatus.APPROVED_BY_COOPERATIVE,
        externalStatus: "APPROVED_BY_COOPERATIVE",
        data: payload,
      });

      if (financing) {
        await createNotification(
          financing.customerId,
          "Solicitud aprobada por CoopHispanica",
          `CoopHispanica aprobo tu solicitud para ${financing.product.title}. Ellos te enviaran el contrato.`,
        );
      }
      break;
    }

    case "contract.sent": {
      const financing = await updateFinancingFromCoop({
        externalLoanId,
        status: FinancingStatus.APPROVED_BY_COOPERATIVE,
        externalStatus: "CONTRACT_SENT",
        data: payload,
      });

      if (financing) {
        await createNotification(
          financing.customerId,
          "Contrato enviado por CoopHispanica",
          `CoopHispanica te enviara o ya te envio el contrato para ${financing.product.title}.`,
        );
      }
      break;
    }

    case "contract.signed": {
      const financing = await updateFinancingFromCoop({
        externalLoanId,
        status: FinancingStatus.WAITING_COOPERATIVE_PAYMENT,
        externalStatus: "CONTRACT_SIGNED",
        data: payload,
      });

      if (financing) {
        await createNotification(
          financing.customerId,
          "Contrato firmado",
          `CoopHispanica confirmo la firma del contrato para ${financing.product.title}. Falta el pago inicial.`,
        );
      }
      break;
    }

    case "down_payment.paid": {
      const financing = await updateFinancingFromCoop({
        externalLoanId,
        status: FinancingStatus.ACTIVE,
        externalStatus: "DOWN_PAYMENT_PAID",
        data: payload,
      });

      const order = await createOrderAfterDownPayment(externalLoanId, payload);

      if (financing) {
        await createNotification(
          financing.customerId,
          "Inicial pagado",
          `CoopHispanica confirmo el pago inicial. Tu compra de ${financing.product.title} esta activa.`,
        );
        await createNotification(
          financing.product.sellerId,
          "Orden financiada lista",
          `CoopHispanica confirmo el pago inicial de ${financing.product.title}. Puedes preparar el envio.`,
        );
        await createAuditLog({
          userId: financing.customerId,
          action: "COOP_DOWN_PAYMENT_PAID",
          entity: "FINANCING",
          entityId: financing.id,
          description: "CoopHispanica confirmo inicial y CoopMarket creo la orden pagada",
          metadata: { payload, orderId: order?.id },
        });
      }
      break;
    }

    case "loan.rejected": {
      const financing = await updateFinancingFromCoop({
        externalLoanId,
        status: FinancingStatus.REJECTED,
        externalStatus: "REJECTED_BY_COOPERATIVE",
        data: payload,
      });

      if (financing) {
        await createNotification(
          financing.customerId,
          "Solicitud rechazada",
          payload.reason || "CoopHispanica rechazo tu solicitud de financiamiento.",
        );
      }
      break;
    }

    case "installment.paid":
      await updateFinancingFromCoop({
        externalLoanId,
        status: FinancingStatus.ACTIVE,
        externalStatus: "INSTALLMENT_PAID",
        data: payload,
      });
      break;

    case "loan.overdue":
      await updateFinancingFromCoop({
        externalLoanId,
        status: FinancingStatus.LATE,
        externalStatus: "LOAN_OVERDUE",
        data: payload,
      });
      break;

    case "loan.completed":
      await updateFinancingFromCoop({
        externalLoanId,
        status: FinancingStatus.COMPLETED,
        externalStatus: "LOAN_COMPLETED",
        data: payload,
      });
      break;

    case "service.paid":
      await prisma.serviceRequest.updateMany({
        where: {
          id: payload.serviceRequestId,
        },
        data: {
          status: "ASSIGNED",
          amount: payload.amount,
          providerExternalId: payload.providerExternalId,
          providerName: payload.providerName,
          cooperativeResponse: payload,
        },
      });
      break;

    case "service.completed":
      await prisma.serviceRequest.updateMany({
        where: {
          id: payload.serviceRequestId,
        },
        data: {
          status: "COMPLETED",
          cooperativeResponse: payload,
        },
      });
      break;

    default:
      break;
  }
};

export const simulateCooperativeEventForFinancing = async ({
  financingId,
  event,
}: {
  financingId: string;
  event: string;
}) => {
  const financing = await prisma.financing.findUnique({
    where: { id: financingId },
  });

  if (!financing) {
    throw new Error("Financiamiento no encontrado");
  }

  const externalLoanId =
    financing.externalLoanId || financing.externalReference || financing.id;

  const payload = {
    event,
    externalLoanId,
    approvedAmount: Number(financing.totalAmount),
    approvedMonths: financing.months,
    approvedMonthlyPayment: Number(financing.monthlyPayment),
    simulated: true,
    simulatedAt: new Date().toISOString(),
  };

  await processCooperativeEvent(payload);

  return payload;
};
