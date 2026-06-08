import prisma from "../../../infrastructure/database/prisma";

export class GetProductReviewsUseCase {
  async execute(productId: string) {
    return await prisma.productReview.findMany({
      where: {
        productId,
      },
      select: {
        id: true,
        productId: true,
        customerId: true,
        orderId: true,
        rating: true,
        comment: true,
        createdAt: true,
        customer: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
