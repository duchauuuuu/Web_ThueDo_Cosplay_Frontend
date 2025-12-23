// Category types
import { Product } from './product';

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  products?: Product[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithCount extends Category {
  productCount?: number;
}

// Category filter component props
export interface CategoryFilterProps {
  categories: Array<{
    name: string;
    count: number;
  }>;
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}
