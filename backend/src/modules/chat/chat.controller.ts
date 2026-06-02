import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import {
  getAdminConversations,
  getConversationMessages,
  getOrCreateConversation,
  getUserConversations,
  markMessagesAsRead,
  sendMessage,
} from "./chat.service";
import { getIO } from "../../socket";

export const createConversation = async (req: AuthRequest, res: Response) => {
  try {
    const conversation = await getOrCreateConversation({
      buyerId: req.user?.id as string,
      sellerId: req.body.sellerId,
      productId: req.body.productId,
    });

    res.status(201).json(conversation);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const myConversations = async (req: AuthRequest, res: Response) => {
  try {
    const conversations = await getUserConversations(req.user?.id as string);

    res.json(conversations);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const conversationMessages = async (req: AuthRequest, res: Response) => {
  try {
    const messages = await getConversationMessages(
      req.params.conversationId as string,
      req.user?.id as string,
      req.user?.role,
    );

    res.json(messages);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const sendConversationMessage = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const message = await sendMessage({
      conversationId: req.params.conversationId as string,
      senderId: req.user?.id as string,
      content: req.body.content,
    });

    const io = getIO();

    io.to(`chat:${req.params.conversationId}`).emit("chat:message:new", {
      message,
    });

    res.status(201).json(message);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const readConversation = async (req: AuthRequest, res: Response) => {
  try {
    const result = await markMessagesAsRead(
      req.params.conversationId as string,
      req.user?.id as string,
    );

    const io = getIO();

    io.to(`chat:${req.params.conversationId}`).emit("chat:message:read", {
      conversationId: req.params.conversationId,
      userId: req.user?.id,
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const adminConversations = async (_req: AuthRequest, res: Response) => {
  try {
    const conversations = await getAdminConversations();

    res.json(conversations);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
