import { ChatRepository } from "../../domain/repositories/ChatRepository";
import {
  getAdminConversations,
  getConversationMessages,
  getOrCreateConversation,
  getUserConversations,
  markMessagesAsRead,
  sendMessage,
} from "../external-services/chat.service";

export class LegacyChatRepository implements ChatRepository {
  getOrCreateConversation(data: any) {
    return getOrCreateConversation(data);
  }

  findUserConversations(userId: string) {
    return getUserConversations(userId);
  }

  findAdminConversations() {
    return getAdminConversations();
  }

  findConversationMessages(conversationId: string, userId: string, role?: string) {
    return getConversationMessages(conversationId, userId, role);
  }

  sendMessage(data: any) {
    return sendMessage(data);
  }

  markMessagesAsRead(conversationId: string, userId: string) {
    return markMessagesAsRead(conversationId, userId);
  }
}



