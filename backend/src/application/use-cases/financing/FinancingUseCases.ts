import { FinancingRepository } from "../../../domain/repositories/FinancingRepository";

export class CreateFinancingUseCase {
  constructor(private readonly financingRepository: FinancingRepository) {}

  execute(data: any) {
    return this.financingRepository.create(data);
  }
}

export class GetCustomerFinancingUseCase {
  constructor(private readonly financingRepository: FinancingRepository) {}

  execute(customerId: string) {
    return this.financingRepository.findByCustomer(customerId);
  }
}

export class GetAdminFinancingsUseCase {
  constructor(private readonly financingRepository: FinancingRepository) {}

  execute(page: number, limit: number) {
    return this.financingRepository.findForAdmin(page, limit);
  }
}

export class ApproveFinancingUseCase {
  constructor(private readonly financingRepository: FinancingRepository) {}

  execute(financingId: string, actorId?: string) {
    return this.financingRepository.approveByCooperative(financingId, actorId);
  }
}

export class RejectFinancingUseCase {
  constructor(private readonly financingRepository: FinancingRepository) {}

  execute(financingId: string, actorId?: string, reason?: string) {
    return this.financingRepository.rejectByCooperative(financingId, actorId, reason);
  }
}

export class CreateCounterOfferUseCase {
  constructor(private readonly financingRepository: FinancingRepository) {}

  execute(financingId: string, data: any, actorId?: string) {
    return this.financingRepository.createCounterOffer(financingId, data, actorId);
  }
}

export class AcceptCounterOfferUseCase {
  constructor(private readonly financingRepository: FinancingRepository) {}

  execute(financingId: string, actorId?: string) {
    return this.financingRepository.acceptCounterOffer(financingId, actorId);
  }
}

export class GetFinancingPaymentLinkUseCase {
  constructor(private readonly financingRepository: FinancingRepository) {}

  execute(financingId: string) {
    return this.financingRepository.getPaymentLink(financingId);
  }
}

export class ConfirmFinancingPaymentUseCase {
  constructor(private readonly financingRepository: FinancingRepository) {}

  execute(data: any) {
    return this.financingRepository.confirmPayment(data);
  }
}



