import { create } from 'zustand';

// 장바구니 상태를 관리하는 Zustand store
// Module Federation을 통해 모든 앱에서 동일한 store 인스턴스를 공유합니다
// - zustand가 shared로 설정되어 동일한 인스턴스 사용
// - store가 expose되어 모든 앱이 같은 store 참조
export const useCartStore = create((set, get) => ({
  // 장바구니 아이템 (key: productId, value: {product, quantity})
  items: {},

  // 장바구니에 아이템 추가
  addToCart: (product) => {
    set((state) => {
      const existingItem = state.items[product.id];

      if (existingItem) {
        // 이미 있으면 수량 증가
        return {
          items: {
            ...state.items,
            [product.id]: {
              ...existingItem,
              quantity: existingItem.quantity + 1,
            },
          },
        };
      } else {
        // 새로운 아이템 추가
        return {
          items: {
            ...state.items,
            [product.id]: {
              product,
              quantity: 1,
            },
          },
        };
      }
    });
  },

  // 수량 변경
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      // 수량이 0 이하면 제거
      set((state) => {
        const newItems = { ...state.items };
        delete newItems[productId];
        return { items: newItems };
      });
    } else {
      set((state) => ({
        items: {
          ...state.items,
          [productId]: {
            ...state.items[productId],
            quantity,
          },
        },
      }));
    }
  },

  // 아이템 제거
  removeFromCart: (productId) => {
    set((state) => {
      const newItems = { ...state.items };
      delete newItems[productId];
      return { items: newItems };
    });
  },

  // 장바구니 비우기
  clearCart: () => {
    set({ items: {} });
  },

  // 총 아이템 개수 계산
  getTotalItems: () => {
    const state = get();
    return Object.values(state.items).reduce(
      (total, item) => total + item.quantity,
      0
    );
  },

  // 총 가격 계산
  getTotalPrice: () => {
    const state = get();
    return Object.values(state.items).reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  },
}));
