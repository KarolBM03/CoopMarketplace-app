import { ServiceCategory, ServiceRequestStatus } from "@prisma/client";
import prisma from "../../../infrastructure/database/prisma";

export class CreateServiceRequestUseCase {
  async execute(data: {
    customerId: string;
    orderId?: string;
    category: ServiceCategory;
    title: string;
    description: string;
    pickupAddress?: string;
    deliveryAddress?: string;
    city?: string;
    province?: string;
    photoUrl?: string;
    amount?: number;
  }) {
    if (!data.customerId) {
      throw new Error("No encontré el cliente");
    }

    if (!data.title?.trim()) {
      throw new Error("Ponle un título al servicio");
    }

    if (!data.description?.trim()) {
      throw new Error("Explica qué necesitas");
    }

    if (!Object.values(ServiceCategory).includes(data.category)) {
      throw new Error("Ese tipo de servicio no es válido");
    }

    return await prisma.serviceRequest.create({
      data: {
        customerId: data.customerId,
        orderId: data.orderId,
        category: data.category,
        title: data.title.trim(),
        description: data.description.trim(),
        pickupAddress: data.pickupAddress?.trim(),
        deliveryAddress: data.deliveryAddress?.trim(),
        city: data.city?.trim(),
        province: data.province?.trim(),
        photoUrl: data.photoUrl?.trim(),
        amount: data.amount,
        status: ServiceRequestStatus.PENDING,
      },
    });
  }
}

export class GetMyServiceRequestsUseCase {
  async execute(customerId: string) {
    return await prisma.serviceRequest.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });
  }
}

export class GetAdminServiceRequestsUseCase {
  async execute() {
    return await prisma.serviceRequest.findMany({
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        order: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

export class UpdateServiceRequestStatusUseCase {
  async execute(data: {
    requestId: string;
    status: ServiceRequestStatus;
    providerExternalId?: string;
    providerName?: string;
    amount?: number;
  }) {
    if (!Object.values(ServiceRequestStatus).includes(data.status)) {
      throw new Error("Ese estado no es válido");
    }

    return await prisma.serviceRequest.update({
      where: { id: data.requestId },
      data: {
        status: data.status,
        providerExternalId: data.providerExternalId,
        providerName: data.providerName,
        amount: data.amount,
      },
    });
  }
}
