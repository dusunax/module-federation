import { useCartStore } from 'products/cartStore';

export function useCartActions() {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const items = useCartStore((state) => state.items);

  return {
    updateQuantity,
    removeFromCart,
    items,
  };
}
