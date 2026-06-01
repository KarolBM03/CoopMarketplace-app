import prisma from "../../config/prisma";
import { FinancingStatus } from "@prisma/client";
import { createNotification } from "../../services/notification.service";
import { createAuditLog } from "../../services/audit.service";

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

export const createFinancing = async ({
  customerId,
  cedula,
  income,
  company,
  phone,
  address,
  productId,
  downPayment,
  months,
}: FinancingData) => {
  if (!customerId) {
    throw new Error("Cliente requerido");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      seller: true,
    },
  });

  if (!product) {
    throw new Error("Producto no encontrado");
  }

  const price = Number(product.price);
  const remainingDebt = price - downPayment;
  const monthlyPayment = remainingDebt / months;

  const financing = await prisma.financing.create({
    data: {
      customerId,
      cedula,
      income,
      company,
      phone,
      address,
      productId,

      totalAmount: price,
      downPayment,
      remainingDebt,
      months,
      monthlyPayment,

      requestedAmount: remainingDebt,
      requestedMonths: months,
      requestedMonthlyPayment: monthlyPayment,

      status: FinancingStatus.SENT_TO_COOPERATIVE,
      sentToCooperativeAt: new Date(),
      externalStatus: "SENT_TO_COOPERATIVE",
    },
    include: {
      product: true,
      customer: true,
    },
  });

  await createNotification(
    customerId,
    "Solicitud enviada",
    `Tu solicitud de financiamiento para ${product.title} fue enviada a CoopHispánica.`,
  );

  await createNotification(
    product.sellerId,
    "Nueva solicitud de financiamiento",
    `Un cliente solicitó financiamiento para ${product.title}. La solicitud está en evaluación por CoopHispánica.`,
  );

  await createAuditLog({
    userId: customerId,
    action: "FINANCING_SENT_TO_COOPERATIVE",
    entity: "FINANCING",
    entityId: financing.id,
    description: "Solicitud de financiamiento enviada a CoopHispánica",
    metadata: {
      productId,
      downPayment,
      months,
      requestedAmount: remainingDebt,
    },
  });

  return financing;
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
    include: {
      customer: true,
      product: true,
    },
  });

  if (!financing) {
    throw new Error("Financiamiento no encontrado");
  }

  const updatedFinancing = await prisma.financing.update({
    where: { id: financingId },
    data: {
      status: FinancingStatus.WAITING_COOPERATIVE_PAYMENT,
      approvedAt: new Date(),
      externalStatus: "APPROVED_BY_COOPERATIVE",
    },
    include: {
      customer: true,
      product: true,
    },
  });

  await createNotification(
    financing.customerId,
    "Financiamiento aprobado",
    `CoopHispánica aprobó tu solicitud para ${financing.product.title}. Debes completar el pago en la app de CoopHispánica.`,
  );

  await createNotification(
    financing.product.sellerId,
    "Financiamiento aprobado",
    `CoopHispánica aprobó el financiamiento para ${financing.product.title}. Espera la confirmación de pago para preparar el producto.`,
  );

  await createAuditLog({
    userId: actorId,
    action: "COOPERATIVE_APPROVE_FINANCING",
    entity: "FINANCING",
    entityId: financing.id,
    description: "Financiamiento aprobado por CoopHispánica",
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
  reason = "Solicitud rechazada",
) => {
  const financing = await prisma.financing.findUnique({
    where: { id: financingId },
    include: {
      customer: true,
      product: true,
    },
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
    `Tu solicitud de financiamiento para ${financing.product.title} fue rechazada por CoopHispánica.`,
  );

  await createAuditLog({
    userId: actorId,
    action: "COOPERATIVE_REJECT_FINANCING",
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
  counterOffer: any,
  actorId?: string,
) => {
  const financing = await prisma.financing.findUnique({
    where: { id: financingId },
    include: {
      customer: true,
      product: true,
    },
  });

  if (!financing) {
    throw new Error("Financiamiento no encontrado");
  }

  const updatedFinancing = await prisma.financing.update({
    where: { id: financingId },
    data: {
      status: FinancingStatus.COUNTER_OFFER,
      externalStatus: "COUNTER_OFFER",
      counterOffer,
      cooperativeResponse: counterOffer,
    },
    include: {
      customer: true,
      product: true,
    },
  });

  await createNotification(
    financing.customerId,
    "Contraoferta recibida",
    `CoopHispánica envió una contraoferta para ${financing.product.title}.`,
  );

  await createAuditLog({
    userId: actorId,
    action: "COOPERATIVE_COUNTER_OFFER",
    entity: "FINANCING",
    entityId: financing.id,
    description: "Contraoferta enviada por CoopHispánica",
    metadata: counterOffer,
  });

  return updatedFinancing;
};

export const acceptCounterOffer = async (
  financingId: string,
  customerId: string,
) => {
  const financing = await prisma.financing.findUnique({
    where: { id: financingId },
    include: {
      product: true,
    },
  });

  if (!financing) {
    throw new Error("Financiamiento no encontrado");
  }

  if (financing.customerId !== customerId) {
    throw new Error("No puedes aceptar esta contraoferta");
  }

  if (financing.status !== FinancingStatus.COUNTER_OFFER) {
    throw new Error("Este financiamiento no tiene contraoferta pendiente");
  }

  const updatedFinancing = await prisma.financing.update({
    where: { id: financingId },
    data: {
      status: FinancingStatus.CUSTOMER_ACCEPTED,
      customerAcceptedAt: new Date(),
      externalStatus: "CUSTOMER_ACCEPTED",
    },
    include: {
      product: true,
    },
  });

  await createNotification(
    financing.product.sellerId,
    "Contraoferta aceptada",
    "El cliente aceptó la contraoferta de CoopHispánica.",
  );

  return updatedFinancing;
};

export const getCooperativePaymentLink = async (
  financingId: string,
  customerId: string,
) => {
  const financing = await prisma.financing.findUnique({
    where: { id: financingId },
    include: {
      product: true,
    },
  });

  if (!financing) {
    throw new Error("Financiamiento no encontrado");
  }

  if (financing.customerId !== customerId) {
    throw new Error("No puedes pagar este financiamiento");
  }

  if (
    financing.status !== FinancingStatus.WAITING_COOPERATIVE_PAYMENT &&
    financing.status !== FinancingStatus.CUSTOMER_ACCEPTED
  ) {
    throw new Error("Este financiamiento no está listo para pago");
  }

  return {
    message: "Completa el pago en CoopHispánica",
    paymentUrl: process.env.COOP_PAYMENT_URL || "https://app.coophispanica.com",
    financingId: financing.id,
  };
};

export const confirmCooperativePayment = async (
  financingId: string,
  externalReference?: string,
  cooperativeResponse?: any,
) => {
  const financing = await prisma.financing.findUnique({
    where: { id: financingId },
    include: {
      customer: true,
      product: true,
    },
  });

  if (!financing) {
    throw new Error("Financiamiento no encontrado");
  }

  if (financing.status === FinancingStatus.ACTIVE) {
    return financing;
  }

  const updatedFinancing = await prisma.financing.update({
    where: { id: financingId },
    data: {
      status: FinancingStatus.ACTIVE,
      activatedAt: new Date(),
      externalStatus: "PAYMENT_CONFIRMED",
      externalReference,
      cooperativeResponse,
    },
    include: {
      customer: true,
      product: true,
      installments: {
        orderBy: {
          number: "asc",
        },
      },
    },
  });

  await createNotification(
    financing.customerId,
    "Pago confirmado",
    `CoopHispánica confirmó tu pago para ${financing.product.title}.`,
  );

  await createNotification(
    financing.product.sellerId,
    "Orden lista para preparar",
    `El pago de ${financing.customer.fullName} fue confirmado. Ya puedes preparar y enviar ${financing.product.title}.`,
  );

  await createAuditLog({
    userId: financing.customerId,
    action: "COOPERATIVE_PAYMENT_CONFIRMED",
    entity: "FINANCING",
    entityId: financing.id,
    description: "Pago confirmado por CoopHispánica",
    metadata: {
      externalReference,
      cooperativeResponse,
    },
  });

  return updatedFinancing;
};
