import prisma from "../database/prisma";
import { validateMessageContent } from "../../application/validators/chat/chat.validation";
import { sendPushToUser } from "./pushNotification.service";

export const getOrCreateConversation = async ({
  buyerId,
  sellerId,
  productId,
}: {
  buyerId: string;
  sellerId: string;
  productId?: string;
}) => {
  if (buyerId === sellerId) {
    throw new Error("No puedes iniciar conversación contigo mismo");
  }

  const existing = await prisma.conversation.findFirst({
    where: {
      buyerId,
      sellerId,
      productId,
    },
    include: {
      buyer: true,
      seller: true,
      product: true,
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (existing) return existing;

  return await prisma.conversation.create({
    data: {
      buyerId,
      sellerId,
      productId,
    },
    include: {
      buyer: true,
      seller: true,
      product: true,
      messages: true,
    },
  });
};

export const getUserConversations = async (userId: string) => {
  return await prisma.conversation.findMany({
    where: {
      OR: [{ buyerId: userId }, { sellerId: userId }],
    },
    include: {
      buyer: { select: { id: true, fullName: true, email: true } },
      seller: {
        select: { id: true, fullName: true, email: true, storeName: true },
      },
      product: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
};

export const getConversationMessages = async (
  conversationId: string,
  userId: string,
  role?: string,
) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new Error("Conversación no encontrada");
  }

  const isParticipant =
    conversation.buyerId === userId || conversation.sellerId === userId;

  if (!isParticipant && role !== "ADMIN") {
    throw new Error("No puedes ver esta conversación");
  }

  return await prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
};

export const sendMessage = async ({
  conversationId,
  senderId,
  content,
}: {
  conversationId: string;
  senderId: string;
  content: string;
}) => {
  validateMessageContent(content);

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new Error("Conversación no encontrada");
  }

  const isParticipant =
    conversation.buyerId === senderId || conversation.sellerId === senderId;

  if (!isParticipant) {
    throw new Error("No puedes enviar mensajes en esta conversación");
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      content: content.trim(),
    },
    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      },
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  const receiverId =
    conversation.buyerId === senderId
      ? conversation.sellerId
      : conversation.buyerId;

  await sendPushToUser({
    userId: receiverId,
    title: "Nuevo mensaje",
    body: content.trim(),
  });

  return message;

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return message;
};

export const markMessagesAsRead = async (
  conversationId: string,
  userId: string,
) => {
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: {
        not: userId,
      },
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  return { message: "Mensajes marcados como leídos" };
};

export const getAdminConversations = async () => {
  return await prisma.conversation.findMany({
    include: {
      buyer: { select: { id: true, fullName: true, email: true } },
      seller: {
        select: { id: true, fullName: true, email: true, storeName: true },
      },
      product: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
};



