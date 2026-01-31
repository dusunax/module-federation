import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useOrderStore } from 'products/orderStore';
import { EMOTION_STATUS } from 'products/utils/statusStyle';

const DURATION = 60000; // 1분
const INTERVAL = 100; // 100ms마다 업데이트

export function useRememberProgress() {
  const itemProgress = useOrderStore((state) => state.itemProgress);
  const updateItemProgress = useOrderStore((state) => state.updateItemProgress);
  const updateOrderStatus = useOrderStore((state) => state.updateOrderStatus);
  const completeItemRemembering = useOrderStore((state) => state.completeItemRemembering);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const rememberingItemIds = Object.keys(itemProgress).map(Number);

    if (rememberingItemIds.length === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (intervalRef.current) {
      return;
    }

    intervalRef.current = setInterval(() => {
      const currentState = useOrderStore.getState();
      const currentItemProgress = currentState.itemProgress;
      const itemIds = Object.keys(currentItemProgress).map(Number);

      if (itemIds.length === 0) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        return;
      }

      itemIds.forEach((itemId) => {
        const item = currentItemProgress[itemId];
        if (!item) return;

        const elapsed = Date.now() - item.startTime;
        const newProgress = Math.min((elapsed / DURATION) * 100, 100);

        if (newProgress >= 100 && item.progress < 100) {
          updateOrderStatus(itemId, EMOTION_STATUS.REMEMBERED);
          const order = completeItemRemembering(itemId);
          if (order) {
            const energyCost = item.energyCost;
            toast.success(`기억으로 남았어요. (⚡ ${energyCost} 소모)`);
          }
        } else if (newProgress < 100) {
          updateItemProgress(itemId, newProgress);
        }
      });
    }, INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [itemProgress, updateItemProgress, updateOrderStatus, completeItemRemembering]);
}
