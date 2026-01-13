import React from "react";
import { EmptyCart } from "./features/cart-management/components/EmptyCart/EmptyCart";
import { CartList } from "./features/cart-management/components/CartList/CartList";
import { RememberingSection } from "./features/remembering/components/RememberingSection/RememberingSection";
import { CartSummary } from "./features/remembering/components/CartSummary/CartSummary";
import { useCartItems } from "./features/cart-management/hooks/useCartItems";
import { useCartActions } from "./features/cart-management/hooks/useCartActions";
import { useCartTimer } from "./features/cart-management/hooks/useCartTimer";
import { useRememberingState } from "./features/remembering/hooks/useRememberingState";

function Cart() {
  const {
    cartItems,
    normalItems,
    rememberingItems,
    normalTotalItems,
    normalTotalPrice,
    rememberingTotalItems,
  } = useCartItems();

  const { items, updateQuantity, removeFromCart } = useCartActions();
  const timeRemaining = useCartTimer();

  const {
    isRemembering,
    progress,
    orderStatuses,
    rememberingStartTime,
    startRemembering,
    updateAllOrderStatuses,
  } = useRememberingState();

  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
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
        progress={progress}
        orderStatuses={orderStatuses}
        rememberingStartTime={rememberingStartTime}
      />

      <CartSummary
        normalItems={normalItems}
        normalTotalItems={normalTotalItems}
        normalTotalPrice={normalTotalPrice}
        startRemembering={startRemembering}
        updateAllOrderStatuses={updateAllOrderStatuses}
      />
    </div>
  );
}

export default Cart;
