import api from "../api/axios";

interface OrderItem {
  productId: string;
  quantity: number;
}

export const createOrder = async (customerId: string, items: OrderItem[]) => {
  const response = await api.post("/orders", {
    customerId,
    items,
  });

  return response.data;
};

export const getCustomerOrders = async (customerId: string) => {
  const response = await api.get(`/orders/customer/${customerId}`);
  return response.data;
};

export const getSellerSales = async (sellerId: string) => {
  const response = await api.get(`/orders/seller/${sellerId}/sales`);
  return response.data;
};

export const completeOrder = async (orderId: string) => {
  const response = await api.patch(`/orders/${orderId}/complete`);
  return response.data;
};
