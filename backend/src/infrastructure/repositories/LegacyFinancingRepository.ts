import { FinancingRepository } from "../../domain/repositories/FinancingRepository";
import {
  acceptCounterOffer,
  approveByCooperative,
  confirmCooperativePayment,
  createCounterOffer,
  createFinancing,
  getAdminFinancings,
  getCooperativePaymentLink,
  getCustomerFinancing,
  rejectFinancing,
} from "../external-services/financing.service";

export class LegacyFinancingRepository implements FinancingRepository {
  create(data: any) {
    return createFinancing(data);
  }

  findByCustomer(customerId: string) {
    return getCustomerFinancing(customerId);
  }

  findForAdmin(page: number, limit: number) {
    return getAdminFinancings(page, limit);
  }

  approveByCooperative(financingId: string, actorId?: string) {
    return approveByCooperative(financingId, actorId);
  }

  rejectByCooperative(financingId: string, actorId?: string, reason?: string) {
    return rejectFinancing(financingId, actorId, reason);
  }

  createCounterOffer(financingId: string, data: any, actorId?: string) {
    return createCounterOffer(financingId, data, actorId);
  }

  acceptCounterOffer(financingId: string, actorId?: string) {
    return acceptCounterOffer(financingId, actorId);
  }

  getPaymentLink(financingId: string) {
    return getCooperativePaymentLink(financingId);
  }

  confirmPayment(data: any) {
    return confirmCooperativePayment(data);
  }
}



