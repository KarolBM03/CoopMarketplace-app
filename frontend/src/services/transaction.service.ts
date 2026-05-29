import api from "../api/axios";

export const getTransactionsByUser = async (userId: string) => {
  const response = await api.get(`/transactions/user/${userId}`);
  return response.data;
};
