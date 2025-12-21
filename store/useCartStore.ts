import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: number | string;
  name: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  // Mini cart state
  isMiniCartOpen: boolean;
  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
  // Mini cart actions
  openMiniCart: () => void;
  closeMiniCart: () => void;
  toggleMiniCart: () => void;
  // Computed values
  getSubtotal: () => number;
  getTotalItems: () => number;
  getTotalSavings: () => number;
  getItemById: (productId: string | number) => CartItem | undefined;
  isInCart: (productId: string | number) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isMiniCartOpen: false,

      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find(cartItem => cartItem.id === item.id);

        if (existingItem) {
          // Nếu sản phẩm đã có trong giỏ, tăng số lượng
          set({
            items: items.map(cartItem =>
              cartItem.id === item.id
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

      removeItem: (productId) => {
        const { items } = get();
        set({
          items: items.filter(item => item.id !== productId),
        });
      },

      updateQuantity: (productId, quantity) => {
        const { items } = get();
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: items.map(item =>
            item.id === productId ? { ...item, quantity } : item
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
          return total + (item.salePrice * item.quantity);
        }, 0);
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalSavings: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const savings = item.originalPrice - item.salePrice;
          return total + (savings * item.quantity);
        }, 0);
      },

      getItemById: (productId) => {
        const { items } = get();
        return items.find(item => item.id === productId);
      },

      isInCart: (productId) => {
        const { items } = get();
        return items.some(item => item.id === productId);
      },
    }),
    {
      name: 'cart-storage', // Tên key trong localStorage
      storage: createJSONStorage(() => localStorage), // Sử dụng localStorage
      // Thêm onRehydrateStorage để clean up dữ liệu không hợp lệ
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Lọc bỏ các items không có id
          state.items = state.items.filter(item => item.id);
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
    return item.salePrice * item.quantity;
  };

  const calculateItemSavings = (item: CartItem) => {
    return (item.originalPrice - item.salePrice) * item.quantity;
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

