export interface Conversation {
  id: string;
  buyerId: string;
  sellerId: string;
  productId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}



