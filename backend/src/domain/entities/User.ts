export interface User {
  id: string;
  fullName: string;
  email: string;

  password: string;
  phone?: string | null;
  role: string;

  isBlocked: boolean;
  isVerified: boolean;
  refreshToken?: string | null;

  otpCode?: string | null;
  otpExpiresAt?: Date | null;

  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;

  acceptedTerms?: boolean;

  storeName?: string | null;
  mainCategory?: string | null;
  city?: string | null;
  documentId?: string | null;
  bankAccount?: string | null;
  identityImageUrl?: string | null;
  sellerStatus?: string | null;
  cooperativeMemberId?: string | null;
  memberNumber?: string | null;
  isCooperativeMember?: boolean;
  cooperativeStatus?: string | null;

  createdAt: Date;
  updatedAt: Date;
}



