declare module 'header/Header' {
  const Header: React.ComponentType;
  export default Header;
}

declare module 'products/ProductList' {
  const ProductList: React.ComponentType;
  export default ProductList;
}

declare module 'products/ProductDetail' {
  const ProductDetail: React.ComponentType;
  export default ProductDetail;
}

declare module 'cart/Cart' {
  const Cart: React.ComponentType;
  export default Cart;
}

declare module 'cart/features/remembering/hooks/useRememberProgress' {
  export function useRememberProgress(): void;
}

declare module 'cart/features/remembering/hooks/useRememberingSync' {
  export function useRememberingSync(): void;
}

declare module 'archive/OrderList' {
  const OrderList: React.ComponentType;
  export default OrderList;
}

declare module 'archive/OrderDetail' {
  const OrderDetail: React.ComponentType;
  export default OrderDetail;
}

declare module 'archive/EmotionCollection' {
  const EmotionCollection: React.ComponentType;
  export default EmotionCollection;
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

declare module 'auth/energyStore' {
  type DailyUsage = import('@shared/types/api').DailyUsage;
  type Order = import('@shared/types/api').Order;

  interface EnergyState {
    current: number;
    maxEnergy: number;
    lastResetDate: string | null;
    loading: boolean;
    error: string | null;
    userId: string | null;
    initializeEnergy: (userId: string, plan?: string) => Promise<void>;
    hasEnoughEnergy: (cost: number) => boolean;
    deductEnergy: (cost: number, count?: number) => Promise<number>;
    restoreEnergy: (amount: number, count?: number) => Promise<number>;
    clearEnergy: () => void;
    resetEnergy: () => Promise<void>;
    fetchDailyUsage: (days?: number) => Promise<DailyUsage[]>;
    fetchRecentOrders: (count?: number) => Promise<Order[]>;
  }

  export function useEnergyStore(): EnergyState;
  export function useEnergyStore<T>(selector: (state: EnergyState) => T): T;
}

declare module 'auth/services/emotionService' {
  type Emotion = import('@shared/types/api').Emotion;

  interface GetAllEmotionsOptions {
    includeAll?: boolean;
  }

  export function getAllEmotions(searchTerm?: string, options?: GetAllEmotionsOptions): Promise<Emotion[]>;
  export function getEmotionById(id: number): Promise<Emotion | null>;
  export function createEmotion(data: Omit<Emotion, 'energyCost'>): Promise<void>;
  export function updateEmotion(id: number, data: Partial<Omit<Emotion, 'energyCost'>>): Promise<void>;
}

declare module 'auth/services/seedService' {
  export function isEmotionsCollectionEmpty(): Promise<boolean>;
  export function seedEmotions(): Promise<number>;
}

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
