import api from "../api/axios";

export type ShipmentStatus =
  | "PENDING_PREPARATION"
  | "PREPARING"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED"
  | "FAILED";

export const getSellerShipments = async (sellerId: string) => {
  const response = await api.get(`/shipments/seller/${sellerId}`);
  return response.data;
};

export const getCustomerShipments = async (customerId: string) => {
  const response = await api.get(`/shipments/customer/${customerId}`);
  return response.data;
};

export const getAdminShipments = async () => {
  const response = await api.get("/shipments/admin");
  return response.data;
};

export const createShipmentForOrder = async (orderId: string, data?: any) => {
  const response = await api.post(`/shipments/order/${orderId}`, data || {});
  return response.data;
};

export const updateShipmentStatus = async (
  shipmentId: string,
  status: ShipmentStatus,
) => {
  const response = await api.patch(`/shipments/${shipmentId}/status`, {
    status,
  });

  return response.data;
};
