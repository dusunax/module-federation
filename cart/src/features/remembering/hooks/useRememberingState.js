import { useCallback, useMemo } from 'react';
import { useOrderStore } from 'products/orderStore';
import { useCartStore } from 'products/cartStore';
import { useEnergyStore } from 'auth/energyStore';
import { useRememberingStore } from 'auth/rememberingStore';

export function useRememberingState() {
  // Firestore 기반 상태
  const rememberingItems = useRememberingStore((state) => state.rememberingItems);
  const loading = useRememberingStore((state) => state.loading);
  const startRememberingFirestore = useRememberingStore((state) => state.startRememberingBatch);
  const cancelItemRememberingFirestore = useRememberingStore((state) => state.cancelItemRemembering);
  const cancelAllRememberingFirestore = useRememberingStore((state) => state.cancelAllRemembering);

  // 로컬 상태 (하위 호환용)
  const orderStatuses = useOrderStore((state) => state.orderStatuses);
  const updateAllOrderStatuses = useOrderStore((state) => state.updateAllOrderStatuses);

  // 에너지 관리
  const deductEnergy = useEnergyStore((state) => state.deductEnergy);
  const restoreEnergy = useEnergyStore((state) => state.restoreEnergy);

  // Firestore 데이터 기반으로 계산된 값들
  const rememberingItemIds = useMemo(
    () => Object.keys(rememberingItems).map(Number),
    [rememberingItems]
  );
  const isRemembering = rememberingItemIds.length > 0;

  // itemProgress 형태로 변환 (기존 컴포넌트 호환용)
  const itemProgress = useMemo(() => {
    const progress = {};
    Object.entries(rememberingItems).forEach(([visibleItemId, item]) => {
      if (item.startTime) {
        const elapsed = Date.now() - item.startTime;
        const currentProgress = Math.min((elapsed / item.duration) * 100, 100);
        progress[visibleItemId] = {
          progress: currentProgress,
          startTime: item.startTime,
          energyCost: item.energyCost,
        };
      }
    });
    return progress;
  }, [rememberingItems]);

  // 기억 시작 (에너지 선차감 + Firestore 저장)
  const startRemembering = useCallback(
    async () => {
      // 장바구니에서 아이템 정보 가져오기
      const cartItems = useCartStore.getState().items;
      const currentRememberingItems = useRememberingStore.getState().rememberingItems;

      // 이미 기억 중인 아이템 제외한 새 아이템만 필터링
      const newItemsToSave = Object.values(cartItems)
        .filter((item) => !currentRememberingItems[String(item.id)])
        .map((item) => ({
          cartItemId: item.id,
          productInfo: {
            id: item.product.id,
            name: item.product.name,
            emoji: item.product.emoji,
            energyCost: item.product.energyCost || 1,
          },
          energyCost: (item.product.energyCost || 1) * item.quantity,
        }));

      if (newItemsToSave.length === 0) {
        return;
      }

      // 새 아이템의 에너지 비용만 계산
      const newEnergyCost = newItemsToSave.reduce((total, item) => total + item.energyCost, 0);

      // 에너지 선차감
      if (newEnergyCost > 0) {
        try {
          await deductEnergy(newEnergyCost);
        } catch (error) {
          console.error('Energy deduction failed:', error);
          throw error;
        }
      }

      // Firestore에 저장
      await startRememberingFirestore(newItemsToSave);
    },
    [deductEnergy, startRememberingFirestore]
  );

  // 전체 기억 취소 (에너지 회복 + Firestore 삭제)
  const cancelRemembering = useCallback(async () => {
    const totalEnergyCost = await cancelAllRememberingFirestore();

    if (totalEnergyCost > 0) {
      try {
        await restoreEnergy(totalEnergyCost);
      } catch (error) {
        console.error('Energy restore failed:', error);
      }
    }
  }, [cancelAllRememberingFirestore, restoreEnergy]);

  // 개별 아이템 기억 취소 (에너지 회복 + Firestore 삭제)
  const cancelItemRemembering = useCallback(
    async (itemId) => {
      const itemData = await cancelItemRememberingFirestore(String(itemId));

      if (itemData && itemData.energyCost > 0) {
        try {
          await restoreEnergy(itemData.energyCost);
        } catch (error) {
          console.error('Energy restore failed:', error);
        }
      }

      return itemData;
    },
    [cancelItemRememberingFirestore, restoreEnergy]
  );

  return {
    isRemembering,
    itemProgress,
    orderStatuses,
    rememberingItemIds,
    rememberingItems,
    loading,
    startRemembering,
    updateAllOrderStatuses,
    cancelRemembering,
    cancelItemRemembering,
  };
}
