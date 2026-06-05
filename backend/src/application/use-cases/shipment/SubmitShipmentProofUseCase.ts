import prisma from "../../../infrastructure/database/prisma";
import { createAuditLog } from "../../../infrastructure/external-services/audit.service";
import { createNotification } from "../../../infrastructure/external-services/notification.service";
import { CreateShipmentFraudAlertUseCase } from "./CreateShipmentFraudAlertUseCase";

export class SubmitShipmentProofUseCase {
  async execute(data: {
    shipmentId: string;
    deliveredById: string;
    customerPhotoUrl: string;
    productPhotoUrl: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
  }) {
    const fraudAlert = new CreateShipmentFraudAlertUseCase();

    if (!data.shipmentId) {
      throw new Error("Debes seleccionar un envío");
    }

    if (!data.customerPhotoUrl?.trim()) {
      await fraudAlert.execute({
        shipmentId: data.shipmentId,
        userId: data.deliveredById,
        reason:
          "Intentaron confirmar entrega sin foto del cliente con el producto",
      });

      throw new Error("Debes subir una foto del cliente con el producto");
    }

    if (!data.productPhotoUrl?.trim()) {
      await fraudAlert.execute({
        shipmentId: data.shipmentId,
        userId: data.deliveredById,
        reason: "Intentaron confirmar entrega sin foto del producto",
      });

      throw new Error("Debes subir una foto del producto");
    }

    if (data.latitude === undefined || data.longitude === undefined) {
      await fraudAlert.execute({
        shipmentId: data.shipmentId,
        userId: data.deliveredById,
        reason: "Intentaron confirmar una entrega sin ubicación GPS",
      });

      throw new Error("Necesito la ubicación para confirmar la entrega");
    }

    const shipment = await prisma.shipment.findUnique({
      where: { id: data.shipmentId },
    });

    if (!shipment) {
      throw new Error("No encontré ese envío");
    }

    if (shipment.status === "DELIVERED") {
      await fraudAlert.execute({
        shipmentId: data.shipmentId,
        userId: data.deliveredById,
        reason: "Intentaron confirmar un envío que ya estaba entregado",
      });

      throw new Error("Este envío ya está marcado como entregado");
    }

    if (shipment.sellerId !== data.deliveredById) {
      await fraudAlert.execute({
        shipmentId: data.shipmentId,
        userId: data.deliveredById,
        reason: "Alguien intentó confirmar un envío que no le pertenece",
        metadata: {
          realSellerId: shipment.sellerId,
        },
      });

      throw new Error("Este envío no te pertenece");
    }

    if (shipment.status !== "IN_TRANSIT" && shipment.status !== "SHIPPED") {
      await fraudAlert.execute({
        shipmentId: data.shipmentId,
        userId: data.deliveredById,
        reason: "Intentaron entregar un envío que todavía no estaba listo",
        metadata: {
          currentStatus: shipment.status,
        },
      });

      throw new Error("Solo puedes entregar un envío que esté en camino");
    }
    const existingProof = await prisma.shipmentProof.findUnique({
      where: {
        shipmentId: data.shipmentId,
      },
    });

    if (existingProof) {
      throw new Error("Ya existe una evidencia de entrega para este envío");
    }

    const proof = await prisma.shipmentProof.create({
      data: {
        shipmentId: data.shipmentId,
        customerPhotoUrl: data.customerPhotoUrl.trim(),
        productPhotoUrl: data.productPhotoUrl.trim(),
        latitude: data.latitude,
        longitude: data.longitude,
        notes: data.notes?.trim(),
        deliveredById: data.deliveredById,
      },
    });

    await prisma.shipment.update({
      where: { id: data.shipmentId },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date(),
        isTracking: false,
        trackingEndedAt: new Date(),
      },
    });

    await createNotification(
      shipment.customerId,
      "Tu pedido fue entregado",
      "Ya se guardó la evidencia de entrega de tu paquete.",
    );

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    for (const admin of admins) {
      await createNotification(
        admin.id,
        "Entrega confirmada",
        "Un envío fue marcado como entregado con foto y GPS.",
      );
    }

    await createAuditLog({
      userId: data.deliveredById,
      action: "SHIPMENT_DELIVERY_PROOF",
      entity: "SHIPMENT",
      entityId: shipment.id,
      description: "Se guardó la evidencia de entrega",
      metadata: {
        shipmentId: shipment.id,
        customerPhotoUrl: data.customerPhotoUrl.trim(),
        productPhotoUrl: data.productPhotoUrl.trim(),
        latitude: data.latitude,
        longitude: data.longitude,
        notes: data.notes?.trim(),
      },
    });

    return {
      message: "Entrega guardada con éxito",
      proof,
    };
  }
}
