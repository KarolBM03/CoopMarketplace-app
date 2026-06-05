import { OrderStatus, ShipmentStatus } from "@prisma/client";
import prisma from "../database/prisma";
import { createAuditLog } from "./audit.service";
import { createNotification } from "../external-services/notification.service";

const canShipOrder = (status: OrderStatus) =>
  (
    [OrderStatus.PAID, OrderStatus.PREPARING, OrderStatus.SHIPPED] as OrderStatus[]
  ).includes(status);

export const createShipmentForOrder = async ({
  orderId,
  sellerId,
  actorId,
  data,
}: {
  orderId: string;
  sellerId: string;
  actorId?: string;
  data?: {
    shippingAddress?: string;
    province?: string;
    city?: string;
    sector?: string;
    reference?: string;
    phone?: string;
    notes?: string;
  };
}) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      shipments: true,
    },
  });

  if (!order) {
    throw new Error("Orden no encontrada");
  }

  if (!canShipOrder(order.status)) {
    throw new Error("Solo puedes crear envio cuando la orden esta pagada");
  }

  const sellerOwnsItem = order.items.some(
    (item) => item.product.sellerId === sellerId,
  );

  if (!sellerOwnsItem) {
    throw new Error("No puedes crear envio para esta orden");
  }

  const existingShipment = order.shipments.find(
    (shipment) => shipment.sellerId === sellerId,
  );

  if (existingShipment) {
    return existingShipment;
  }

  const shipment = await prisma.shipment.create({
    data: {
      orderId,
      sellerId,
      customerId: order.customerId,
      status: ShipmentStatus.PENDING_PREPARATION,
      ...data,
    },
  });

  await createNotification(
    sellerId,
    "Orden lista para preparar",
    "Tienes una orden pagada pendiente de preparacion.",
  );

  await createAuditLog({
    userId: actorId || sellerId,
    action: "SHIPMENT_CREATE",
    entity: "SHIPMENT",
    entityId: shipment.id,
    description: "Envio creado para orden pagada",
    metadata: { orderId, sellerId },
  });

  return shipment;
};

export const createShipmentsForPaidOrder = async ({
  orderId,
  actorId,
  shippingData,
}: {
  orderId: string;
  actorId?: string;
  shippingData?: {
    shippingAddress?: string;
    province?: string;
    city?: string;
    sector?: string;
    reference?: string;
    phone?: string;
    notes?: string;
  };
}) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      shipments: true,
    },
  });

  if (!order) {
    throw new Error("Orden no encontrada");
  }

  if (!canShipOrder(order.status)) {
    return [];
  }

  const sellerIds = Array.from(
    new Set(order.items.map((item) => item.product.sellerId)),
  );

  const shipments = [];

  for (const sellerId of sellerIds) {
    const existingShipment = order.shipments.find(
      (shipment) => shipment.sellerId === sellerId,
    );

    if (existingShipment) {
      shipments.push(existingShipment);
      continue;
    }

    shipments.push(
      await createShipmentForOrder({
        orderId,
        sellerId,
        actorId,
        data: shippingData,
      }),
    );
  }

  return shipments;
};

