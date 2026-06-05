import { AdminRepository } from "../../../domain/repositories/AdminRepository";

export class GetAdminMetricsUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}
  execute() { return this.adminRepository.getMetrics(); }
}

export class GetAdminFinancialReportUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}
  execute() { return this.adminRepository.getFinancialReport(); }
}

export class GetFraudAlertsUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}
  execute() { return this.adminRepository.getFraudAlerts(); }
}

export class GetUsersUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}
  execute() { return this.adminRepository.getUsers(); }
}

export class BlockAdminUserUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}
  execute(userId: string, actorId?: string) { return this.adminRepository.blockUser(userId, actorId); }
}

export class UnblockAdminUserUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}
  execute(userId: string, actorId?: string) { return this.adminRepository.unblockUser(userId, actorId); }
}

export class ApproveAdminSellerUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}
  execute(userId: string, actorId?: string) { return this.adminRepository.approveSeller(userId, actorId); }
}

export class RejectAdminSellerUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}
  execute(userId: string, actorId?: string) { return this.adminRepository.rejectSeller(userId, actorId); }
}

export class GetSellersUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}
  execute() { return this.adminRepository.getSellers(); }
}



