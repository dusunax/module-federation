declare module 'auth/authStore' {
  type User = import('@shared/types/api').User;
  interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void> | void;
    initAuthListener: () => () => void;
    clearError: () => void;
  }

  export function useAuthStore(): AuthState;
  export function useAuthStore<T>(selector: (state: AuthState) => T): T;
  export const __setMockAuthState: (next: Partial<AuthState>) => void;
}

declare module 'auth/energyStore' {
  export const __setMockEnergyState: (next: Partial<{ current: number; maxEnergy: number }>) => void;
  export const useEnergyStore: () => { current: number; maxEnergy: number };
}

declare module 'auth/store/rememberingStore' {
  export interface ProductInfo {
    id: number;
    name: string;
    emoji: string;
    energyCost: number;
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

  export const useRememberingStore: ((selector?: (state: RememberingState) => unknown) => unknown) & {
    getState: () => RememberingState;
  };

  export const __setMockRememberingState: (next: { rememberingItems?: Record<string, RememberingItem> }) => void;
}

declare module 'products/cartStore' {
  export const __setMockCartState: (next: Partial<{ items: Record<string, { id: number; quantity: number }> }) => void;
  export const useCartStore: <T>(selector: (state: { items: Record<string, { id: number; quantity: number }> }) => T) => T;
}
