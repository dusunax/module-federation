type AuthState = {
  user: null | { uid: string };
};

let state: AuthState = {
  user: null,
};

export const __setMockAuthState = (next: Partial<AuthState>) => {
  state = { ...state, ...next };
};

export const useAuthStore = <T,>(selector: (s: AuthState) => T) => selector(state);

useAuthStore.getState = () => state;
