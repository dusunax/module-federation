import { useCartStore, CartItem } from 'products/cartStore';

interface UseCartActionsReturn {
  updateQuantity: (itemId: number, quantity: number) => void;
  removeFromCart: (itemId: number) => void;
  items: Record<number, CartItem>;
}

export function useCartActions(): UseCartActionsReturn {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const items = useCartStore((state) => state.items);

  return {
    updateQuantity,
    removeFromCart,
    items,
  };
}
