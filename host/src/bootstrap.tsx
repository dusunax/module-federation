import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { useAuthStore } from 'auth/authStore';
import { useSharedEmotionStore, type SharedEmotionRecord, type WeeklyEmotionPayload } from './stores/sharedEmotionStore';
import { getRecentOrders } from 'auth/services/orderService';

type SharedEmotionStoreSnapshot = {
  records: SharedEmotionRecord[];
};
type SharedEmotionStoreState = ReturnType<typeof useSharedEmotionStore.getState>;
type SharedEmotionStoreBridgeVersion = '1.0.0';

type SharedEmotionStoreBridge = {
  version: SharedEmotionStoreBridgeVersion;
  getState: () => SharedEmotionStoreSnapshot;
  subscribe: (
    listener: (state: SharedEmotionStoreSnapshot, prevState: SharedEmotionStoreSnapshot) => void
  ) => () => void;
  getRecentWeekPayload: (baseDate?: string | Date) => WeeklyEmotionPayload;
};

declare global {
  interface Window {
    __sharedEmotionStoreBridge__?: SharedEmotionStoreBridge;
    __BOOKED_BY_FEELINGS__?: {
      sharedEmotionStore?: SharedEmotionStoreBridge;
    };
  }
}

const createSharedEmotionStoreBridge = (): SharedEmotionStoreBridge => {
  const store = useSharedEmotionStore;
  return {
    version: '1.0.0',
    getState: () => ({ records: store.getState().records }),
    subscribe: store.subscribe,
    getRecentWeekPayload: (baseDate) => {
      const state = store.getState() as SharedEmotionStoreState;
      if (typeof state.getRecentWeekPayload === 'function') {
        return state.getRecentWeekPayload(baseDate);
      }
      return {
        version: '1.0.0',
        startDate: '',
        endDate: '',
        records: [],
      };
    },
  };
};

const registerSharedEmotionStoreBridge = () => {
  if (typeof window !== 'undefined') {
    const bridge = createSharedEmotionStoreBridge();
    window.__sharedEmotionStoreBridge__ = bridge;
    window.__BOOKED_BY_FEELINGS__ = {
      ...window.__BOOKED_BY_FEELINGS__,
      sharedEmotionStore: bridge,
    };
  }
};

const startSharedEmotionDashboardSync = () => {
  let timer: ReturnType<typeof setInterval> | null = null;
  let isRunning = false;

  const stopTimer = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  const syncRecords = async () => {
    if (isRunning) {
      return;
    }

    isRunning = true;
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) {
        useSharedEmotionStore.getState().clearEmotionRecords();
        return;
      }

      const orders = await getRecentOrders(user.uid, 50);
      useSharedEmotionStore.getState().setEmotionRecordsFromOrders(Array.isArray(orders) ? orders : []);
    } catch (error) {
      console.error('[shared-emotion] failed to sync records from orders', error);
    } finally {
      isRunning = false;
    }
  };

  const runSync = async () => {
    const user = useAuthStore.getState().user;
    if (!user?.uid) {
      useSharedEmotionStore.getState().clearEmotionRecords();
      return;
    }

    await syncRecords();
  };

  const unsubscribe = useAuthStore.subscribe((state, prevState) => {
    const prevUserId = prevState.user?.uid;
    const nextUserId = state.user?.uid;
    if (nextUserId === prevUserId) {
      return;
    }

    stopTimer();
    if (nextUserId) {
      void runSync();
      timer = setInterval(() => {
        void runSync();
      }, 15000);
    } else {
      useSharedEmotionStore.getState().clearEmotionRecords();
    }
  });

  if (useAuthStore.getState().user?.uid) {
    void runSync();
    timer = setInterval(() => {
      void runSync();
    }, 15000);
  }

  return () => {
    stopTimer();
    unsubscribe();
  };
};

const startApp = () => {
  registerSharedEmotionStoreBridge();

  // Firebase Auth 리스너 초기화
  useAuthStore.getState().initAuthListener();
  startSharedEmotionDashboardSync();

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('[bootstrap] root element not found');
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
};

startApp();
