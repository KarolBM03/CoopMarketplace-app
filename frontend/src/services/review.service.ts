import api from "../api/axios";

export const getProductReviews = async (productId: string) => {
  const response = await api.get(`/reviews/products/${productId}`);

  return response.data;
};

export const createProductReview = async (
  productId: string,
  data: {
    orderId?: string;
    rating: number;
    comment?: string;
  },
) => {
  const response = await api.post(`/reviews/products/${productId}`, data);

  return response.data;
};
