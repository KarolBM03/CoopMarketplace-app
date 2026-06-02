export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  isFinanced: boolean;
  isActive?: boolean;
  category: string;

  seller?: {
    id: string;
    fullName?: string;
    storeName?: string;
  };
}
