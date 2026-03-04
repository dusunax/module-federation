import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '@shared/types/api';

const energyState = {
  initializeEnergy: vi.fn(),
  clearEnergy: vi.fn(),
};

let authCallback: ((user: unknown) => void) | null = null;

vi.mock('../store/energyStore', () => ({
  useEnergyStore: {
    getState: () => energyState,
  },
}));

vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: class {},
  signOut: vi.fn(),
  onAuthStateChanged: (_auth: unknown, cb: (user: unknown) => void) => {
    authCallback = cb;
    return () => {};
  },
}));

vi.mock('firebase/firestore', () => ({
  doc: (_db: unknown, _col: string, _id: string) => ({ _db, _col, _id }),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'now'),
}));

vi.mock('../firebase', () => ({
  auth: {},
  db: {},
}));

const { signInWithPopup, signOut } = await import('firebase/auth');
const { getDoc } = await import('firebase/firestore');

describe('인증 스토어', () => {
  beforeEach(() => {
    authCallback = null;
    energyState.initializeEnergy.mockClear();
    energyState.clearEnergy.mockClear();
    (signInWithPopup as unknown as ReturnType<typeof vi.fn>).mockReset();
    (signOut as unknown as ReturnType<typeof vi.fn>).mockReset();
    (getDoc as unknown as ReturnType<typeof vi.fn>).mockReset();
    (useAuthStore as unknown as { setState: (s: unknown) => void }).setState({
      user: null,
      loading: true,
      error: null,
    });
  });

  it('로그아웃 상태 변화 시 에너지를 초기화한다', async () => {
    const unsubscribe = useAuthStore.getState().initAuthListener();
    expect(typeof unsubscribe).toBe('function');

    authCallback?.(null);

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.loading).toBe(false);
    expect(energyState.clearEnergy).toHaveBeenCalled();
  });

  it('로그인 상태 변화 시 사용자/에너지를 설정한다', async () => {
    (getDoc as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      exists: () => true,
      data: () => ({ plan: 'pro', role: UserRole.ADMIN }),
    });

    useAuthStore.getState().initAuthListener();

    await authCallback?.({
      uid: 'u1',
      email: 'test@example.com',
      displayName: '테스트',
      photoURL: null,
    });

    const state = useAuthStore.getState();
    expect(state.user?.uid).toBe('u1');
    expect(state.user?.plan).toBe('pro');
    expect(state.user?.role).toBe(UserRole.ADMIN);
    expect(state.loading).toBe(false);
    expect(energyState.initializeEnergy).toHaveBeenCalledWith('u1', 'pro');
  });

  it('로그아웃을 호출하면 사용자 상태를 초기화한다', async () => {
    (signOut as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (useAuthStore as unknown as { setState: (s: unknown) => void }).setState({
      user: { uid: 'u1', email: 'a', displayName: 'b', photoURL: null, plan: 'none' },
      loading: false,
      error: null,
    });

    await useAuthStore.getState().signOut();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.loading).toBe(false);
    expect(energyState.clearEnergy).toHaveBeenCalled();
  });

  it('구글 로그인 성공 시 사용자 정보를 저장한다', async () => {
    (signInWithPopup as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: {
        uid: 'u2',
        email: 'user@example.com',
        displayName: '사용자',
        photoURL: null,
      },
      _tokenResponse: { isNewUser: false },
    });
    (getDoc as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      exists: () => true,
      data: () => ({ plan: 'none' }),
    });

    const user = await useAuthStore.getState().signInWithGoogle();

    const state = useAuthStore.getState();
    expect(user.uid).toBe('u2');
    expect(state.user?.uid).toBe('u2');
    expect(state.user?.plan).toBe('none');
    expect(state.loading).toBe(false);
  });
});
