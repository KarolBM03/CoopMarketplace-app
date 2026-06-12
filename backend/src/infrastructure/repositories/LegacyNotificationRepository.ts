import { NotificationRepository } from "../../domain/repositories/NotificationRepository";
import {
  getNotificationsByUser,
  markNotificationAsRead,
} from "../external-services/notification.service";

export class LegacyNotificationRepository implements NotificationRepository {
  findByUser(userId: string, page: number, limit: number) {
    return getNotificationsByUser(userId, page, limit);
  }

  markAsRead(userId: string, notificationId: string) {
    return markNotificationAsRead(userId, notificationId);
  }
}



