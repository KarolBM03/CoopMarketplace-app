import prisma from "../../../infrastructure/database/prisma";

export class AddFavoriteUseCase {
  async execute(customerId: string, productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Ese producto no aparece");
    }

    const exists = await prisma.favorite.findUnique({
      where: {
        customerId_productId: {
          customerId,
          productId,
        },
      },
    });

    if (exists) {
      throw new Error("Ya tienes este producto guardado");
    }

    const favorite = await prisma.favorite.create({
      data: {
        customerId,
        productId,
      },
    });

    return {
      message: "EL producto fue guardado en favoritos",
      favorite,
    };
  }
}

export class GetMyFavoritesUseCase {
  async execute(customerId: string) {
    return await prisma.favorite.findMany({
      where: { customerId },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

export class RemoveFavoriteUseCase {
  async execute(customerId: string, productId: string) {
    await prisma.favorite.delete({
      where: {
        customerId_productId: {
          customerId,
          productId,
        },
      },
    });

    return {
      message: "El producto fue quitado de favoritos",
    };
  }
}
