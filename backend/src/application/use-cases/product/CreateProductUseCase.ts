import { ProductRepository } from "../../../domain/repositories/ProductRepository";
import { ensureProductImageMatchesTitle } from "../../../infrastructure/external-services/productImageModeration.service";

export class CreateProductUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(data: any) {
    if (!data.sellerId) {
      throw new Error("Vendedor requerido");
    }

    if (!data.title || !data.description || !data.price || !data.stock) {
      throw new Error("Datos del producto incompletos");
    }

    await ensureProductImageMatchesTitle({
      title: data.title,
      description: data.description,
      category: data.category,
      imageUrl: data.imageUrl,
    });

    return await this.productRepository.create({
      ...data,
      isFinanced: true,
      currency: data.currency || "DOP",
    });
  }
}



