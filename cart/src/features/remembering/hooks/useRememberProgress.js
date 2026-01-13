import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useOrderStore } from 'products/orderStore';
import { EMOTION_STATUS } from 'products/utils/statusStyle';

export function useRememberProgress() {
  const isRemembering = useOrderStore((state) => state.isRemembering);
  const progress = useOrderStore((state) => state.progress);
  const updateProgress = useOrderStore((state) => state.updateProgress);
  const updateAllOrderStatuses = useOrderStore((state) => state.updateAllOrderStatuses);
  const completeRememberingItems = useOrderStore((state) => state.completeRememberingItems);
  const completeRemembering = useOrderStore((state) => state.completeRemembering);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isRemembering) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (intervalRef.current) {
      return;
    }

    const duration = 60000; // 1분
    const interval = 100; // 100ms마다 업데이트
    const steps = duration / interval; // 총 600단계
    let currentStep = Math.floor((progress / 100) * steps);

    intervalRef.current = setInterval(() => {
      currentStep += 1;
      const newProgress = Math.min((currentStep / steps) * 100, 100);
      updateProgress(newProgress);

      if (currentStep >= steps) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;

        const currentState = useOrderStore.getState();
        const { rememberingItemIds: currentRememberingIds } = currentState;

        const finalStatuses = {};
        currentRememberingIds.forEach((productId) => {
          finalStatuses[productId] = EMOTION_STATUS.REMEMBERED;
        });
        updateAllOrderStatuses(finalStatuses);

        const order = completeRememberingItems();
        if (order) {
          completeRemembering();
          toast.success('기억으로 남았어요.');
        }
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    isRemembering,
    progress,
    updateProgress,
    updateAllOrderStatuses,
    completeRememberingItems,
    completeRemembering,
  ]);
}
