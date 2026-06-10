import { AdminRepository } from "../../domain/repositories/AdminRepository";
import {
  approveSeller,
  blockUser,
  generateFinancialReport,
  getFraudAlerts,
  getPlatformMetrics,
  getSellers,
  getTopProducts,
  getTopSellers,
  getUsers,
  rejectSeller,
  unblockUser,
  resolveFraudAlert,
  getSalesChart,
  getFinancingChart,
} from "../external-services/admin.service";

export class LegacyAdminRepository implements AdminRepository {
  getMetrics() {
    return getPlatformMetrics();
  }

  getTopProducts() {
    return getTopProducts();
  }

  getTopSellers() {
    return getTopSellers();
  }

  getSalesChart() {
    return getSalesChart();
  }

  getFinancingChart() {
    return getFinancingChart();
  }

  getFinancialReport() {
    return generateFinancialReport();
  }

  getFraudAlerts() {
    return getFraudAlerts();
  }

  resolveFraudAlert(alertId: string) {
    return resolveFraudAlert(alertId);
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
