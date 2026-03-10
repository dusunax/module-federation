import { useEffect } from 'react';
import { useAuthStore } from 'auth/authStore';
import { getRecentOrders } from 'auth/services/orderService';
import { useSharedEmotionStore } from './sharedEmotionStore';

export interface EmotionStoreInitializerProps {
  limit?: number;
  onTrace?: (name: string, detail?: Record<string, unknown>) => void;
}

const trace = (onTrace, name, detail = {}) => {
  if (typeof onTrace === 'function') {
    onTrace(name, detail);
  }
  console.info(`[EmotionStoreInitializer] ${name}`, detail);
};

export default function EmotionStoreInitializer({ limit = 100, onTrace }: EmotionStoreInitializerProps) {
  useEffect(() => {
    let canceled = false;

    const hydrate = async () => {
      const userId = useAuthStore.getState().user?.uid;

      if (!userId) {
        useSharedEmotionStore.getState().clearEmotionRecords();
        trace(onTrace, 'skipped.noUser', { reason: 'userId_missing' });
        return;
      }

      trace(onTrace, 'hydrate.start', {
        userId,
        limit,
      });

      try {
        const orders = await getRecentOrders(userId, limit);
        if (canceled) {
          trace(onTrace, 'hydrate.canceled', { userId, step: 'after fetch' });
          return;
        }

        const orderArray = Array.isArray(orders) ? orders : [];
        useSharedEmotionStore.getState().setEmotionRecordsFromOrders(orderArray);
        trace(onTrace, 'hydrate.success', {
          userId,
          ordersCount: orderArray.length,
        });
      } catch (error) {
        if (canceled) {
          trace(onTrace, 'hydrate.canceled', { userId, step: 'after error' });
          return;
        }

        const message = error instanceof Error ? error.message : String(error);
        console.error('[EmotionStoreInitializer] failed to fetch orders', error);
        useSharedEmotionStore.getState().clearEmotionRecords();
        trace(onTrace, 'hydrate.error', { userId, message });
      }
    };

    const unsubscribe = useAuthStore.subscribe(() => {
      if (canceled) {
        return;
      }

      trace(onTrace, 'auth.changed', {
        userId: useAuthStore.getState().user?.uid ?? null,
      });
      void hydrate();
    });

    trace(onTrace, 'mount', { limit });
    void hydrate();

    return () => {
      canceled = true;
      unsubscribe();
      trace(onTrace, 'unmount', {});
    };
  }, [limit, onTrace]);

  return null;
}
