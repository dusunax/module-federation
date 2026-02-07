type RememberingState = {
  rememberingItems: Record<number, { id: number }>;
};

let state: RememberingState = {
  rememberingItems: {},
};

export const __setMockRememberingState = (next: Partial<RememberingState>) => {
  state = { ...state, ...next };
};

type Selector<T> = (state: RememberingState) => T;

export const useRememberingStore = ((selector?: Selector<unknown>) => {
  return selector ? selector(state) : state;
}) as ((selector?: Selector<unknown>) => unknown) & { getState: () => RememberingState };

useRememberingStore.getState = () => state;
