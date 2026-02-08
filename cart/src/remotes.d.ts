declare module 'products/cartStore' {
  export interface CartItem {
    id: number;
    product: { id: number; name?: string; emoji?: string; energyCost?: number; productId?: number };
    productId?: number;
    quantity: number;
    addedAt: number;
  }

  export const useCartStore: <T>(selector: (state: { items: Record<number, CartItem> }) => T) => T;
}

declare module 'products/utils/statusStyle' {
  export const EMOTION_STATUS: {
    HELD: string;
    NOTICING: string;
    [key: string]: string;
  };
  export function getStatusConfig(status: string): {
    label: string;
    color: string;
    icon: string;
  };
}

declare module 'auth/rememberingStore' {
  export const useRememberingStore: <T>(selector: (state: { rememberingItems: Record<number, { id: number }> }) => T) => T;
}

declare module 'auth/authStore' {
  export const useAuthStore: <T>(selector: (state: { user: unknown }) => T) => T;
}

declare module 'auth/energyStore' {
  export const useEnergyStore: <T>(selector: (state: { current: number }) => T) => T;
}

declare module 'auth/store/rememberingStore' {
  export interface RememberingItem {
    id: number;
    visibleItemId: string;
    cartItemId: number;
    productInfo: ProductInfo;
    startTime: number;
    duration: number;
    energyCost: number;
    status: string;
  }
}