import { useOrderStore } from 'products/orderStore';

export function useRememberingState() {
  const isRemembering = useOrderStore((state) => state.isRemembering);
  const progress = useOrderStore((state) => state.progress);
  const orderStatuses = useOrderStore((state) => state.orderStatuses);
  const rememberingItemIds = useOrderStore((state) => state.rememberingItemIds);
  const rememberingStartTime = useOrderStore((state) => state.rememberingStartTime);
  const startRemembering = useOrderStore((state) => state.startRemembering);
  const updateAllOrderStatuses = useOrderStore((state) => state.updateAllOrderStatuses);

  return {
    isRemembering,
    progress,
    orderStatuses,
    rememberingItemIds,
    rememberingStartTime,
    startRemembering,
    updateAllOrderStatuses,
  };
}
