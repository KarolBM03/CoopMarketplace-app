import prisma from "../../config/prisma";
import { FinancingStatus } from "@prisma/client";
import { createNotification } from "../../services/notification.service";
import { createAuditLog } from "../../services/audit.service";
import {
  createPaymentLink,
  sendLoanApplication,
} from "../cooperative/cooperative.service";

interface FinancingData {
  customerId: string;
  cedula?: string;
  income?: number;
  company?: string;
  phone?: string;
  address?: string;
  productId: string;
  downPayment?: number;
  months: number;
  currency?: string;
}

export const createFinancing = async ({
  customerId,
  cedula,
  income,
  company,
  phone,
  address,
  productId,
  months,
  currency = "DOP",
}: FinancingData) => {
  if (!customerId) {
    throw new Error("Cliente requerido");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { seller: true },
  });

  if (!product || !product.isActive) {
    throw new Error("Producto no encontrado");
  }

  const totalAmount = Number(product.price);
  const monthlyPayment = totalAmount / months;

  const financing = await prisma.financing.create({
    data: {
      customerId,
      cedula,
      income,
      company,
      phone,
      address,
      productId,
      totalAmount,
      downPayment: 0,
      remainingDebt: totalAmount,
      months,
      monthlyPayment,
      currency,
      requestedAmount: totalAmount,
      requestedMonths: months,
      requestedMonthlyPayment: monthlyPayment,
      status: FinancingStatus.SENT_TO_COOPERATIVE,
      sentToCooperativeAt: new Date(),
      externalStatus: "SENT_TO_COOPERATIVE",
    },
    include: {
      customer: true,
      product: true,
    },
  });

  const cooperativeResponse = await sendLoanApplication({
    financingId: financing.id,
  });

  const updatedFinancing = await prisma.financing.update({
    where: { id: financing.id },
    data: {
      externalLoanId: cooperativeResponse.externalLoanId,
      externalReference: cooperativeResponse.externalReference,
      externalStatus: cooperativeResponse.status || "SENT_TO_COOPERATIVE",
      cooperativeResponse,
    },
    include: {
      customer: true,
      product: true,
      installments: {
        orderBy: { number: "asc" },
      },
    },
  });

  await createNotification(
    customerId,
    "Solicitud enviada a CoopHispanica",
    `Tu solicitud para ${product.title} fue enviada a CoopHispanica.`,
  );

  await createNotification(
    product.sellerId,
    "Solicitud de financiamiento recibida",
    `CoopHispanica esta evaluando una solicitud para ${product.title}.`,
  );

  await createAuditLog({
    userId: customerId,
    action: "FINANCING_SENT_TO_COOP",
    entity: "FINANCING",
    entityId: financing.id,
    description: "Solicitud de financiamiento enviada a CoopHispanica",
    metadata: { productId, months, cooperativeResponse },
  });

  return updatedFinancing;
};

