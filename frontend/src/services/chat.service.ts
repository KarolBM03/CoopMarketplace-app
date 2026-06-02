import api from "../api/axios";

export const createConversation = async (data: {
  sellerId: string;
  productId?: string;
}) => {
  const response = await api.post("/chat/conversations", data);
  return response.data;
};

export const getMyConversations = async () => {
  const response = await api.get("/chat/conversations");
  return response.data;
};

export const getConversationMessages = async (conversationId: string) => {
  const response = await api.get(
    `/chat/conversations/${conversationId}/messages`,
  );

  return response.data;
};

export const sendMessage = async (conversationId: string, content: string) => {
  const response = await api.post(
    `/chat/conversations/${conversationId}/messages`,
    {
      content,
    },
  );

  return response.data;
};

export const markAsRead = async (conversationId: string) => {
  const response = await api.patch(
    `/chat/conversations/${conversationId}/read`,
  );

  return response.data;
};
export const getAdminConversations = async () => {
  const response = await api.get("/chat/conversations/admin");
  return response.data;
};
