// ProductImage entity types
export interface ProductImage {
  id: string;
  url: string;
  publicId?: string;
  alt?: string;
  order: number;
  isActive: boolean;
  productId: string;
  createdAt: string;
}

