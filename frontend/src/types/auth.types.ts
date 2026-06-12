export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: "CUSTOMER" | "SELLER" | "SERVICE_PROVIDER" | "ADMIN";
  sellerStatus?: "PENDING" | "APPROVED" | "REJECTED";
  storeName?: string | null;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
