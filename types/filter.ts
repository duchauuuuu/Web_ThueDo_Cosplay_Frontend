// Filter related types
export interface PriceRangeFilterProps {
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  maxPrice?: number;
  minPrice?: number;
}

