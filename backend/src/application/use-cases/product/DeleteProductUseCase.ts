import { ProductRepository } from "../../../domain/repositories/ProductRepository";

export class DeleteProductUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(productId: string, actor: any) {
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new Error("Producto no encontrado");
    }

    if (actor?.role !== "ADMIN" && product.sellerId !== actor?.id) {
      throw new Error("No puedes eliminar este producto");
    }

    return await this.productRepository.softDelete(productId);
  }
}



