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

export const getMyOrders = async () => {
  const response = await api.get("/orders/customer/me");
  return response.data;
};

export const getCustomerOrders = async (customerId: string) => {
  const response = await api.get(`/orders/customer/${customerId}`);
  return response.data;
};

export const getSellerSales = async (sellerId?: string) => {
  const path = sellerId
    ? `/orders/seller/${sellerId}/sales`
    : "/orders/seller/me/sales";

  const response = await api.get(path);
  return response.data;
};

export const getOrderCooperativePaymentLink = async (orderId: string) => {
  const response = await api.post(
    `/orders/${orderId}/cooperative-payment-link`,
  );
  return response.data as { paymentUrl: string };
};
