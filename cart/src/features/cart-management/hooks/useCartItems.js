import { useCartStore } from 'products/cartStore';
import { useOrderStore } from 'products/orderStore';

export function useCartItems() {
  const items = useCartStore((state) => state.items);
  const itemProgress = useOrderStore((state) => state.itemProgress);

  // itemProgress 기반으로 rememberingItemIds 계산
  const rememberingItemIds = Object.keys(itemProgress).map(Number);

  const cartItems = Object.values(items);

  // rememberingItemIds에 포함된 아이템은 기억 중
  const rememberingItems = cartItems.filter((item) => rememberingItemIds.includes(item.id));
  const normalItems = cartItems.filter((item) => !rememberingItemIds.includes(item.id));

  const normalTotalItems = normalItems.reduce((total, item) => total + item.quantity, 0);
  const normalTotalPrice = normalItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

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
    normalTotalPrice,
    normalTotalEnergyCost,
    rememberingTotalItems,
  };
}
