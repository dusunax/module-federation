import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useOrderStore } from 'products/orderStore';
import { useCartStore } from 'products/cartStore';
import type { Order } from '@shared/types/api';
import { useRememberingStore } from 'auth/rememberingStore';
import { EMOTION_STATUS } from 'products/utils/statusStyle';
import { useAuthStore } from 'auth/authStore';
import { saveUserOrder } from 'auth/services/orderService';

const INTERVAL = 100; // 100ms마다 체크
const makeDateLike = () => ({ toDate: () => new Date() });

export function useRememberProgress() {
  const rememberingItems = useRememberingStore((state) => state.rememberingItems);
  const completeItemRemembering = useRememberingStore((state) => state.completeItemRemembering);
  const updateOrderStatus = useOrderStore((state) => state.updateOrderStatus);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const itemIds = Object.keys(rememberingItems);

    if (itemIds.length === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      completedRef.current.clear();
      return;
    }

    if (intervalRef.current) {
      return;
    }

    intervalRef.current = setInterval(async () => {
      const currentRememberingItems = useRememberingStore.getState().rememberingItems;
      const currentItemIds = Object.keys(currentRememberingItems);

      if (currentItemIds.length === 0) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        return;
      }

      // Collect all items that reached 100% and are not yet processed
      const completedNow: string[] = [];
      for (const visibleItemId of currentItemIds) {
        const item = currentRememberingItems[visibleItemId];
        if (!item || !item.startTime) continue;

        // 이미 완료 처리된 아이템 스킵
        if (completedRef.current.has(visibleItemId)) continue;

        const elapsed = Date.now() - item.startTime;
        const progress = Math.min((elapsed / item.duration) * 100, 100);

        if (progress >= 100) {
          completedNow.push(visibleItemId);
        }
      }

      if (completedNow.length > 0) {
        // Mark them as processing to avoid double work
        completedNow.forEach((id) => completedRef.current.add(id));

        try {
          // Remove each processing doc in Firestore
          const removePromises = completedNow.map((visibleItemId) =>
            completeItemRemembering(visibleItemId)
          );
          await Promise.all(removePromises);

          // Build aggregated order from available cart items
          const cartState = useCartStore.getState();
          const orderState = useOrderStore.getState();

          const completedCartItems = completedNow
            .map((visibleItemId) => {
              const item = currentRememberingItems[visibleItemId];
              const cartItem = cartState.items[item?.cartItemId];
              return { visibleItemId, item, cartItem };
            })
            .filter(({ cartItem }) => !!cartItem);

          if (completedCartItems.length === 0) {
            // Nothing to add
            completedNow.forEach((id) => completedRef.current.delete(id));
            return;
          }

          const totalItemsCount = completedCartItems.reduce(
            (sum, { cartItem }) => sum + cartItem.quantity,
            0
          );

          const totalEnergy = completedCartItems.reduce(
            (sum, { item }) => sum + (item.energyCost || 0),
            0
          );

          const newOrder: Order = {
            id: String(Date.now()),
            items: completedCartItems.map(({ cartItem }) => ({
              product: cartItem.product,
              quantity: cartItem.quantity,
              addedAt: { toDate: () => new Date(cartItem.addedAt ?? Date.now()) },
              eventCount: { combine: cartItem.eventCount?.combine ?? 1 },
            })),
            // 가격은 더 이상 사용하지 않음. 에너지 합계를 저장합니다.
            totalEnergy,
            totalItems: totalItemsCount,
            orderDate: makeDateLike(),
            status: 'completed',
          };

          // 저장: 로컬 상태 업데이트 (single insert)
          const previousOrders = orderState.orders || [];
          useOrderStore.setState({ orders: [newOrder, ...previousOrders] });

          // 저장: Firestore에 기록 + 결과 로그
          try {
            const user = useAuthStore.getState().user;
            if (user?.uid) {
              const result = await saveUserOrder(user.uid, newOrder);
              console.info('[remembering] saveUserOrder success:', {
                uid: user.uid,
                orderId: newOrder.id,
                result,
              });
            } else {
              console.warn('[remembering] saveUserOrder skipped: no user');
            }
          } catch (err) {
            console.error('Failed to save order to Firestore:', err);
          }

          // 장바구니에서 제거 및 상태 업데이트 for each item
          completedCartItems.forEach(({ item }) => {
            cartState.removeFromCart(item.cartItemId);
            updateOrderStatus(item.productInfo.id, EMOTION_STATUS.REMEMBERED);
          });

          // Notify
          toast.success(`기억으로 남았어요. (⚡ ${totalEnergy} 소모)`);
        } catch (error) {
          console.error('Complete remembering failed (batch):', error);
          // rollback completedRef to allow retry
          completedNow.forEach((id) => completedRef.current.delete(id));
        }
      }
    }, INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [rememberingItems, completeItemRemembering, updateOrderStatus]);
}
