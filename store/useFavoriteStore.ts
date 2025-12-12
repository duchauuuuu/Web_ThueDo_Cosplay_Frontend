import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Pet } from '@/types/Pet';

export interface FavoriteItem {
  pet: Pet;
  img: string | null;
  addedAt: string; // Thời gian thêm vào danh sách yêu thích
}

interface FavoriteStore {
  items: FavoriteItem[];
  // Actions
  addItem: (item: Omit<FavoriteItem, 'addedAt'>) => void;
  removeItem: (petId: string) => void;
  clearFavorites: () => void;
  // Computed values
  getTotalItems: () => number;
  getItemById: (petId: string) => FavoriteItem | undefined;
  isFavorite: (petId: string) => boolean;
}

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find(favItem => favItem.pet.petId === item.pet.petId);

        if (!existingItem) {
          // Chỉ thêm nếu chưa có trong danh sách yêu thích
          set({
            items: [...items, { ...item, addedAt: new Date().toISOString() }],
          });
        }
      },

      removeItem: (petId) => {
        const { items } = get();
        set({
          items: items.filter(item => item.pet?.petId !== petId),
        });
      },

      clearFavorites: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        const { items } = get();
        return items.length;
      },

      getItemById: (petId) => {
        const { items } = get();
        return items.find(item => item.pet?.petId === petId);
      },

      isFavorite: (petId) => {
        const { items } = get();
        return items.some(item => item.pet?.petId === petId);
      },
    }),
    {
      name: 'favorite-storage', // Tên key trong localStorage
      storage: createJSONStorage(() => localStorage), // Sử dụng localStorage
      // Thêm onRehydrateStorage để clean up dữ liệu không hợp lệ
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Lọc bỏ các items không có pet
          state.items = state.items.filter(item => item.pet && item.pet.petId);
        }
      },
    }
  )
);

// Export hook đơn giản để sử dụng
export const useFavorite = () => {
  const items = useFavoriteStore((state) => state.items);
  const addItem = useFavoriteStore((state) => state.addItem);
  const removeItem = useFavoriteStore((state) => state.removeItem);
  const clearFavorites = useFavoriteStore((state) => state.clearFavorites);
  const getTotalItems = useFavoriteStore((state) => state.getTotalItems);
  const getItemById = useFavoriteStore((state) => state.getItemById);
  const isFavorite = useFavoriteStore((state) => state.isFavorite);

  // Computed values để dễ sử dụng
  const totalItems = getTotalItems();

  // Helper functions
  const formatAddedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return {
    // State
    items,
    totalItems,
    
    // Actions
    addItem,
    removeItem,
    clearFavorites,
    
    // Getters
    getItemById,
    isFavorite,
    
    // Helper functions
    formatAddedDate,
  };
};

