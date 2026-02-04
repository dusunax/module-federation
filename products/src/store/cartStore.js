import { create } from 'zustand';
import { useRememberingStore } from 'auth/rememberingStore';
import { getAllEmotions } from 'auth/services/emotionService';

// Simple cookie helpers (no external deps)
function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[2]));
  } catch (e) {
    return null;
  }
}

function writeCookie(name, value, days = 30) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const v = encodeURIComponent(JSON.stringify(value));
  document.cookie = `${name}=${v}; expires=${expires}; path=/; samesite=lax`;
}

const CART_COOKIE = 'sentimo_cart_v1';

function minimalFromItems(items) {
  // items: { [id]: { id, product?, quantity, addedAt } }
  return Object.values(items).map((it) => ({
    id: it.id,
    productId: it.product?.id ?? it.productId ?? null,
    quantity: it.quantity,
    addedAt: it.addedAt,
  }));
}

async function itemsFromMinimal(minimal) {
  let emotions = [];
  try {
    emotions = await getAllEmotions();
  } catch {
    // Firestore unavailable — fall back to id-only products
  }
  const emotionMap = new Map(emotions.map((e) => [Number(e.id), e]));

  const items = {};
  let nextId = 1;
  minimal.forEach((m) => {
    const id = m.id ?? nextId++;
    const productSnapshot = emotionMap.get(Number(m.productId));
    items[id] = {
      id,
      product: productSnapshot
        ? { ...productSnapshot }
        : m.productId
          ? { id: m.productId }
          : undefined,
      productId: m.productId ?? undefined,
      quantity: m.quantity || 1,
      addedAt: m.addedAt || Date.now(),
    };
  });
  return { items, nextItemId: Object.keys(items).reduce((n, k) => Math.max(n, Number(k)), 0) + 1 };
}

// 장바구니 상태를 관리하는 Zustand store
// Module Federation을 통해 모든 앱에서 동일한 store 인스턴스를 공유합니다
// - zustand가 shared로 설정되어 동일한 인스턴스 사용
// - store가 expose되어 모든 앱이 같은 store 참조
export const useCartStore = create((set, get) => ({
  // 장바구니 아이템 (key: itemId, value: {id, product, quantity, addedAt})
  // 각 아이템은 고유한 ID를 가져서 같은 productId를 가진 여러 아이템을 저장할 수 있음
  items: {},
  nextItemId: 1,

  // Rehydrate from cookie on init
  __rehydrate: async () => {
    try {
      const minimal = readCookie(CART_COOKIE) || [];
      if (minimal && minimal.length > 0) {
        const { items, nextItemId } = await itemsFromMinimal(minimal);
        set({ items, nextItemId });
      }
    } catch (e) {
      // ignore
    }
  },

  addToCart: (product) => {
    set((state) => {
      const rememberingState = useRememberingStore.getState();
      const rememberingItemIds = Object.keys(rememberingState.rememberingItems).map(Number);

      const existingNormalItem = Object.values(state.items).find(
        (item) => item.product.id === product.id && !rememberingItemIds.includes(item.id)
      );

      if (existingNormalItem) {
        return {
          items: {
            ...state.items,
            [existingNormalItem.id]: {
              ...existingNormalItem,
              quantity: existingNormalItem.quantity + 1,
              addedAt: Date.now(),
            },
          },
          // persist minimal
          nextItemId: state.nextItemId,
        };
      } else {
        const newItemId = state.nextItemId;
        const next = {
          items: {
            ...state.items,
            [newItemId]: {
              id: newItemId,
              product,
              quantity: 1,
              addedAt: Date.now(),
            },
          },
          nextItemId: state.nextItemId + 1,
        };

        // persist minimal representation to cookie
        try {
          const minimal = minimalFromItems(next.items);
          writeCookie(CART_COOKIE, minimal);
        } catch (e) {
          // ignore cookie write failures
        }

        return next;
      }
    });
    // persist current minimal state after mutation
    try {
      const minimal = minimalFromItems(get().items);
      writeCookie(CART_COOKIE, minimal);
    } catch (e) {}
  },

  // 수량 변경 (itemId 사용)
  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      // 수량이 0 이하면 제거 및 쿠키에 반영
      set((state) => {
        const newItems = { ...state.items };
        delete newItems[itemId];
        try {
          const minimal = minimalFromItems(newItems);
          writeCookie(CART_COOKIE, minimal);
        } catch (e) {}
        return { items: newItems };
      });
    } else {
      set((state) => {
        const existingItem = state.items[itemId];
        if (!existingItem) return state;

        const isIncreasing = quantity > existingItem.quantity;

        const nextState = {
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

        try {
          const minimal = minimalFromItems(nextState.items);
          writeCookie(CART_COOKIE, minimal);
        } catch (e) {}

        return nextState;
      });
    }
  },

  // 아이템 제거 (itemId 사용)
  removeFromCart: (itemId) => {
    set((state) => {
      const newItems = { ...state.items };
      delete newItems[itemId];
      try {
        const minimal = minimalFromItems(newItems);
        writeCookie(CART_COOKIE, minimal);
      } catch (e) {}
      return { items: newItems };
    });
  },

  // 장바구니 비우기
  clearCart: () => {
    set({ items: {} });
    try {
      writeCookie(CART_COOKIE, []);
    } catch (e) {}
  },

  // 총 아이템 개수 계산
  getTotalItems: () => {
    const state = get();
    return Object.values(state.items).reduce((total, item) => total + item.quantity, 0);
  },
}));

// Rehydrate from cookie on module load (client-side only)
try {
  const state = useCartStore.getState();
  if (typeof window !== 'undefined' && state && typeof state.__rehydrate === 'function') {
    state.__rehydrate();
  }
} catch (e) {
  // ignore
}
