import prisma from "../../../infrastructure/database/prisma";

export class GetShipmentProofsUseCase {
  async execute() {
    const proofs = await prisma.shipmentProof.findMany({
      include: {
        shipment: {
          include: {
            order: {
              include: {
                customer: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true,
                  },
                },
                items: {
                  include: {
                    product: true,
                  },
                },
              },
            },
          },
        },
        deliveredBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            storeName: true,
          },
        },
      },
      orderBy: {
        deliveredAt: "desc",
      },
    });

    return proofs.map((proof) => {
      const firstItem = proof.shipment.order.items[0];
      const product = firstItem?.product;

      return {
        id: proof.id,
        shipmentId: proof.shipmentId,
        customerPhotoUrl: proof.customerPhotoUrl,
        productPhotoUrl: proof.productPhotoUrl,
        latitude: proof.latitude,
        longitude: proof.longitude,
        notes: proof.notes,
        deliveredAt: proof.deliveredAt,

        customer: proof.shipment.order.customer,
        seller: proof.deliveredBy,
        product,
        orderId: proof.shipment.orderId,
        status: proof.shipment.status,
      };
    });
  }
}
