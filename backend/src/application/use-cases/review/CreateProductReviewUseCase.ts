import prisma from "../../../infrastructure/database/prisma";

export class CreateProductReviewUseCase {
  async execute(data: {
    productId: string;
    customerId: string;
    orderId?: string;
    rating: number;
    comment?: string;
  }) {
    if (!data.productId) {
      throw new Error("Selecciona un producto primero");
    }

    if (!data.customerId) {
      throw new Error("Ese producto no aparece");
    }

    if (data.rating < 1 || data.rating > 5) {
      throw new Error("La calificación debe ser de 1 a 5 estrellas");
    }

    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new Error("No encontré ese producto");
    }

    const alreadyReviewed = await prisma.productReview.findFirst({
      where: {
        productId: data.productId,
        customerId: data.customerId,
      },
    });

    if (alreadyReviewed) {
      throw new Error("Ya dejaste tu opinión para este producto");
    }

    if (!data.orderId) {
      throw new Error("Solo puedes opinar cuando recibes el producto");
    }

    const order = await prisma.order.findFirst({
      where: {
        id: data.orderId,
        customerId: data.customerId,
        status: "DELIVERED",
        items: {
          some: {
            productId: data.productId,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Solo puedes opinar cuando recibes el producto");
    }

    const review = await prisma.productReview.create({
      data: {
        productId: data.productId,
        customerId: data.customerId,
        orderId: data.orderId,
        rating: data.rating,
        comment: data.comment?.trim(),
      },
    });

    const stats = await prisma.productReview.aggregate({
      where: { productId: data.productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const ratingAverage = Number(stats._avg.rating || 0);
    const ratingCount = stats._count.rating || 0;

    const rankingScore =
      product.salesCount * 5 +
      ratingAverage * 10 +
      product.views * 0.1 +
      (product.isFinanced ? 10 : 0);

    await prisma.product.update({
      where: { id: data.productId },
      data: {
        ratingAverage,
        ratingCount,
        rankingScore,
      },
    });

    return {
      message: "Gracias por calificar el producto",
      review,
    };
  }
}
