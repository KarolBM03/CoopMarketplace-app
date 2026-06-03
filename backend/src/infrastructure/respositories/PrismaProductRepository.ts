import prisma from "../../config/prisma";
import { ProductRepository } from "../../domain/repositories/ProductRepository";
import { Product } from "../../domain/entities/Product";

export class PrismaProductRepository implements ProductRepository {
  async create(data: Partial<Product>): Promise<Product> {
    return await prisma.product.create({
      data: {
        title: data.title as string,
        description: data.description as string,
        price: data.price as number,
        stock: data.stock as number,
        imageUrl: data.imageUrl,
        sellerId: data.sellerId as string,
        category: data.category as string,
        currency: data.currency || "DOP",
        isFinanced: true,
      },
    });
  }

  async findById(id: string): Promise<Product | null> {
    return await prisma.product.findUnique({
      where: { id },
    });
  }

  async findMany(params: any): Promise<{ products: Product[]; total: number }> {
    const { page, limit, where, orderBy } = params;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    return await prisma.product.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Product> {
    return await prisma.product.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  async findBySeller(sellerId: string): Promise<Product[]> {
    return await prisma.product.findMany({
      where: {
        sellerId,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
