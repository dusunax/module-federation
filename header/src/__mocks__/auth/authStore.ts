type AuthState = {
  user: null | {
    displayName: string;
    email: string;
    photoURL: string;
    plan: string;
    role: string;
  };
  signOut: () => Promise<void> | void;
};

let state: AuthState = {
  user: {
    displayName: '테스트 사용자',
    email: 'test@example.com',
    photoURL: '',
    plan: 'none',
    role: 'user',
  },
  signOut: async () => {},
};

export const __setMockAuthState = (next: Partial<AuthState>) => {
  state = { ...state, ...next };
};

export const useAuthStore = () => state;
