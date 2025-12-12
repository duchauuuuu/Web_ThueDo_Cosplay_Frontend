// Product related types
export interface ProductItem {
  id: number;
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
  onAddToCart?: (id: string | number) => void;
  onFavorite?: (id: string | number) => void;
  onView?: (id: string | number) => void;
};

