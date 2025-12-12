// Common shared types
export interface ApiResponse<T> {
  status: number;
  message?: string;
  data?: T;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  page: number;
  size?: number;
  totalPages?: number;
}

export interface Person {
  name: string;
  title: string;
  img: string;
}

