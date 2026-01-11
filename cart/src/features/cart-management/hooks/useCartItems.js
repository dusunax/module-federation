import { useCartStore } from "products/cartStore";
import { useOrderStore } from "products/orderStore";

export function useCartItems() {
  const items = useCartStore((state) => state.items);
  const rememberingItemIds = useOrderStore((state) => state.rememberingItemIds);

  const cartItems = Object.values(items);

  // rememberingItemIds는 이제 itemId 배열이므로 item.id로 확인
  const rememberingItems = cartItems.filter((item) =>
    rememberingItemIds.includes(item.id)
  );
  const normalItems = cartItems.filter(
    (item) => !rememberingItemIds.includes(item.id)
  );

  const normalTotalItems = normalItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const normalTotalPrice = normalItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const rememberingTotalItems = rememberingItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return {
    cartItems,
    normalItems,
    rememberingItems,
    normalTotalItems,
    normalTotalPrice,
    rememberingTotalItems,
  };
}
