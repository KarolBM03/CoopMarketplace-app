import api from "../api/axios";
import type {
  CreateServiceRequestPayload,
  ServiceOffering,
  ServiceRequest,
  ServiceRequestStatus,
  UpdateServiceStatusPayload,
} from "../types/service.types";

export const createServiceRequest = async (
  payload: CreateServiceRequestPayload,
) => {
  const { data } = await api.post<ServiceRequest>("/services", payload);
  return data;
};

export const getServiceOfferings = async () => {
  const { data } = await api.get<ServiceOffering[]>("/services/catalog");
  return data;
};

export const createServiceOffering = async (payload: {
  category: string;
  name: string;
  description: string;
  estimatedTime?: string;
  estimatedPrice?: number;
  imageUrl?: string;
  city?: string;
}) => {
  const { data } = await api.post<ServiceOffering>(
    "/services/provider/offerings",
    payload,
  );
  return data;
};

export const getProviderServiceOfferings = async () => {
  const { data } = await api.get<ServiceOffering[]>(
    "/services/provider/offerings",
  );
  return data;
};

export const updateServiceOffering = async (
  offeringId: string,
  payload: Partial<ServiceOffering>,
) => {
  const { data } = await api.patch<ServiceOffering>(
    `/services/provider/offerings/${offeringId}`,
    payload,
  );
  return data;
};

export const getProviderServiceRequests = async () => {
  const { data } = await api.get<ServiceRequest[]>(
    "/services/provider/requests",
  );
  return data;
};

export const acceptProviderServiceRequest = async (requestId: string) => {
  const { data } = await api.post<ServiceRequest>(
    `/services/provider/requests/${requestId}/accept`,
  );
  return data;
};

export const updateProviderServiceRequestStatus = async (
  requestId: string,
  status: ServiceRequestStatus,
  amount?: number,
) => {
  const { data } = await api.patch<ServiceRequest>(
    `/services/provider/requests/${requestId}/status`,
    { status, amount },
  );
  return data;
};

export const getCustomerServiceRequests = async (customerId: string) => {
  const { data } = await api.get<ServiceRequest[]>(
    `/services/customer/${customerId}`,
  );
  return data;
};

export const getAdminServiceRequests = async () => {
  const { data } = await api.get<ServiceRequest[]>("/services/admin");
  return data;
};

export const updateServiceRequestStatus = async (
  requestId: string,
  payload: UpdateServiceStatusPayload,
) => {
  const { data } = await api.patch<ServiceRequest>(
    `/services/${requestId}/status`,
    payload,
  );
  return data;
};
