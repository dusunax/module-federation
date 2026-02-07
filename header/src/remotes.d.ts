declare module 'auth/authStore' {
  export const useAuthStore: () => {
    user: null | {
      displayName: string;
      email: string;
      photoURL: string;
      plan: string;
      role: string;
    };
    signOut: () => Promise<void> | void;
  };
}

declare module 'auth/energyStore' {
  export const useEnergyStore: () => { current: number; maxEnergy: number };
}

declare module 'auth/rememberingStore' {
  export const useRememberingStore: <T>(selector: (state: { rememberingItems: Record<string, unknown> }) => T) => T;
}

declare module 'products/cartStore' {
  export const useCartStore: <T>(selector: (state: { items: Record<string, { id: number; quantity: number }> }) => T) => T;
}
