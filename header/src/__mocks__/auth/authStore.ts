import { UserRole } from '@shared/types/api';

type AuthState = {
  user: null | {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string;
    plan: string;
    role: UserRole;
  };
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void> | void;
  initAuthListener: () => () => void;
  clearError: () => void;
};

let state: AuthState = {
  user: {
    uid: 'uid',
    displayName: '테스트 사용자',
    email: 'test@example.com',
    photoURL: '',
    plan: 'none',
    role: UserRole.USER,
  },
  loading: false,
  error: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  initAuthListener: () => () => {},
  clearError: () => {},
};

export const __setMockAuthState = (next: Partial<AuthState>) => {
  state = { ...state, ...next };
};

export const useAuthStore = () => state;
