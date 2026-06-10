import { AdminRepository } from "../../../domain/repositories/AdminRepository";

export class GetSalesChartUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}

  execute() {
    return this.adminRepository.getSalesChart();
  }
}
