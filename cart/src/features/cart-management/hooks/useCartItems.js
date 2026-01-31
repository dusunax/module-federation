import { useCartStore } from 'products/cartStore';
import { useRememberingStore } from 'auth/rememberingStore';

export function useCartItems() {
  const items = useCartStore((state) => state.items);
  const firestoreRememberingItems = useRememberingStore((state) => state.rememberingItems);

  // Firestore 기반으로 rememberingItemIds 계산
  const rememberingItemIds = Object.keys(firestoreRememberingItems).map(Number);

  const cartItems = Object.values(items);

  // rememberingItemIds에 포함된 아이템은 기억 중
  const rememberingItems = cartItems.filter((item) => rememberingItemIds.includes(item.id));
  const normalItems = cartItems.filter((item) => !rememberingItemIds.includes(item.id));

  const normalTotalItems = normalItems.reduce((total, item) => total + item.quantity, 0);
  // 가격은 더 이상 사용하지 않음. 대신 에너지 합계를 계산합니다.

  const normalTotalEnergyCost = normalItems.reduce(
    (total, item) => total + (item.product.energyCost || 1) * item.quantity,
    0
  );

  const rememberingTotalItems = rememberingItems.reduce((total, item) => total + item.quantity, 0);

  return {
    cartItems,
    normalItems,
    rememberingItems,
    normalTotalItems,
    normalTotalEnergyCost,
    rememberingTotalItems,
  };
}
