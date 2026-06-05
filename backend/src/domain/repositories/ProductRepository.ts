import { Product } from "../entities/Product";

export interface ProductRepository {
  create(data: Partial<Product>): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  findMany(params: any): Promise<{ products: Product[]; total: number }>;
  update(id: string, data: Partial<Product>): Promise<Product>;
  softDelete(id: string): Promise<Product>;
  findBySeller(sellerId: string): Promise<Product[]>;
}



