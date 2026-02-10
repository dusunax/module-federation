declare module 'products/orderStore' {
  export type OrderItem = import('@shared/types/api').OrderItem;
  export type Order = import('@shared/types/api').Order;

  export const __setMockOrderState: (next: {
    orders?: Order[];
    removeOrder?: (id: number) => void;
    getOrder?: (id: number) => Order | undefined;
  }) => void;
  export const useOrderStore: <T>(selector: (state: {
    orders: Order[];
    removeOrder: (id: number) => void;
    getOrder: (id: number) => Order | undefined;
  }) => T) => T;
}

declare module 'products/utils/statusStyle' {
  export const EMOTION_STATUS: {
    REMEMBERED: string;
  };
  export function getStatusConfig(status: string): {
    label: string;
    color: string;
    icon: string;
  };
}

declare module 'auth/authStore' {
  export const __setMockAuthState: (next: { user?: { uid: string } | null }) => void;
  export const useAuthStore: <T>(selector: (state: { user: { uid: string } | null }) => T) => T;
}

declare module 'auth/services/orderService' {
  export const subscribeToUserOrders: (uid: string, cb: (orders: unknown[]) => void) => () => void;
  export const deleteUserOrder: (uid: string, orderId: string) => Promise<void>;
  export const getUserOrderById: (uid: string, orderId: string | number) => Promise<unknown | null>;
}

declare module 'auth/services/emotionService' {
  export type Emotion = import('@shared/types/api').Emotion;

  export function getAllEmotions(searchTerm?: string, options?: { includeAll?: boolean }): Promise<Emotion[]>;
}
