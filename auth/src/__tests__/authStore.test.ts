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
const { getDoc, setDoc } = await import('firebase/firestore');

describe('인증 스토어', () => {
  beforeEach(() => {
    authCallback = null;
    energyState.initializeEnergy.mockClear();
    energyState.clearEnergy.mockClear();
    (signInWithPopup as unknown as ReturnType<typeof vi.fn>).mockReset();
    (signOut as unknown as ReturnType<typeof vi.fn>).mockReset();
    (getDoc as unknown as ReturnType<typeof vi.fn>).mockReset();
    (setDoc as unknown as ReturnType<typeof vi.fn>).mockReset();
    (useAuthStore as unknown as { setState: (s: unknown) => void }).setState({
      user: null,
      loading: true,
      error: null,
    });
  });

  it('로그아웃 상태 변화 시 에너지를 초기화한다', () => {
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
    expect(state.user?.role).toBe(UserRole.USER);
    expect(state.loading).toBe(false);
    expect(setDoc).toHaveBeenCalledWith(
      { _db: {}, _col: 'users', _id: 'u2' },
      { lastLoginAt: 'now' },
      { merge: true }
    );
  });

  it('처음 로그인한 사용자는 사용자 문서를 생성한다', async () => {
    (signInWithPopup as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: {
        uid: 'new-user',
        email: 'new@example.com',
        displayName: '새회원',
        photoURL: 'https://example.com/avatar.png',
      },
    });

    let callCount = 0;
    (getDoc as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
      callCount += 1;
      return Promise.resolve(
        callCount === 1
          ? { exists: () => false }
          : { exists: () => true, data: () => ({ plan: 'none', role: UserRole.USER }) }
      );
    });

    const user = await useAuthStore.getState().signInWithGoogle();

    expect(user.uid).toBe('new-user');
    expect(setDoc).toHaveBeenCalledWith(
      { _db: {}, _col: 'users', _id: 'new-user' },
      {
        email: 'new@example.com',
        displayName: '새회원',
        photoURL: 'https://example.com/avatar.png',
        plan: 'none',
        role: UserRole.USER,
        createdAt: 'now',
        lastLoginAt: 'now',
      },
      { merge: false }
    );
    const state = useAuthStore.getState();
    expect(state.user?.uid).toBe('new-user');
    expect(state.user?.plan).toBe('none');
    expect(state.user?.role).toBe(UserRole.USER);
  });

  it('clearError는 에러 메시지를 초기화한다', async () => {
    const { clearError } = useAuthStore.getState();
    (useAuthStore as unknown as { setState: (s: unknown) => void }).setState({
      error: 'something wrong',
    });

    clearError();

    expect(useAuthStore.getState().error).toBeNull();
  });

  it('로그인 실패 시 에러를 상태에 저장한다', async () => {
    (signInWithPopup as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('login failed')
    );

    await expect(useAuthStore.getState().signInWithGoogle()).rejects.toThrow('login failed');

    expect(useAuthStore.getState().loading).toBe(false);
    expect(useAuthStore.getState().error).toBe('login failed');
  });
});
