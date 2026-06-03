export interface Order {
  id: string;

  customerId: string;
  totalAmount: any;

  status: string;
  currency: string;

  externalPaymentId?: string | null;
  externalReference?: string | null;
  externalStatus?: string | null;

  cooperativeResponse?: any;

  createdAt: Date;
  updatedAt?: Date;
}
