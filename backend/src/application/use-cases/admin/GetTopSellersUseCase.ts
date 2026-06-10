import { AdminRepository } from "../../../domain/repositories/AdminRepository";

export class GetTopSellersUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}

  execute() {
    return this.adminRepository.getTopSellers();
  }
}
