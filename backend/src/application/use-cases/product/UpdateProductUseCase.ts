import { ProductRepository } from "../../../domain/repositories/ProductRepository";
import { ensureProductImageMatchesTitle } from "../../../infrastructure/external-services/productImageModeration.service";

export class UpdateProductUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(productId: string, data: any, actor: any) {
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new Error("Producto no encontrado");
    }

    if (actor?.role !== "ADMIN" && product.sellerId !== actor?.id) {
      throw new Error("No puedes editar este producto");
    }

    await ensureProductImageMatchesTitle({
      title: data.title || product.title,
      description: data.description || product.description,
      category: data.category || product.category,
      imageUrl: data.imageUrl || product.imageUrl,
    });

    return await this.productRepository.update(productId, data);
  }
}



