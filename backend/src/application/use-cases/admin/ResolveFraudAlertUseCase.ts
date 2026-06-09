import { AdminRepository } from "../../../domain/repositories/AdminRepository";

export class ResolveFraudAlertUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}

  execute(alertId: string) {
    return this.adminRepository.resolveFraudAlert(alertId);
  }
}
