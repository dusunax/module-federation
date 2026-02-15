declare module 'auth/services/emotionService' {
  export type VisibilityCondition = import('@shared/types/api').VisibilityCondition;
  export type Emotion = import('@shared/types/api').Emotion;

  export const __setMockEmotions: (next: Emotion[]) => void;
  export const __setMockEmotionById: (next: Emotion | null) => void;
  export function getAllEmotions(search?: string): Promise<Emotion[]>;
  export function getEmotionById(id: number): Promise<Emotion>;
}

declare module 'auth/authStore' {
  type User = import('@shared/types/api').User;

  interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    initAuthListener: () => () => void;
    clearError: () => void;
  }

  export function useAuthStore(): AuthState;
  export function useAuthStore<T>(selector: (state: AuthState) => T): T;
}

declare module 'auth/services/orderService' {
  export type Order = import('@shared/types/api').Order;

  export function subscribeToUserOrders(userId: string, onUpdate: (orders: Order[]) => void): () => void;
  export function updateOrderItemEventCount(
    userId: string,
    orderId: string | number,
    itemId: number,
    eventCount: { combine: number },
  ): Promise<void>;
  export function updateOrderItemFields(
    userId: string,
    orderId: string | number,
    itemId: number,
    fields: {
      eventCount?: { combine: number };
      productIntensity?: 'low' | 'middle' | 'high';
      removeProductRarity?: boolean;
    },
  ): Promise<void>;
}

declare module 'auth/store/rememberingStore' {
  export interface ProductInfo {
    id?: number;
    name?: string;
    emoji?: string;
    energyCost?: number;
  }

  export interface RememberingItem {
    visibleItemId: string;
    cartItemId: number;
    productInfo: ProductInfo;
    startTime: number;
    duration: number;
    energyCost: number;
    status: string;
  }
}

declare module 'auth/rememberingStore' {
  import { RememberingItem } from 'auth/store/rememberingStore';

  export interface RememberingState {
    rememberingItems: Record<string, RememberingItem>;
    loading: boolean;
    error: string | null;
    userId: string | null;
    unsubscribe: unknown | null;
    initializeListener: (userId: string) => void;
    cleanup: () => void;
    startRemembering: (cartItemId: number, productInfo: any, energyCost: number) => Promise<string>;
    startRememberingBatch: (items: Array<{ cartItemId: number; productInfo: any; energyCost: number }>) => Promise<void>;
    cancelItemRemembering: (visibleItemId: string) => Promise<RememberingItem | null>;
    cancelAllRemembering: () => Promise<number>;
    completeItemRemembering: (visibleItemId: string) => Promise<RememberingItem | null>;
    getProgress: (visibleItemId: string) => number;
    getAllProgress: () => Record<string, { progress: number; startTime: number; energyCost: number; cartItemId: number }>;
  }

  export const __setMockRememberingState: (next: { rememberingItems?: Record<string, RememberingItem> }) => void;
  export const useRememberingStore: ((selector?: (state: RememberingState) => unknown) => unknown) & {
    getState: () => RememberingState;
  };
}
