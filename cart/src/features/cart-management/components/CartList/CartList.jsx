import React from 'react';
import { toast } from 'sonner';
import showConfirmToast from '@shared/components/showConfirmToast';
import { CartItem } from '../CartItem/CartItem';

export function CartList({
  normalItems,
  normalTotalItems,
  items,
  orderStatuses,
  timeRemaining,
  updateQuantity,
  removeFromCart,
}) {
  const handleClearAll = () => {
    showConfirmToast({
      title: '장바구니를 비우시겠어요?',
      confirmLabel: '비우기',
      cancelLabel: '취소',
      onConfirm: () => {
        normalItems.forEach((item) => removeFromCart(item.id));
        toast.success('장바구니가 비워졌습니다.');
      },
    });
  };

  if (normalItems.length === 0) {
    return null;
  }

  return (
    <div className="mb-[30px]">
      <div className="mb-5 flex items-center justify-between border-b border-[rgba(255,248,212,0.2)] pb-4">
        <div>
          <h2 className="m-0 text-xl font-light tracking-wider text-[#FFF8D4]">
            장바구니 ({normalTotalItems}개)
          </h2>
          <p className="mb-0 mt-1 text-xs font-light tracking-wide text-[rgba(255,248,212,0.7)]">
            편집 가능한 순간들
          </p>
        </div>
        <button
          onClick={handleClearAll}
          className="cursor-pointer rounded border border-[rgba(255,248,212,0.2)] bg-[rgba(67,86,99,0.3)] px-4 py-2.5 text-[13px] font-light tracking-wide text-[#FFF8D4] transition-all duration-300 hover:border-[#A3B087] hover:bg-[rgba(67,86,99,0.4)]"
        >
          전체 삭제
        </button>
      </div>
      <div className="mb-5">
        {normalItems.map((item) => (
          <CartItem
            key={item.id}
            product={item.product}
            quantity={item.quantity}
            orderStatuses={orderStatuses}
            timeRemaining={timeRemaining}
            item={item}
            itemId={item.id}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
          />
        ))}
      </div>
    </div>
  );
}
