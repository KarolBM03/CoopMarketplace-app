import { NotificationRepository } from "../../domain/repositories/NotificationRepository";
import { getNotificationsByUser } from "../external-services/notification.service";

export class LegacyNotificationRepository implements NotificationRepository {
  findByUser(userId: string, page: number, limit: number) {
    return getNotificationsByUser(userId, page, limit);
  }
}



