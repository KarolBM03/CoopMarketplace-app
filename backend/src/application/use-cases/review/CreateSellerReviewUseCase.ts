import prisma from "../../../infrastructure/database/prisma";

export class CreateSellerReviewUseCase {
  async execute(data: {
    sellerId: string;
    customerId: string;
    orderId?: string;
    rating: number;
    comment?: string;
  }) {
    if (!data.sellerId) {
      throw new Error("Selecciona un vendedor");
    }

    if (data.rating < 1 || data.rating > 5) {
      throw new Error("La calificación debe ser de 1 a 5 estrellas");
    }

    const alreadyReviewed = await prisma.sellerReview.findFirst({
      where: {
        sellerId: data.sellerId,
        customerId: data.customerId,
        orderId: data.orderId,
      },
    });

    if (alreadyReviewed) {
      throw new Error("Ya calificaste este vendedor");
    }

    const review = await prisma.sellerReview.create({
      data: {
        sellerId: data.sellerId,
        customerId: data.customerId,
        orderId: data.orderId,
        rating: data.rating,
        comment: data.comment?.trim(),
      },
    });

    const stats = await prisma.sellerReview.aggregate({
      where: { sellerId: data.sellerId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const sellerRatingAverage = Number(stats._avg.rating || 0);
    const sellerRatingCount = stats._count.rating || 0;

    const sellerScore = Math.min(100, Math.round(70 + sellerRatingAverage * 6));

    await prisma.user.update({
      where: { id: data.sellerId },
      data: {
        sellerRatingAverage,
        sellerRatingCount,
        sellerScore,
      },
    });

    return {
      message: "Gracias por calificar el vendedor",
      review,
    };
  }
}
