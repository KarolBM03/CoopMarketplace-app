import { ProductRepository } from "../../../domain/repositories/ProductRepository";

export class CreateProductUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(data: any) {
    if (!data.sellerId) {
      throw new Error("Vendedor requerido");
    }

    if (!data.title || !data.description || !data.price || !data.stock) {
      throw new Error("Datos del producto incompletos");
    }

    return await this.productRepository.create({
      ...data,
      isFinanced: true,
      currency: data.currency || "DOP",
    });
  }
}
