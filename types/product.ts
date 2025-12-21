// Product types
import { ProductCategory } from './category';
import { ProductImage } from './product-image';

// Frontend UI types
export interface ProductItem {
  id: string | number;
  title: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  hoverImage?: string;
  discount?: number;
}

export type ProductCardProps = {
  id: string | number;
  title: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  hoverImage?: string;
  discount?: number;
  className?: string;
  isFavorite?: boolean;
  onAddToCart?: (id: string | number) => void;
  onFavorite?: (id: string | number) => void;
  onView?: (id: string | number) => void;
};

// Backend entity types
export interface Product {
  id: string;
  name: string;
  description?: string;
  images?: string[];
  price: number;
  discountPrice?: number;
  quantity: number;
  size?: string;
  color?: string;
  brand?: string;
  isAvailable: boolean;
  isActive: boolean;
  categoryId: string;
  category?: ProductCategory;
  productImages?: ProductImage[];
  averageRating?: number; // Added: Dynamic rating from comments
  reviewCount?: number; // Added: Count of reviews
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

