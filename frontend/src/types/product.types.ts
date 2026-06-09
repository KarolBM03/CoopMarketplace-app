export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  isFinanced: boolean;
  isActive?: boolean;
  ratingAverage?: number;
  ratingCount?: number;
  rankingScore?: number;
  category: string;
  favorites?: any[];
  sellerId?: string;

  seller?: {
    id: string;
    fullName?: string;
    storeName?: string;
  };
}