export const updateShipmentStatus = async ({
  shipmentId,
  status,
  actorId,
  actorRole,
}: {
  shipmentId: string;
  status: ShipmentStatus;
  actorId?: string;
  actorRole?: string;
}) => {
  if (!Object.values(ShipmentStatus).includes(status)) {
    throw new Error("Estado de envio no valido");
  }

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
  });

  if (!shipment) {
    throw new Error("Envio no encontrado");
  }

  if (actorRole !== "ADMIN" && shipment.sellerId !== actorId) {
    throw new Error("No puedes actualizar este envio");
  }

  const now = new Date();
  const data: any = { status };

  if (status === ShipmentStatus.PREPARING) {
    data.preparedAt = now;
  }

  if (status === ShipmentStatus.SHIPPED || status === ShipmentStatus.IN_TRANSIT) {
    data.shippedAt = now;
    data.isTracking = status === ShipmentStatus.IN_TRANSIT;
    if (status === ShipmentStatus.IN_TRANSIT && !shipment.trackingStartedAt) {
      data.trackingStartedAt = now;
    }
  }

  if (status === ShipmentStatus.DELIVERED) {
    data.deliveredAt = now;
    data.isTracking = false;
    data.trackingEndedAt = now;
  }

  const updatedShipment = await prisma.shipment.update({
    where: { id: shipmentId },
    data,
  });

  if (status === ShipmentStatus.DELIVERED) {
    await prisma.order.update({
      where: { id: shipment.orderId },
      data: { status: OrderStatus.DELIVERED },
    });
  } else if (status === ShipmentStatus.SHIPPED || status === ShipmentStatus.IN_TRANSIT) {
    await prisma.order.update({
      where: { id: shipment.orderId },
      data: { status: OrderStatus.SHIPPED },
    });
  } else if (status === ShipmentStatus.PREPARING) {
    await prisma.order.update({
      where: { id: shipment.orderId },
      data: { status: OrderStatus.PREPARING },
    });
  }

  await createNotification(
    shipment.customerId,
    "Estado de envio actualizado",
    `Tu envio ahora esta en estado ${status}.`,
  );

  await createAuditLog({
    userId: actorId,
    action: "SHIPMENT_STATUS_UPDATE",
    entity: "SHIPMENT",
    entityId: shipment.id,
    description: "Estado de envio actualizado",
    metadata: { previousStatus: shipment.status, nextStatus: status },
  });

  return updatedShipment;
};

export const getCustomerShipments = async (customerId: string) => {
  return prisma.shipment.findMany({
    where: { customerId },
    include: { order: { include: { items: { include: { product: true } } } } },
    orderBy: { createdAt: "desc" },
  });
};

export const getSellerShipments = async (sellerId: string) => {
  return prisma.shipment.findMany({
    where: { sellerId },
    include: { order: { include: { customer: true, items: { include: { product: true } } } } },
    orderBy: { createdAt: "desc" },
  });
};

export const getAdminShipments = async () => {
  return prisma.shipment.findMany({
    include: { order: true },
    orderBy: { createdAt: "desc" },
  });
};

const canManageShipmentTracking = (shipment: { sellerId: string }, actorId?: string, actorRole?: string) =>
  actorRole === "ADMIN" || shipment.sellerId === actorId;

export const startShipmentTracking = async ({
  shipmentId,
  actorId,
  actorRole,
}: {
  shipmentId: string;
  actorId?: string;
  actorRole?: string;
}) => {
  const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });

  if (!shipment) throw new Error("Envio no encontrado");
  if (!canManageShipmentTracking(shipment, actorId, actorRole)) {
    throw new Error("No puedes iniciar GPS para este envio");
  }

  return prisma.shipment.update({
    where: { id: shipmentId },
    data: {
      isTracking: true,
      trackingStartedAt: shipment.trackingStartedAt || new Date(),
      status: ShipmentStatus.IN_TRANSIT,
    },
  });
};

export const updateShipmentLocation = async ({
  shipmentId,
  lat,
  lng,
  actorId,
  actorRole,
}: {
  shipmentId: string;
  lat: number;
  lng: number;
  actorId?: string;
  actorRole?: string;
}) => {
  const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });

  if (!shipment) throw new Error("Envio no encontrado");
  if (!canManageShipmentTracking(shipment, actorId, actorRole)) {
    throw new Error("No puedes compartir ubicacion para este envio");
  }

  return prisma.shipment.update({
    where: { id: shipmentId },
    data: {
      currentLatitude: Number(lat),
      currentLongitude: Number(lng),
      lastLocationAt: new Date(),
      isTracking: true,
    },
  });
};

export const stopShipmentTracking = async ({
  shipmentId,
  actorId,
  actorRole,
}: {
  shipmentId: string;
  actorId?: string;
  actorRole?: string;
}) => {
  const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });

  if (!shipment) throw new Error("Envio no encontrado");
  if (!canManageShipmentTracking(shipment, actorId, actorRole)) {
    throw new Error("No puedes detener GPS para este envio");
  }

  return prisma.shipment.update({
    where: { id: shipmentId },
    data: {
      isTracking: false,
      trackingEndedAt: new Date(),
    },
  });
};



