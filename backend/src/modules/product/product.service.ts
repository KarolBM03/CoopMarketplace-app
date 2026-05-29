import prisma from "../../config/prisma";
import { createAuditLog } from "../../services/audit.service";

interface ProductData {
  title: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  isFinanced?: boolean;
  sellerId: string;
  category: string;
}

interface SearchProductsParams {
  q?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const createProduct = async (data: ProductData) => {
  if (!data.sellerId) {
    throw new Error("Vendedor requerido");
  }

  const seller = await prisma.user.findUnique({
    where: { id: data.sellerId },
  });

  if (!seller) {
    throw new Error("Vendedor no encontrado");
  }

  if (seller.role === "SELLER" && seller.sellerStatus !== "APPROVED") {
    throw new Error("Tu perfil de vendedor aún no ha sido aprobado");
  }

  return await prisma.product.create({
    data: {
      title: data.title,
      description: data.description,
      price: data.price,
      stock: data.stock,
      imageUrl: data.imageUrl,
      sellerId: data.sellerId,
      category: data.category,
      isFinanced: data.isFinanced,
    },
  });
};

export const getProducts = async (
  page = 1,
  limit = 12,
  search = "",
  category = "",
  minPrice?: number,
  maxPrice?: number,
  sort = "newest",
) => {
  const skip = (page - 1) * limit;

  const where: any = {
    isActive: true,
  };

  if (search) {
    where.title = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (category && category !== "Todos") {
    where.category = category;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {
      gte: minPrice,
      lte: maxPrice,
    };
  }

  const orderBy =
    sort === "price_asc"
      ? { price: "asc" as const }
      : sort === "price_desc"
        ? { price: "desc" as const }
        : { createdAt: "desc" as const };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,

      skip,

      take: limit,

      orderBy,
    }),

    prisma.product.count({
      where,
    }),
  ]);

  return {
    products,

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const searchProducts = async ({
  q,
  minPrice,
  maxPrice,
}: SearchProductsParams) => {
  return await prisma.product.findMany({
    where: {
      isActive: true,

      title: q
        ? {
            contains: q,
            mode: "insensitive",
          }
        : undefined,

      price: {
        gte: minPrice,
        lte: maxPrice,
      },
    },
  });
};

export const updateProduct = async (
  productId: string,
  data: Partial<ProductData>,
  actor?: any,
) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error("Producto no encontrado");
  }

  if (actor?.role !== "ADMIN" && product.sellerId !== actor?.id) {
    throw new Error("No puedes editar este producto");
  }

  return await prisma.product.update({
    where: {
      id: productId,
    },
    data,
  });
};

export const deleteProduct = async (productId: string, actor?: any) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error("Producto no encontrado");
  }

  if (actor?.role !== "ADMIN" && product.sellerId !== actor?.id) {
    throw new Error("No puedes eliminar este producto");
  }

  const deletedProduct = await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      isActive: false,
    },
  });

  await createAuditLog({
    userId: actor?.id,
    action: "PRODUCT_DELETE",
    entity: "PRODUCT",
    entityId: productId,
    description: "Producto desactivado con soft delete",
    metadata: { sellerId: product.sellerId, title: product.title },
  });

  return deletedProduct;
};

export const getProductById = async (productId: string) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product || !product.isActive) {
    throw new Error("Producto no encontrado");
  }

  return product;
};

export const getSellerProducts = async (sellerId: string) => {
  return prisma.product.findMany({
    where: {
      sellerId,
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
