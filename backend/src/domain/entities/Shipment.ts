export interface Shipment {
  id: string;
  orderId: string;
  sellerId: string;
  customerId: string;
  status: string;
  trackingNumber?: string | null;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  isTracking: boolean;
  createdAt: Date;
  updatedAt: Date;
}



