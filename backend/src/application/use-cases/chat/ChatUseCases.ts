import { ChatRepository } from "../../../domain/repositories/ChatRepository";

export class CreateConversationUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  execute(data: any) {
    return this.chatRepository.getOrCreateConversation(data);
  }
}

export class GetMyConversationsUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  execute(userId: string) {
    return this.chatRepository.findUserConversations(userId);
  }
}

export class GetAdminConversationsUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  execute() {
    return this.chatRepository.findAdminConversations();
  }
}

export class GetConversationMessagesUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  execute(conversationId: string, userId: string, role?: string) {
    return this.chatRepository.findConversationMessages(conversationId, userId, role);
  }
}

export class SendConversationMessageUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  execute(data: any) {
    return this.chatRepository.sendMessage(data);
  }
}

export class ReadConversationUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  execute(conversationId: string, userId: string) {
    return this.chatRepository.markMessagesAsRead(conversationId, userId);
  }
}



