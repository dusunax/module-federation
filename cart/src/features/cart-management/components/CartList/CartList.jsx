import React from 'react';
import { toast } from 'sonner';
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
    toast.custom((t) => (
      <div className="flex min-w-[300px] flex-col gap-3 rounded-lg border border-[rgba(163,176,135,0.3)] bg-[rgba(67,86,99,0.95)] p-4">
        <div className="text-sm font-light tracking-wide text-[#FFF8D4]">
          장바구니를 비우시겠습니까?
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              toast.dismiss(t);
            }}
            className="cursor-pointer rounded border border-[rgba(255,248,212,0.2)] bg-[rgba(67,86,99,0.5)] px-4 py-2 text-[13px] font-light text-[#FFF8D4] transition-all duration-200 hover:bg-[rgba(67,86,99,0.7)]"
          >
            취소
          </button>
          <button
            onClick={() => {
              normalItems.forEach((item) => {
                removeFromCart(item.id);
              });
              toast.dismiss(t);
              toast.success('장바구니가 비워졌습니다.');
            }}
            className="cursor-pointer rounded border border-[rgba(163,176,135,0.5)] bg-[rgba(163,176,135,0.3)] px-4 py-2 text-[13px] font-light text-[#FFF8D4] transition-all duration-200 hover:bg-[rgba(163,176,135,0.5)]"
          >
            비우기
          </button>
        </div>
      </div>
    ));
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
