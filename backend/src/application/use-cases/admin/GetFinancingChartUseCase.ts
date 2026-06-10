import { AdminRepository } from "../../../domain/repositories/AdminRepository";

export class GetFinancingChartUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}

  execute() {
    return this.adminRepository.getFinancingChart();
  }
}
