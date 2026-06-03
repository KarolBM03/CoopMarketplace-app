import api from "../api/axios";
import type { Product } from "../types/product.types";

export const getProducts = async (
  page = 1,
  limit = 12,
  search = "",
  category = "",
  minPrice?: number,
  maxPrice?: number,
  sort = "newest",
) => {
  const response = await api.get("/products", {
    params: {
      page,
      limit,
      search,
      category,
      minPrice,
      maxPrice,
      sort,
    },
  });

  return response.data;
};
export const getProductById = async (id: string): Promise<Product> => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (data: {
  title: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  isFinanced: boolean;
  sellerId: string;
  category: string;
}) => {
  const response = await api.post("/products", data);
  return response.data;
};

export const getSellerProducts = async () => {
  const response = await api.get(`/products/seller/my-products`);
  return response.data;
};

export const deleteProduct = async (productId: string) => {
  const response = await api.delete(`/products/${productId}`);
  return response.data;
};

export const updateProduct = async (
  productId: string,
  data: {
    title: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string;
    isFinanced: boolean;
    category: string;
  },
) => {
  const response = await api.patch(`/products/${productId}`, data);

  return response.data;
};
