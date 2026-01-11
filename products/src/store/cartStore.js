import { create } from 'zustand';
import { useOrderStore } from './orderStore';

// 장바구니 상태를 관리하는 Zustand store
// Module Federation을 통해 모든 앱에서 동일한 store 인스턴스를 공유합니다
// - zustand가 shared로 설정되어 동일한 인스턴스 사용
// - store가 expose되어 모든 앱이 같은 store 참조
export const useCartStore = create((set, get) => ({
  // 장바구니 아이템 (key: itemId, value: {id, product, quantity, addedAt})
  // 각 아이템은 고유한 ID를 가져서 같은 productId를 가진 여러 아이템을 저장할 수 있음
  items: {},
  nextItemId: 1, // 다음 아이템 ID

  // 장바구니에 아이템 추가
  addToCart: (product) => {
    set((state) => {
      // orderStore에서 기억하는 중인 아이템 ID 목록 확인
      const orderState = useOrderStore.getState();
      const rememberingItemIds = orderState.rememberingItemIds;
      
      // 같은 productId를 가진 아이템 중 기억하는 중이 아닌 아이템 찾기
      const existingNormalItem = Object.values(state.items).find(
        (item) => item.product.id === product.id && !rememberingItemIds.includes(item.id)
      );

      if (existingNormalItem) {
        // 이미 있고, 기억하는 중이 아니면 수량 증가 (마지막 추가 시점으로 업데이트)
        return {
          items: {
            ...state.items,
            [existingNormalItem.id]: {
              ...existingNormalItem,
              quantity: existingNormalItem.quantity + 1,
              addedAt: Date.now(), // 마지막 추가 시점으로 업데이트
            },
          },
        };
      } else {
        // 새로운 아이템 추가 (기억하는 중인 아이템을 다시 담는 경우도 포함)
        const newItemId = state.nextItemId;
        return {
          items: {
            ...state.items,
            [newItemId]: {
              id: newItemId,
              product,
              quantity: 1,
              addedAt: Date.now(), // 장바구니에 추가된 시간
            },
          },
          nextItemId: state.nextItemId + 1,
        };
      }
    });
  },

  // 수량 변경 (itemId 사용)
  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      // 수량이 0 이하면 제거
      set((state) => {
        const newItems = { ...state.items };
        delete newItems[itemId];
        return { items: newItems };
      });
    } else {
      set((state) => {
        const existingItem = state.items[itemId];
        if (!existingItem) return state;
        
        const isIncreasing = quantity > existingItem.quantity;
        
        return {
          items: {
            ...state.items,
            [itemId]: {
              ...existingItem,
              quantity,
              // 수량이 증가할 때만 마지막 추가 시점으로 업데이트
              ...(isIncreasing && { addedAt: Date.now() }),
            },
          },
        };
      });
    }
  },

  // 아이템 제거 (itemId 사용)
  removeFromCart: (itemId) => {
    set((state) => {
      const newItems = { ...state.items };
      delete newItems[itemId];
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
