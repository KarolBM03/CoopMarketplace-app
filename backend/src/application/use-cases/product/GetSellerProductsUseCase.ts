import { ProductRepository } from "../../../domain/repositories/ProductRepository";

export class GetSellerProductsUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(sellerId: string) {
    if (!sellerId) {
      throw new Error("Vendedor requerido");
    }

    return await this.productRepository.findBySeller(sellerId);
  }
}
