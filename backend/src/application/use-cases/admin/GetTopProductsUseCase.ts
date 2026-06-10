import { AdminRepository } from "../../../domain/repositories/AdminRepository";

export class GetTopProductsUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}

  execute() {
    return this.adminRepository.getTopProducts();
  }
}
