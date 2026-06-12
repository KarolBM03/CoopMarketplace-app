export type ServiceCategory =
  | "DELIVERY"
  | "TOWING"
  | "MOVING"
  | "TECHNICAL"
  | "OTHER";

export type ServiceRequestStatus =
  | "PENDING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface ServiceRequest {
  id: string;
  customerId?: string;
  providerId?: string | null;
  orderId?: string | null;
  category: ServiceCategory;
  title: string;
  description: string;
  pickupAddress?: string | null;
  deliveryAddress?: string | null;
  city?: string | null;
  province?: string | null;
  photoUrl?: string | null;
  amount?: number | null;
  providerExternalId?: string | null;
  providerName?: string | null;
  status: ServiceRequestStatus;
  createdAt: string;
  updatedAt?: string;
  customer?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    role?: "CUSTOMER" | "SELLER" | "SERVICE_PROVIDER" | "ADMIN";
  };
  provider?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    storeName?: string | null;
    mainCategory?: string | null;
    city?: string | null;
  } | null;
  serviceOffering?: ServiceOffering | null;
}

export interface ServiceOffering {
  id: string;
  providerId: string;
  category: ServiceCategory;
  name: string;
  description: string;
  estimatedTime?: string | null;
  estimatedPrice?: number | null;
  imageUrl?: string | null;
  city?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  provider?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    storeName?: string | null;
    mainCategory?: string | null;
    city?: string | null;
  };
}

export interface CreateServiceRequestPayload {
  customerId: string;
  category: ServiceCategory;
  title: string;
  description: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  city?: string;
  province?: string;
  amount?: number;
  serviceOfferingId?: string;
}

export interface UpdateServiceStatusPayload {
  status: ServiceRequestStatus;
  providerExternalId?: string;
  providerName?: string;
  amount?: number;
}

export interface ServiceCatalogItem {
  id?: string;
  category: ServiceCategory;
  name: string;
  description: string;
  estimatedTime: string;
  estimatedPrice: string;
  imageUrl: string;
  providerName?: string;
}
