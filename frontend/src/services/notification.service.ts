import api from "../api/axios";
import type { AppNotification } from "../types/finance.types";

export interface NotificationsPage {
  notifications: AppNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getNotificationsPage = async (
  userId: string,
  page = 1,
  limit = 10,
): Promise<NotificationsPage> => {
  const response = await api.get(`/notifications/user/${userId}`, {
    params: {
      page,
      limit,
    },
  });

  return response.data;
};

export const getNotificationsByUser = async (userId: string) => {
  const data = await getNotificationsPage(userId, 1, 10);

  return data.notifications;
};

export const markNotificationAsRead = async (notificationId: string) => {
  const response = await api.patch(`/notifications/${notificationId}/read`);

  return response.data;
};
