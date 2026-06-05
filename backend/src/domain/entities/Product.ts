export interface Product {
  id: string;
  title: string;
  description: string;
  price: any;
  currency: string;
  stock: number;
  imageUrl?: string | null;
  sellerId: string;
  category: string;
  isActive: boolean;
  isFinanced: boolean;
  views: number;
  salesCount: number;
  rankingScore: number;
  createdAt: Date;
  updatedAt: Date;
  seller?: {
    id: string;
    fullName: string;
    storeName?: string | null;
  };
}



