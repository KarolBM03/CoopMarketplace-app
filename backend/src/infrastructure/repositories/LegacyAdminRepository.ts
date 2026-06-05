import { AdminRepository } from "../../domain/repositories/AdminRepository";
import {
  approveSeller,
  blockUser,
  generateFinancialReport,
  getFraudAlerts,
  getPlatformMetrics,
  getSellers,
  getUsers,
  rejectSeller,
  unblockUser,
} from "../external-services/admin.service";

export class LegacyAdminRepository implements AdminRepository {
  getMetrics() {
    return getPlatformMetrics();
  }

  getFinancialReport() {
    return generateFinancialReport();
  }

  getFraudAlerts() {
    return getFraudAlerts();
  }

  getUsers() {
    return getUsers();
  }

  blockUser(userId: string, actorId?: string) {
    return blockUser(userId, actorId);
  }

  unblockUser(userId: string, actorId?: string) {
    return unblockUser(userId, actorId);
  }

  approveSeller(userId: string, actorId?: string) {
    return approveSeller(userId, actorId);
  }

  rejectSeller(userId: string, actorId?: string) {
    return rejectSeller(userId, actorId);
  }

  getSellers() {
    return getSellers();
  }
}



