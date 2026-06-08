import { ProductRepository } from "../../../domain/repositories/ProductRepository";

export class GetProductByIdUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(productId: string) {
    const product = await this.productRepository.findById(productId);

    if (!product || !product.isActive) {
      throw new Error("Producto no encontrado");
    }

    await this.productRepository.update(productId, {
      views: product.views + 1,
      rankingScore:
        product.salesCount * 5 +
        (product.ratingAverage || 0) * 10 +
        (product.views + 1) * 0.1 +
        (product.isFinanced ? 10 : 0),
    });

    return await this.productRepository.findById(productId);
  }
}