export const getCustomerFinancing = async (customerId: string) => {
  return await prisma.financing.findMany({
    where: {
      customerId,
    },
    include: {
      product: true,
      installments: {
        orderBy: {
          number: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getAdminFinancings = async (page = 1, limit = 10) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 50);
  const skip = (safePage - 1) * safeLimit;

  const [financings, total] = await Promise.all([
    prisma.financing.findMany({
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            imageUrl: true,
            sellerId: true,
          },
        },
        installments: {
          orderBy: {
            number: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: safeLimit,
    }),
    prisma.financing.count(),
  ]);

  return {
    financings,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
};

export const approveByCooperative = async (
  financingId: string,
  actorId?: string,
) => {
  const financing = await prisma.financing.findUnique({
    where: { id: financingId },
    include: { customer: true, product: true },
  });

  if (!financing) {
    throw new Error("Financiamiento no encontrado");
  }

  const approvableStatuses: FinancingStatus[] = [
      FinancingStatus.SENT_TO_COOPERATIVE,
      FinancingStatus.UNDER_REVIEW,
      FinancingStatus.PENDING,
  ];

  if (!approvableStatuses.includes(financing.status)) {
    throw new Error("Esta solicitud no puede aprobarse en su estado actual");
  }

  const updatedFinancing = await prisma.financing.update({
    where: { id: financing.id },
    data: {
      status: FinancingStatus.WAITING_COOPERATIVE_PAYMENT,
      approvedAt: new Date(),
      externalStatus: "APPROVED_BY_COOPERATIVE",
      approvedAmount: Number(financing.totalAmount),
      approvedMonths: financing.months,
      approvedMonthlyPayment: Number(financing.monthlyPayment),
    },
    include: {
      customer: true,
      product: true,
      installments: { orderBy: { number: "asc" } },
    },
  });

  await createNotification(
    financing.customerId,
    "Financiamiento aprobado",
    `CoopHispanica aprobo tu solicitud para ${financing.product.title}. Ya puedes pagar en CoopHispanica.`,
  );

  await createNotification(
    financing.product.sellerId,
    "Financiamiento aprobado por CoopHispanica",
    `CoopHispanica aprobo una solicitud para ${financing.product.title}. Espera confirmacion de pago.`,
  );

  await createAuditLog({
    userId: actorId,
    action: "COOP_APPROVE_FINANCING",
    entity: "FINANCING",
    entityId: financing.id,
    description: "Financiamiento aprobado por CoopHispanica",
    metadata: {
      previousStatus: financing.status,
      nextStatus: updatedFinancing.status,
    },
  });

  return updatedFinancing;
};

export const rejectFinancing = async (
  financingId: string,
  actorId?: string,
  reason = "Solicitud rechazada por CoopHispanica",
) => {
  const financing = await prisma.financing.findUnique({
    where: { id: financingId },
    include: { customer: true, product: true },
  });

  if (!financing) {
    throw new Error("Financiamiento no encontrado");
  }

  const updatedFinancing = await prisma.financing.update({
    where: { id: financingId },
    data: {
      status: FinancingStatus.REJECTED,
      rejectedAt: new Date(),
      rejectionReason: reason,
      externalStatus: "REJECTED_BY_COOPERATIVE",
    },
    include: {
      customer: true,
      product: true,
    },
  });

  await createNotification(
    financing.customerId,
    "Financiamiento rechazado",
    `Tu solicitud de financiamiento para ${financing.product.title} fue rechazada por CoopHispanica.`,
  );

  await createAuditLog({
    userId: actorId,
    action: "COOP_REJECT_FINANCING",
    entity: "FINANCING",
    entityId: financing.id,
    description: reason,
    metadata: {
      previousStatus: financing.status,
      nextStatus: updatedFinancing.status,
    },
  });

  return updatedFinancing;
};

export const createCounterOffer = async (
  financingId: string,
  counterOffer: {
    approvedAmount?: number;
    approvedMonths?: number;
    approvedMonthlyPayment?: number;
    message?: string;
  },
  actorId?: string,
) => {
  const financing = await prisma.financing.findUnique({
    where: { id: financingId },
    include: { product: true },
  });

  if (!financing) {
    throw new Error("Financiamiento no encontrado");
  }

  const updatedFinancing = await prisma.financing.update({
    where: { id: financingId },
    data: {
      status: FinancingStatus.COUNTER_OFFER,
      counterOffer,
      cooperativeResponse: counterOffer,
      approvedAmount: counterOffer.approvedAmount,
      approvedMonths: counterOffer.approvedMonths,
      approvedMonthlyPayment: counterOffer.approvedMonthlyPayment,
      externalStatus: "COUNTER_OFFER",
    },
    include: { product: true, customer: true },
  });

  await createNotification(
    financing.customerId,
    "Contraoferta recibida",
    `CoopHispanica envio una contraoferta para ${financing.product.title}.`,
  );

  await createAuditLog({
    userId: actorId,
    action: "COOP_COUNTER_OFFER",
    entity: "FINANCING",
    entityId: financing.id,
    description: "Contraoferta creada por CoopHispanica",
    metadata: counterOffer,
  });

  return updatedFinancing;
};

export const acceptCounterOffer = async (
  financingId: string,
  actorId?: string,
) => {
  const financing = await prisma.financing.findUnique({
    where: { id: financingId },
    include: { product: true },
  });

  if (!financing) {
    throw new Error("Financiamiento no encontrado");
  }

  if (actorId && actorId !== financing.customerId) {
    const actor = await prisma.user.findUnique({ where: { id: actorId } });

    if (actor?.role !== "ADMIN") {
      throw new Error("No puedes aceptar esta contraoferta");
    }
  }

  if (financing.status !== FinancingStatus.COUNTER_OFFER) {
    throw new Error("Este financiamiento no tiene una contraoferta pendiente");
  }

  const updatedFinancing = await prisma.financing.update({
    where: { id: financingId },
    data: {
      status: FinancingStatus.CUSTOMER_ACCEPTED,
      customerAcceptedAt: new Date(),
      externalStatus: "CUSTOMER_ACCEPTED",
    },
    include: { product: true, installments: { orderBy: { number: "asc" } } },
  });

  await createNotification(
    financing.product.sellerId,
    "Contraoferta aceptada",
    `El cliente acepto la contraoferta de CoopHispanica para ${financing.product.title}.`,
  );

  await createAuditLog({
    userId: actorId || financing.customerId,
    action: "CUSTOMER_ACCEPT_COUNTER_OFFER",
    entity: "FINANCING",
    entityId: financing.id,
    description: "Cliente acepto contraoferta de CoopHispanica",
  });

  return updatedFinancing;
};

export const getCooperativePaymentLink = async (financingId: string) => {
  const financing = await prisma.financing.findUnique({
    where: { id: financingId },
    include: { product: true },
  });

  if (!financing) {
    throw new Error("Financiamiento no encontrado");
  }

  const payableStatuses: FinancingStatus[] = [
      FinancingStatus.WAITING_COOPERATIVE_PAYMENT,
      FinancingStatus.CUSTOMER_ACCEPTED,
      FinancingStatus.APPROVED_BY_COOPERATIVE,
  ];

  if (!payableStatuses.includes(financing.status)) {
    throw new Error("Este financiamiento no esta listo para pago");
  }

  const amount = Number(financing.approvedAmount || financing.totalAmount);

  const result = await createPaymentLink({
    reference: financing.id,
    type: "FINANCING",
    amount,
    currency: financing.currency,
  });

  await prisma.financing.update({
    where: { id: financing.id },
    data: {
      externalReference: result.externalPaymentId || financing.externalReference,
      externalStatus: result.status || "PAYMENT_LINK_CREATED",
    },
  });

  return result;
};

export const confirmCooperativePayment = async ({
  financingId,
  externalReference,
  cooperativeResponse,
}: {
  financingId: string;
  externalReference?: string;
  cooperativeResponse?: unknown;
}) => {
  const financing = await prisma.financing.findUnique({
    where: { id: financingId },
    include: { customer: true, product: true },
  });

  if (!financing) {
    throw new Error("Financiamiento no encontrado");
  }

  if (financing.status === FinancingStatus.ACTIVE) {
    return financing;
  }

  const updatedFinancing = await prisma.financing.update({
    where: { id: financing.id },
    data: {
      status: FinancingStatus.ACTIVE,
      activatedAt: new Date(),
      externalStatus: "PAYMENT_CONFIRMED",
      externalReference,
      cooperativeResponse: cooperativeResponse as any,
    },
    include: {
      customer: true,
      product: true,
      installments: { orderBy: { number: "asc" } },
    },
  });

  await createNotification(
    financing.customerId,
    "Pago confirmado por CoopHispanica",
    `Tu financiamiento para ${financing.product.title} esta activo.`,
  );

  await createNotification(
    financing.product.sellerId,
    "Financiamiento activo",
    `El pago de CoopHispanica fue confirmado. Puedes preparar y enviar ${financing.product.title}.`,
  );

  await createAuditLog({
    userId: financing.customerId,
    action: "COOP_PAYMENT_CONFIRMED",
    entity: "FINANCING",
    entityId: financing.id,
    description: "Pago confirmado por CoopHispanica y financiamiento activado",
    metadata: { externalReference, cooperativeResponse } as any,
  });

  return updatedFinancing;
};
