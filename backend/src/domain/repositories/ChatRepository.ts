export interface ChatRepository {
  getOrCreateConversation(data: any): Promise<any>;
  findUserConversations(userId: string): Promise<any>;
  findAdminConversations(): Promise<any>;
  findConversationMessages(conversationId: string, userId: string, role?: string): Promise<any>;
  sendMessage(data: any): Promise<any>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<any>;
}



