type RememberingState = {
  rememberingItems: Record<string, unknown>;
};

let state: RememberingState = { rememberingItems: {} };

export const __setMockRememberingState = (next: Partial<RememberingState>) => {
  state = { ...state, ...next };
};

export const useRememberingStore = (selector: (state: RememberingState) => unknown) =>
  selector(state);
