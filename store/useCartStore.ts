import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Pet } from '@/types/Pet';

export interface CartItem {
  pet: Pet;
  quantity: number;
  img: string | null;
}

interface CartStore {
  items: CartItem[];
  // Mini cart state
  isMiniCartOpen: boolean;
  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (petId: string) => void;
  updateQuantity: (petId: string, quantity: number) => void;
  clearCart: () => void;
  // Mini cart actions
  openMiniCart: () => void;
  closeMiniCart: () => void;
  toggleMiniCart: () => void;
  // Computed values
  getSubtotal: () => number;
  getTotalItems: () => number;
  getTotalSavings: () => number;
  getItemById: (petId: string) => CartItem | undefined;
  isInCart: (petId: string) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isMiniCartOpen: false,

      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find(cartItem => cartItem.pet.petId === item.pet.petId);

        if (existingItem) {
          // Nếu sản phẩm đã có trong giỏ, tăng số lượng
          set({
            items: items.map(cartItem =>
              cartItem.pet.petId === item.pet.petId
                ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                : cartItem
            ),
          });
        } else {
          // Nếu chưa có, thêm mới
          set({
            items: [...items, item],
          });
        }
      },

      removeItem: (petId) => {
        const { items } = get();
        set({
          items: items.filter(item => item.pet?.petId !== petId),
        });
      },

      updateQuantity: (petId, quantity) => {
        const { items } = get();
        if (quantity <= 0) {
          get().removeItem(petId);
          return;
        }

        set({
          items: items.map(item =>
            item.pet?.petId === petId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      openMiniCart: () => {
        set({ isMiniCartOpen: true });
      },

      closeMiniCart: () => {
        set({ isMiniCartOpen: false });
      },

      toggleMiniCart: () => {
        const { isMiniCartOpen } = get();
        set({ isMiniCartOpen: !isMiniCartOpen });
      },

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          if (!item.pet) return total;
          const price = item.pet.discountPrice || item.pet.price;
          return total + (price * item.quantity);
        }, 0);
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalSavings: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          if (!item.pet) return total;
          if (item.pet.discountPrice) {
            return total + ((item.pet.price - item.pet.discountPrice) * item.quantity);
          }
          return total;
        }, 0);
      },

      getItemById: (petId) => {
        const { items } = get();
        return items.find(item => item.pet?.petId === petId);
      },

      isInCart: (petId) => {
        const { items } = get();
        return items.some(item => item.pet?.petId === petId);
      },
    }),
    {
      name: 'cart-storage', // Tên key trong localStorage
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
export const useCart = () => {
  const items = useCartStore((state) => state.items);
  const isMiniCartOpen = useCartStore((state) => state.isMiniCartOpen);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const openMiniCart = useCartStore((state) => state.openMiniCart);
  const closeMiniCart = useCartStore((state) => state.closeMiniCart);
  const toggleMiniCart = useCartStore((state) => state.toggleMiniCart);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const getTotalSavings = useCartStore((state) => state.getTotalSavings);
  const getItemById = useCartStore((state) => state.getItemById);
  const isInCart = useCartStore((state) => state.isInCart);

  // Computed values để dễ sử dụng
  const subtotal = getSubtotal();
  const totalItems = getTotalItems();
  const totalSavings = getTotalSavings();

  // Helper functions
  const calculateItemTotal = (item: CartItem) => {
    if (!item.pet) return 0;
    const price = item.pet.discountPrice || item.pet.price;
    return price * item.quantity;
  };

  const calculateItemSavings = (item: CartItem) => {
    if (!item.pet) return 0;
    if (item.pet.discountPrice) {
      return (item.pet.price - item.pet.discountPrice) * item.quantity;
    }
    return 0;
  };

  return {
    // State
    items,
    isMiniCartOpen,
    subtotal,
    totalItems,
    totalSavings,
    
    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    
    // Mini cart actions
    openMiniCart,
    closeMiniCart,
    toggleMiniCart,
    
    // Getters
    getItemById,
    isInCart,
    
    // Helper functions
    calculateItemTotal,
    calculateItemSavings,
  };
};

