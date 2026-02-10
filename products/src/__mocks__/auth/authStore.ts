import { vi } from 'vitest';
import type { User } from '@shared/types/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  initAuthListener: () => () => void;
  clearError: () => void;
}

const defaultState: AuthState = {
  user: null,
  loading: false,
  error: null,
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
  initAuthListener: vi.fn(() => vi.fn()),
  clearError: vi.fn(),
};

let currentState = { ...defaultState };

export function useAuthStore(): AuthState;
export function useAuthStore<T>(selector: (state: AuthState) => T): T;
export function useAuthStore<T>(selector?: (state: AuthState) => T): AuthState | T {
  if (selector) return selector(currentState);
  return currentState;
}

export function __setAuthState(partial: Partial<AuthState>) {
  currentState = { ...defaultState, ...partial };
}

export function __resetAuthState() {
  currentState = {
    ...defaultState,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    initAuthListener: vi.fn(() => vi.fn()),
    clearError: vi.fn(),
  };
}
