export interface Financing {
  id: string;
  customerId: string;
  productId: string;
  totalAmount: unknown;
  remainingDebt: unknown;
  months: number;
  monthlyPayment: unknown;
  status: string;
  currency: string;
  createdAt: Date;
}



