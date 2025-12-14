const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export interface FavoriteProduct {
  id: string;
  productId: string;
  userId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    price: number;
    categoryId?: string;
    images?: string[];
    productImages?: Array<{
      id: string;
      url: string;
      order: number;
      isActive: boolean;
    }>;
    category?: {
      id: string;
      name: string;
    };
  };
}

export const favoritesAPI = {
  // Toggle favorite (add/remove)
  toggle: async (productId: string, token: string): Promise<{ message: string; action: 'Added' | 'Removed' }> => {
    const response = await fetch(`${API_URL}/favorites/toggle/${productId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Thao tác thất bại');
    }

    const data = await response.json();
    return data.data || data;
  },

  // Get all favorites
  getAll: async (token: string): Promise<FavoriteProduct[]> => {
    const response = await fetch(`${API_URL}/favorites`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể tải danh sách yêu thích');
    }

    return response.json();
  },

  // Remove favorite
  remove: async (productId: string, token: string): Promise<void> => {
    const response = await fetch(`${API_URL}/favorites/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Xóa thất bại');
    }
  },
};

