export interface NotificationRepository {
  findByUser(userId: string, page: number, limit: number): Promise<any>;
}



