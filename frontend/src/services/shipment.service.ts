import api from "../api/axios";

export type ShipmentStatus =
  | "PENDING_PREPARATION"
  | "PREPARING"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED"
  | "FAILED";

export const getSellerShipments = async () => {
  const response = await api.get("/shipments/seller/me");
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

export const startShipmentTracking = async (shipmentId: string) => {
  const response = await api.patch(`/shipments/${shipmentId}/tracking/start`);
  return response.data;
};

export const updateShipmentLocation = async (
  shipmentId: string,
  lat: number,
  lng: number,
) => {
  const response = await api.patch(`/shipments/${shipmentId}/tracking/location`, {
    lat,
    lng,
  });

  return response.data;
};

export const stopShipmentTracking = async (shipmentId: string) => {
  const response = await api.patch(`/shipments/${shipmentId}/tracking/stop`);
  return response.data;
};
