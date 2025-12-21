// Comment entity types
import { User } from './user';
import { Product } from './product';

export interface Comment {
  id: string;
  content: string;
  rating: number;
  images?: string[];
  userId: string;
  user?: User;
  productId: string;
  product?: Product;
  parentId?: string;
  parent?: Comment;
  replies?: Comment[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentsResponse {
  data: Comment[];
  total: number;
  page: number;
  limit: number;
}

