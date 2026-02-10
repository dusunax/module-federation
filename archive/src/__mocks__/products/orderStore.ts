export type OrderItem = import('@shared/types/api').OrderItem;
export type Order = import('@shared/types/api').Order;

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
