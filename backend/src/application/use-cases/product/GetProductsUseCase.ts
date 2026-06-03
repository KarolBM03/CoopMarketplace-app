import { ProductRepository } from "../../../domain/repositories/ProductRepository";

export class GetProductsUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(params: any) {
    const {
      page = 1,
      limit = 12,
      search = "",
      category = "",
      minPrice,
      maxPrice,
      sort = "newest",
    } = params;

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
          : sort === "best_selling"
            ? { salesCount: "desc" as const }
            : sort === "relevance" || sort === "trending"
              ? { rankingScore: "desc" as const }
              : { createdAt: "desc" as const };

    const result = await this.productRepository.findMany({
      page,
      limit,
      where,
      orderBy,
    });

    return {
      products: result.products,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}
