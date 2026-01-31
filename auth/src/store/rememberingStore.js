import { create } from 'zustand';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const REMEMBERING_DURATION = 60000; // 1분

const useRememberingStore = create((set, get) => ({
  // Firestore에서 동기화된 기억 중인 아이템들
  // { [visibleItemId]: { visibleItemId, cartItemId, productInfo, startTime, duration, energyCost, status } }
  rememberingItems: {},
  loading: true,
  error: null,
  userId: null,
  unsubscribe: null,

  // Firestore 실시간 리스너 설정
  initializeListener: (userId) => {
    const state = get();

    // 이미 같은 userId로 구독 중이면 스킵
    if (state.userId === userId && state.unsubscribe) {
      return;
    }

    // 기존 구독 해제
    if (state.unsubscribe) {
      state.unsubscribe();
    }

    if (!userId) {
      set({ rememberingItems: {}, loading: false, userId: null, unsubscribe: null });
      return;
    }

    set({ loading: true, userId });

    const rememberingRef = collection(db, 'users', userId, 'processing');
    const unsubscribe = onSnapshot(
      rememberingRef,
      (snapshot) => {
        const items = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          items[doc.id] = {
            visibleItemId: doc.id,
            cartItemId: data.cartItemId,
            productInfo: data.productInfo,
            startTime:
              data.startTime instanceof Timestamp ? data.startTime.toMillis() : data.startTime,
            duration: data.duration,
            energyCost: data.energyCost,
            status: data.status,
          };
        });
        set({ rememberingItems: items, loading: false, error: null });
      },
      (error) => {
        console.error('Remembering listener error:', error);
        set({ error: error.message, loading: false });
      }
    );

    set({ unsubscribe });
  },

  // 리스너 해제
  cleanup: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
    }
    set({ rememberingItems: {}, loading: false, userId: null, unsubscribe: null });
  },

  // 기억 시작 - Firestore에 문서 생성
  startRemembering: async (cartItemId, productInfo, energyCost) => {
    const { userId } = get();
    if (!userId) {
      throw new Error('User not initialized');
    }

    // visibleItemId는 cartItemId를 문자열로 사용
    const visibleItemId = String(cartItemId);
    const rememberingRef = doc(db, 'users', userId, 'processing', visibleItemId);

    await setDoc(rememberingRef, {
      cartItemId,
      productInfo,
      startTime: serverTimestamp(),
      duration: REMEMBERING_DURATION,
      energyCost,
      status: 'in_progress',
      createdAt: serverTimestamp(),
    });

    return visibleItemId;
  },

  // 여러 아이템 기억 시작 (이미 존재하는 아이템은 건너뜀)
  startRememberingBatch: async (items) => {
    const { userId, rememberingItems } = get();
    if (!userId) {
      throw new Error('User not initialized');
    }

    // 이미 기억 중인 아이템 제외
    const newItems = items.filter(({ cartItemId }) => {
      const visibleItemId = String(cartItemId);
      return !rememberingItems[visibleItemId];
    });

    if (newItems.length === 0) {
      return;
    }

    const promises = newItems.map(({ cartItemId, productInfo, energyCost }) => {
      const visibleItemId = String(cartItemId);
      const rememberingRef = doc(db, 'users', userId, 'processing', visibleItemId);

      return setDoc(rememberingRef, {
        cartItemId,
        productInfo,
        startTime: serverTimestamp(),
        duration: REMEMBERING_DURATION,
        energyCost,
        status: 'in_progress',
        createdAt: serverTimestamp(),
      });
    });

    await Promise.all(promises);
  },

  // 개별 아이템 기억 취소 - Firestore에서 문서 삭제
  cancelItemRemembering: async (visibleItemId) => {
    const { userId, rememberingItems } = get();
    if (!userId) {
      throw new Error('User not initialized');
    }

    const item = rememberingItems[visibleItemId];
    if (!item) return null;

    const rememberingRef = doc(db, 'users', userId, 'processing', String(visibleItemId));
    await deleteDoc(rememberingRef);

    return item;
  },

  // 전체 기억 취소
  cancelAllRemembering: async () => {
    const { userId, rememberingItems } = get();
    if (!userId) {
      throw new Error('User not initialized');
    }

    const totalEnergyCost = Object.values(rememberingItems).reduce(
      (total, item) => total + item.energyCost,
      0
    );

    const promises = Object.keys(rememberingItems).map((visibleItemId) => {
      const rememberingRef = doc(db, 'users', userId, 'processing', String(visibleItemId));
      return deleteDoc(rememberingRef);
    });

    await Promise.all(promises);

    return totalEnergyCost;
  },

  // 개별 아이템 기억 완료 - Firestore에서 문서 삭제 (완료 처리는 별도)
  completeItemRemembering: async (visibleItemId) => {
    const { userId, rememberingItems } = get();
    if (!userId) {
      throw new Error('User not initialized');
    }

    const item = rememberingItems[visibleItemId];
    if (!item) return null;

    const rememberingRef = doc(db, 'users', userId, 'processing', String(visibleItemId));
    await deleteDoc(rememberingRef);

    return item;
  },

  // 헬퍼: 프로그레스 계산 (현재 시간 기준)
  getProgress: (visibleItemId) => {
    const { rememberingItems } = get();
    const item = rememberingItems[visibleItemId];
    if (!item || !item.startTime) return 0;

    const elapsed = Date.now() - item.startTime;
    return Math.min((elapsed / item.duration) * 100, 100);
  },

  // 헬퍼: 모든 아이템의 프로그레스 계산
  getAllProgress: () => {
    const { rememberingItems } = get();
    const progress = {};

    Object.entries(rememberingItems).forEach(([visibleItemId, item]) => {
      if (item.startTime) {
        const elapsed = Date.now() - item.startTime;
        progress[visibleItemId] = {
          progress: Math.min((elapsed / item.duration) * 100, 100),
          startTime: item.startTime,
          energyCost: item.energyCost,
          cartItemId: item.cartItemId,
        };
      }
    });

    return progress;
  },
}));

export { useRememberingStore };
