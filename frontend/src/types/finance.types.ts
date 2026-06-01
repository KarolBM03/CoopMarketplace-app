import type { Product } from "./product.types";
import type { User } from "./auth.types";

export type FinancingStatus =
  | "PENDING"
  | "SENT_TO_COOPERATIVE"
  | "UNDER_REVIEW"
  | "APPROVED_BY_COOPERATIVE"
  | "COUNTER_OFFER"
  | "CUSTOMER_ACCEPTED"
  | "WAITING_COOPERATIVE_PAYMENT"
  | "ACTIVE"
  | "REJECTED"
  | "COMPLETED"
  | "LATE";

export interface Installment {
  id: string;
  financingId: string;
  number: number;
  amount: number;
  dueDate: string;
  paid: boolean;
  paidAt?: string | null;
  status: "PENDING" | "PAID" | "OVERDUE" | string;
}

export interface Financing {
  id: string;
  customerId: string;
  productId: string;
  cedula?: string | null;
  income?: number | null;
  company?: string | null;
  phone?: string | null;
  address?: string | null;
  totalAmount: number;
  downPayment: number;
  remainingDebt: number;
  months: number;
  monthlyPayment: number;
  status: FinancingStatus;
  externalLoanId?: string | null;
  externalStatus?: string | null;
  externalReference?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  product: Product;
  customer?: Pick<User, "id" | "fullName" | "email">;
  installments: Installment[];
  counterOffer?: any;
}

export interface OrderItem {
  id?: string;
  orderId?: string;
  productId: string;
  quantity: number;
  price?: number;
  product?: Product;
}

export interface Order {
  id: string;
  customerId: string;
  totalAmount: number;
  status:
    | "PENDING"
    | "PAID"
    | "PREPARING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "COMPLETED";
  createdAt: string;
  items: OrderItem[];
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  frozenBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: "PAYMENT" | "REFUND" | "DEPOSIT";
  status: "PENDING" | "SUCCESS" | "FAILED";
  reference?: string | null;
  description?: string | null;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AdminMetrics {
  users: number;
  products: number;
  orders: number;
  paidOrders: number;
  completedOrders: number;
  financings: number;
  activeFinancings: number;
  lateFinancings: number;
  totalTransactionAmount: number;
  unresolvedFraudAlerts: number;
}
