// Filter related types
export interface Category {
  name: string;
  count: number;
}

export interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export interface PriceRangeFilterProps {
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  maxPrice?: number;
  minPrice?: number;
}

