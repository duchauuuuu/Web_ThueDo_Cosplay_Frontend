// Favorite entity types
import { User } from './user';
import { Product } from './product';

export interface Favorite {
  id: string;
  userId: string;
  user?: User;
  productId: string;
  product?: Product;
  createdAt: string;
}

export interface FavoritesResponse {
  data: Favorite[];
  total: number;
  page: number;
  limit: number;
}

