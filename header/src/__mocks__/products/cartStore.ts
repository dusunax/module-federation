type CartState = {
  items: Record<string, { id: number; quantity: number }>;
};

let state: CartState = {
  items: {
    1: { id: 1, quantity: 2 },
    2: { id: 2, quantity: 1 },
  },
};

export const __setMockCartState = (next: Partial<CartState>) => {
  state = { ...state, ...next };
};

export const useCartStore = (selector: (state: CartState) => unknown) => selector(state);
