import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import {
  CreateConversationUseCase,
  GetAdminConversationsUseCase,
  GetConversationMessagesUseCase,
  GetMyConversationsUseCase,
  ReadConversationUseCase,
  SendConversationMessageUseCase,
} from "../../../../application/use-cases/chat/ChatUseCases";
import { LegacyChatRepository } from "../../../../infrastructure/repositories/LegacyChatRepository";
import { getIO } from "../../../../infrastructure/socket/SocketServer";
import { handleControllerError } from "../../../../shared/utils/controllerError";

export class ChatControllerV2 {
  constructor(private readonly chatRepository = new LegacyChatRepository()) {}

  createConversation = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new CreateConversationUseCase(this.chatRepository);
      const conversation = await useCase.execute({
        buyerId: req.user?.id,
        sellerId: req.body.sellerId,
        productId: req.body.productId,
      });
      return res.status(201).json(conversation);
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  myConversations = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new GetMyConversationsUseCase(this.chatRepository);
      return res.json(await useCase.execute(req.user?.id as string));
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  adminConversations = async (_req: AuthRequest, res: Response) => {
    try {
      const useCase = new GetAdminConversationsUseCase(this.chatRepository);
      return res.json(await useCase.execute());
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  conversationMessages = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new GetConversationMessagesUseCase(this.chatRepository);
      return res.json(await useCase.execute(req.params.conversationId as string, req.user?.id as string, req.user?.role));
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  sendConversationMessage = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new SendConversationMessageUseCase(this.chatRepository);
      const message = await useCase.execute({
        conversationId: req.params.conversationId,
        senderId: req.user?.id,
        content: req.body.content,
      });
      getIO().to(`chat:${req.params.conversationId}`).emit("chat:message:new", { message });
      return res.status(201).json(message);
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  readConversation = async (req: AuthRequest, res: Response) => {
    try {
      const useCase = new ReadConversationUseCase(this.chatRepository);
      const result = await useCase.execute(req.params.conversationId as string, req.user?.id as string);
      getIO().to(`chat:${req.params.conversationId}`).emit("chat:message:read", {
        conversationId: req.params.conversationId,
        userId: req.user?.id,
      });
      return res.json(result);
    } catch (error) {
      return handleControllerError(error, res);
    }
  };
}



