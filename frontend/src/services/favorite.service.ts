import api from "../api/axios";

export const addFavorite = async (productId: string) => {
  const response = await api.post(`/favorites/${productId}`);
  return response.data;
};

export const removeFavorite = async (productId: string) => {
  const response = await api.delete(`/favorites/${productId}`);
  return response.data;
};

export const getMyFavorites = async () => {
  const response = await api.get("/favorites/me");
  return response.data;
};
