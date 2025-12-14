import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
}

interface FavoriteState {
  favorites: Product[];
  totalFavorites: number;

  // Actions
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
  setFavorites: (favorites: Product[]) => void;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favorites: [],
      totalFavorites: 0,

      addFavorite: (product) =>
        set((state) => {
          const exists = state.favorites.some((item) => item.id === product.id);
          if (exists) return state;

          return {
            favorites: [...state.favorites, product],
            totalFavorites: state.totalFavorites + 1,
          };
        }),

      removeFavorite: (productId) =>
        set((state) => ({
          favorites: state.favorites.filter((item) => item.id !== productId),
          totalFavorites: Math.max(0, state.totalFavorites - 1),
        })),

      isFavorite: (productId) => {
        const state = get();
        return state.favorites.some((item) => item.id === productId);
      },

      clearFavorites: () =>
        set({
          favorites: [],
          totalFavorites: 0,
        }),

      setFavorites: (favorites) =>
        set({
          favorites,
          totalFavorites: favorites.length,
        }),
    }),
    {
      name: 'favorite-storage',
    }
  )
);
