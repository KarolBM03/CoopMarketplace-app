import prisma from "../../../infrastructure/database/prisma";

export class CreateShipmentFraudAlertUseCase {
  async execute(data: {
    shipmentId: string;
    userId?: string;
    reason: string;
    metadata?: any;
  }) {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: "SHIPMENT_FRAUD_ALERT",
        entity: "SHIPMENT",
        entityId: data.shipmentId,
        description: data.reason,
        metadata: data.metadata || {},
      },
    });
  }
}
