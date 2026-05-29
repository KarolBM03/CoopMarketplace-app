import prisma from "../config/prisma";
import { getIO } from "../socket";

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
    },
  });

  try {
    const io = getIO();

    io.to(userId).emit("new_notification", notification);
  } catch (error) {
    console.log("Socket no disponible");
  }

  return notification;
};

export const getNotificationsByUser = async (
  userId: string,
  page = 1,
  limit = 10,
) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 50);
  const skip = (safePage - 1) * safeLimit;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
      skip,
      take: safeLimit,
    }),
    prisma.notification.count({
      where: { userId },
    }),
  ]);

  return {
    notifications,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
};

export const sendEmailNotification = async (
  to: string,
  subject: string,
  message: string,
) => {
  return {
    provider: process.env.EMAIL_PROVIDER || "local",
    to,
    subject,
    message,
    queued: true,
    configured: Boolean(process.env.EMAIL_USER || process.env.SENDGRID_API_KEY),
  };
};

export const sendSMSNotification = async (to: string, message: string) => {
  return {
    provider: process.env.SMS_PROVIDER || "local",
    to,
    message,
    queued: true,
    configured: Boolean(process.env.TWILIO_ACCOUNT_SID),
  };
};

export const sendWhatsAppNotification = async (to: string, message: string) => {
  return {
    provider: process.env.WHATSAPP_PROVIDER || "local",
    to,
    message,
    queued: true,
    configured: Boolean(process.env.WHATSAPP_TOKEN || process.env.TWILIO_ACCOUNT_SID),
  };
};

export const sendPushNotification = async (
  userId: string,
  title: string,
  message: string,
) => {
  return {
    provider: process.env.PUSH_PROVIDER || "local",
    userId,
    title,
    message,
    queued: true,
    configured: Boolean(process.env.PUSH_PROVIDER),
  };
};

export const sendPaymentReminder = async (
  userId: string,
  title: string,
  message: string,
) => {
  const notification = await createNotification(userId, title, message);

  return {
    notification,
    external: await sendPushNotification(userId, title, message),
  };
};
