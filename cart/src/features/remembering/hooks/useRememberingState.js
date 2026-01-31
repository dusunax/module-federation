import { useCallback } from 'react';
import { useOrderStore } from 'products/orderStore';
import { useEnergyStore } from 'auth/energyStore';

export function useRememberingState() {
  const itemProgress = useOrderStore((state) => state.itemProgress);
  const orderStatuses = useOrderStore((state) => state.orderStatuses);
  const startRememberingAction = useOrderStore((state) => state.startRemembering);
  const updateAllOrderStatuses = useOrderStore((state) => state.updateAllOrderStatuses);
  const cancelRememberingAction = useOrderStore((state) => state.cancelRemembering);
  const cancelItemRememberingAction = useOrderStore((state) => state.cancelItemRemembering);

  const deductEnergy = useEnergyStore((state) => state.deductEnergy);
  const restoreEnergy = useEnergyStore((state) => state.restoreEnergy);

  // itemProgress 기반으로 계산된 값들
  const rememberingItemIds = Object.keys(itemProgress).map(Number);
  const isRemembering = rememberingItemIds.length > 0;

  // 기억 시작 (에너지 선차감 포함)
  const startRemembering = useCallback(
    async (itemIds, totalEnergyCost) => {
      // 에너지 선차감 (totalEnergyCost가 전달되면 사용)
      if (totalEnergyCost > 0) {
        try {
          await deductEnergy(totalEnergyCost);
        } catch (error) {
          console.error('Energy deduction failed:', error);
          throw error;
        }
      }

      // 상태 업데이트
      startRememberingAction(itemIds);
    },
    [deductEnergy, startRememberingAction]
  );

  // 전체 기억 취소 (에너지 회복 포함)
  const cancelRemembering = useCallback(async () => {
    const totalEnergyCost = cancelRememberingAction();

    if (totalEnergyCost > 0) {
      try {
        await restoreEnergy(totalEnergyCost);
      } catch (error) {
        console.error('Energy restore failed:', error);
      }
    }
  }, [cancelRememberingAction, restoreEnergy]);

  // 개별 아이템 기억 취소 (에너지 회복 포함)
  const cancelItemRemembering = useCallback(
    async (itemId) => {
      const itemData = cancelItemRememberingAction(itemId);

      if (itemData && itemData.energyCost > 0) {
        try {
          await restoreEnergy(itemData.energyCost);
        } catch (error) {
          console.error('Energy restore failed:', error);
        }
      }

      return itemData;
    },
    [cancelItemRememberingAction, restoreEnergy]
  );

  return {
    isRemembering,
    itemProgress,
    orderStatuses,
    rememberingItemIds,
    startRemembering,
    updateAllOrderStatuses,
    cancelRemembering,
    cancelItemRemembering,
  };
}
