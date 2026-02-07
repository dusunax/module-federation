export interface OrderItem {
  product: { id: number; name?: string; emoji?: string; description?: string; category?: string };
  quantity: number;
}

export interface Order {
  id: string;
  orderDate: string;
  items: OrderItem[];
  totalItems: number;
}

type State = {
  orders: Order[];
  removeOrder: (id: number) => void;
  getOrder: (id: number) => Order | undefined;
};

let state: State = {
  orders: [],
  removeOrder: () => {},
  getOrder: () => undefined,
};

export const __setMockOrderState = (next: Partial<State>) => {
  state = { ...state, ...next };
};

export const useOrderStore = <T,>(selector: (s: State) => T) => selector(state);

useOrderStore.getState = () => state;
