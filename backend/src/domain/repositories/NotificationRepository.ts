export interface NotificationRepository {
  findByUser(userId: string, page: number, limit: number): Promise<any>;
  markAsRead(userId: string, notificationId: string): Promise<any>;
}



