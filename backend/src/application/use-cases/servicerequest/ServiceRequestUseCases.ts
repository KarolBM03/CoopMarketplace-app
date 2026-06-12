import { ServiceCategory, ServiceRequestStatus } from "@prisma/client";
import prisma from "../../../infrastructure/database/prisma";

const providerSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
  storeName: true,
  mainCategory: true,
  city: true,
};

const serviceOfferingInclude = {
  provider: {
    select: providerSelect,
  },
};

export class CreateServiceOfferingUseCase {
  async execute(data: {
    providerId: string;
    category: ServiceCategory;
    name: string;
    description: string;
    estimatedTime?: string;
    estimatedPrice?: number;
    imageUrl?: string;
    city?: string;
  }) {
    if (!data.providerId) {
      throw new Error("No encontre el proveedor");
    }

    if (!Object.values(ServiceCategory).includes(data.category)) {
      throw new Error("Ese tipo de servicio no es valido");
    }

    if (!data.name?.trim()) {
      throw new Error("Ponle un nombre al servicio");
    }

    if (!data.description?.trim()) {
      throw new Error("Explica que ofrece este servicio");
    }

    return await prisma.serviceOffering.create({
      data: {
        providerId: data.providerId,
        category: data.category,
        name: data.name.trim(),
        description: data.description.trim(),
        estimatedTime: data.estimatedTime?.trim(),
        estimatedPrice: data.estimatedPrice,
        imageUrl: data.imageUrl?.trim(),
        city: data.city?.trim(),
      },
      include: serviceOfferingInclude,
    });
  }
}

export class GetActiveServiceOfferingsUseCase {
  async execute() {
    return await prisma.serviceOffering.findMany({
      where: { isActive: true },
      include: serviceOfferingInclude,
      orderBy: { createdAt: "desc" },
    });
  }
}

export class GetProviderServiceOfferingsUseCase {
  async execute(providerId: string) {
    return await prisma.serviceOffering.findMany({
      where: { providerId },
      include: serviceOfferingInclude,
      orderBy: { createdAt: "desc" },
    });
  }
}

export class UpdateServiceOfferingUseCase {
  async execute(data: {
    offeringId: string;
    providerId: string;
    isAdmin?: boolean;
    category?: ServiceCategory;
    name?: string;
    description?: string;
    estimatedTime?: string;
    estimatedPrice?: number;
    imageUrl?: string;
    city?: string;
    isActive?: boolean;
  }) {
    const offering = await prisma.serviceOffering.findUnique({
      where: { id: data.offeringId },
    });

    if (!offering) {
      throw new Error("Servicio no encontrado");
    }

    if (!data.isAdmin && offering.providerId !== data.providerId) {
      throw new Error("No puedes modificar este servicio");
    }

    if (data.category && !Object.values(ServiceCategory).includes(data.category)) {
      throw new Error("Ese tipo de servicio no es valido");
    }

    return await prisma.serviceOffering.update({
      where: { id: data.offeringId },
      data: {
        category: data.category,
        name: data.name?.trim(),
        description: data.description?.trim(),
        estimatedTime: data.estimatedTime?.trim(),
        estimatedPrice: data.estimatedPrice,
        imageUrl: data.imageUrl?.trim(),
        city: data.city?.trim(),
        isActive: data.isActive,
      },
      include: serviceOfferingInclude,
    });
  }
}

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
    serviceOfferingId?: string;
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

    let offering:
      | {
          id: string;
          providerId: string;
          category: ServiceCategory;
          name: string;
          isActive: boolean;
        }
      | null = null;

    if (data.serviceOfferingId) {
      offering = await prisma.serviceOffering.findUnique({
        where: { id: data.serviceOfferingId },
        select: {
          id: true,
          providerId: true,
          category: true,
          name: true,
          isActive: true,
        },
      });

      if (!offering || !offering.isActive) {
        throw new Error("Ese servicio no esta disponible");
      }
    }

    return await prisma.serviceRequest.create({
      data: {
        customerId: data.customerId,
        orderId: data.orderId,
        serviceOfferingId: offering?.id,
        category: offering?.category || data.category,
        title: offering?.name || data.title.trim(),
        description: data.description.trim(),
        pickupAddress: data.pickupAddress?.trim(),
        deliveryAddress: data.deliveryAddress?.trim(),
        city: data.city?.trim(),
        province: data.province?.trim(),
        photoUrl: data.photoUrl?.trim(),
        amount: undefined,
        status: ServiceRequestStatus.PENDING,
      },
    });
  }
}

export class GetMyServiceRequestsUseCase {
  async execute(customerId: string) {
    return await prisma.serviceRequest.findMany({
      where: { customerId },
      select: {
        id: true,
        category: true,
        title: true,
        description: true,
        pickupAddress: true,
        deliveryAddress: true,
        city: true,
        province: true,
        photoUrl: true,
        amount: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        providerName: true,
        providerExternalId: true,
        serviceOffering: {
          select: {
            id: true,
            name: true,
            provider: {
              select: providerSelect,
            },
          },
        },
      },
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
        provider: {
          select: providerSelect,
        },
        serviceOffering: {
          include: serviceOfferingInclude,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

export class GetProviderServiceRequestsUseCase {
  async execute(providerId: string) {
    return await prisma.serviceRequest.findMany({
      where: {
        OR: [
          { status: ServiceRequestStatus.PENDING },
          { providerId },
        ],
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        provider: {
          select: providerSelect,
        },
        serviceOffering: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

export class AcceptServiceRequestUseCase {
  async execute(data: { requestId: string; providerId: string; providerName?: string }) {
    const request = await prisma.serviceRequest.findUnique({
      where: { id: data.requestId },
    });

    if (!request) {
      throw new Error("Solicitud no encontrada");
    }

    if (request.providerId && request.providerId !== data.providerId) {
      throw new Error("Esta solicitud pertenece a otro proveedor");
    }

    if (request.status !== ServiceRequestStatus.PENDING && !request.providerId) {
      throw new Error("Esta solicitud ya no esta disponible");
    }

    return await prisma.serviceRequest.update({
      where: { id: data.requestId },
      data: {
        providerId: data.providerId,
        providerExternalId: data.providerId,
        providerName: data.providerName,
        status: ServiceRequestStatus.ASSIGNED,
      },
    });
  }
}

export class UpdateProviderServiceRequestStatusUseCase {
  async execute(data: {
    requestId: string;
    providerId: string;
    status: ServiceRequestStatus;
    amount?: number;
  }) {
    if (!Object.values(ServiceRequestStatus).includes(data.status)) {
      throw new Error("Ese estado no es valido");
    }

    const request = await prisma.serviceRequest.findUnique({
      where: { id: data.requestId },
    });

    if (!request || request.providerId !== data.providerId) {
      throw new Error("Solicitud no encontrada para este proveedor");
    }

    return await prisma.serviceRequest.update({
      where: { id: data.requestId },
      data: {
        status: data.status,
        amount: data.amount,
      },
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
