import { NotificationRepository } from "../../../domain/repositories/NotificationRepository";

export class GetUserNotificationsUseCase {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  execute(userId: string, page: number, limit: number) {
    return this.notificationRepository.findByUser(userId, page, limit);
  }
}

export class MarkNotificationAsReadUseCase {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  execute(userId: string, notificationId: string) {
    return this.notificationRepository.markAsRead(userId, notificationId);
  }
}



