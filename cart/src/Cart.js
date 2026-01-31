import React from 'react';
import { EmptyCart } from './features/cart-management/components/EmptyCart/EmptyCart';
import { CartList } from './features/cart-management/components/CartList/CartList';
import { RememberingSection } from './features/remembering/components/RememberingSection/RememberingSection';
import { CartSummary } from './features/remembering/components/CartSummary/CartSummary';
import { useCartItems } from './features/cart-management/hooks/useCartItems';
import { useCartActions } from './features/cart-management/hooks/useCartActions';
import { useCartTimer } from './features/cart-management/hooks/useCartTimer';
import { useRememberingState } from './features/remembering/hooks/useRememberingState';
import { useAuthStore } from 'auth/authStore';
import { useEnergyStore } from 'auth/energyStore';

function Cart() {
  const {
    cartItems,
    normalItems,
    rememberingItems,
    normalTotalItems,
    normalTotalEnergyCost,
    rememberingTotalItems,
  } = useCartItems();

  const user = useAuthStore((state) => state.user);
  const currentEnergy = useEnergyStore((state) => state.current);

  const { items, updateQuantity, removeFromCart } = useCartActions();
  const timeRemaining = useCartTimer();

  const {
    isRemembering,
    itemProgress,
    orderStatuses,
    startRemembering,
    updateAllOrderStatuses,
    cancelItemRemembering,
  } = useRememberingState();

  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="mx-auto max-w-[900px] p-5">
      <CartList
        normalItems={normalItems}
        normalTotalItems={normalTotalItems}
        items={items}
        orderStatuses={orderStatuses}
        timeRemaining={timeRemaining}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
      />

      <RememberingSection
        rememberingItems={rememberingItems}
        rememberingTotalItems={rememberingTotalItems}
        isRemembering={isRemembering}
        itemProgress={itemProgress}
        orderStatuses={orderStatuses}
        cancelItemRemembering={cancelItemRemembering}
      />

      <CartSummary
        normalItems={normalItems}
        normalTotalItems={normalTotalItems}
        normalTotalEnergyCost={normalTotalEnergyCost}
        currentEnergy={currentEnergy}
        isLoggedIn={!!user}
        startRemembering={startRemembering}
        updateAllOrderStatuses={updateAllOrderStatuses}
      />
    </div>
  );
}

export default Cart;
