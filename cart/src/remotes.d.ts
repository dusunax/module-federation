type Emotion = import('@shared/types/api').Emotion;
type Order = import('@shared/types/api').Order;

declare module 'products/cartStore' {
  export interface CartItem {
    id: number;
    product: Emotion;
    productId?: number;
    quantity: number;
    addedAt: number;
    eventCount: { combine: number };
  }

  interface CartState {
    items: Record<number, CartItem>;
    nextItemId: number;
    addToCart: (product: Emotion) => void;
    updateQuantity: (itemId: number, quantity: number) => void;
    removeFromCart: (itemId: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
  }

  export const useCartStore: (<T>(selector: (state: CartState) => T) => T) & {
    getState: () => CartState;
  };
}

declare module 'products/orderStore' {
  interface OrderState {
    orders: Order[];
    orderStatuses: Record<number, string>;
    updateOrderStatus: (productId: number, status: string) => void;
    updateAllOrderStatuses: (statuses: Record<number, string>) => void;
  }

  export const useOrderStore: (<T>(selector: (state: OrderState) => T) => T) & {
    getState: () => OrderState;
    setState: (partial: Partial<OrderState>) => void;
  };
}

declare module 'products/utils/statusStyle' {
  export const EMOTION_STATUS: {
    NOTICING: string;
    HELD: string;
    BEING_UNDERSTOOD: string;
    REMEMBERED: string;
    [key: string]: string;
  };
  export function getStatusConfig(status: string): {
    label: string;
    color: string;
    icon: string;
  };
}

declare module 'auth/rememberingStore' {
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

  interface RememberingState {
    rememberingItems: Record<string, RememberingItem>;
    loading: boolean;
    error: string | null;
    userId: string | null;
    initializeListener: (userId: string) => void;
    cleanup: () => void;
    startRemembering: (cartItemId: number, productInfo: ProductInfo, energyCost: number) => Promise<string>;
    startRememberingBatch: (items: Array<{ cartItemId: number; productInfo: ProductInfo; energyCost: number }>) => Promise<void>;
    cancelItemRemembering: (visibleItemId: string) => Promise<RememberingItem | null>;
    cancelAllRemembering: () => Promise<number>;
    completeItemRemembering: (visibleItemId: string) => Promise<RememberingItem | null>;
    getProgress: (visibleItemId: string) => number;
    getAllProgress: () => Record<string, { progress: number; startTime: number; energyCost: number; cartItemId: number }>;
  }

  export const useRememberingStore: (<T>(selector: (state: RememberingState) => T) => T) & {
    getState: () => RememberingState;
  };
}

declare module 'auth/authStore' {
  interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    plan: string;
    role: string;
  }

  interface AuthState {
    user: AuthUser | null;
    loading: boolean;
    error: string | null;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    initAuthListener: () => () => void;
    clearError: () => void;
  }

  export const useAuthStore: (<T>(selector: (state: AuthState) => T) => T) & {
    getState: () => AuthState;
  };
}

declare module 'auth/energyStore' {
  interface EnergyState {
    current: number;
    maxEnergy: number;
    loading: boolean;
    error: string | null;
    hasEnoughEnergy: (cost: number) => boolean;
    deductEnergy: (cost: number, count?: number) => Promise<number>;
    restoreEnergy: (amount: number, count?: number) => Promise<number>;
    clearEnergy: () => void;
  }

  export const useEnergyStore: (<T>(selector: (state: EnergyState) => T) => T) & {
    getState: () => EnergyState;
  };
}

declare module 'auth/services/orderService' {
  export function saveUserOrder(userId: string, order: Order): Promise<void>;
  export function subscribeToUserOrders(userId: string, onUpdate: (orders: Order[]) => void): () => void;
  export function deleteUserOrder(userId: string, orderId: string | number): Promise<void>;
  export function getRecentOrders(userId: string, count?: number): Promise<Order[]>;
}
