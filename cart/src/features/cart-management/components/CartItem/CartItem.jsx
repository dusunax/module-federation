import React from 'react';
import { toast } from 'sonner';
import { getStatusConfig, EMOTION_STATUS } from 'products/utils/statusStyle';

export function CartItem({
  product,
  quantity,
  orderStatuses,
  timeRemaining,
  item,
  itemId,
  updateQuantity,
  removeFromCart,
}) {
  const currentStatus = orderStatuses[product.id] || EMOTION_STATUS.HELD;
  const statusStyle = getStatusConfig(currentStatus);
  const timer = item?.addedAt ? timeRemaining[itemId] : null;

  return (
    <div className="mb-4 flex items-center gap-5 rounded border border-[rgba(255,248,212,0.2)] bg-[rgba(67,86,99,0.2)] p-6 backdrop-blur-[10px]">
      <div className="text-5xl opacity-90">{product.emoji}</div>
      <div className="flex-1">
        <h3 className="my-0 mb-2 text-base font-light tracking-wide text-[#FFF8D4]">
          {product.name}
        </h3>
        <p className="my-0 mb-1.5 text-sm font-light tracking-wide text-[#FFF8D4]">
          {product.price === 0 ? '무료' : `${product.price.toLocaleString()}원`}
        </p>
        <div>
          <div
            className="mt-1 text-[11px] font-light tracking-wide"
            style={{ color: statusStyle.color }}
          >
            {statusStyle.icon} {statusStyle.label}
          </div>
          {timer && (
            <div className="mt-1 text-[10px] font-light tracking-wide text-[rgba(163,176,135,0.8)]">
              남은 시간: {String(timer.hours).padStart(2, '0')}:
              {String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => updateQuantity(itemId, quantity - 1)}
          className="h-8 w-8 cursor-pointer rounded border border-[rgba(255,248,212,0.2)] bg-[rgba(67,86,99,0.3)] text-lg font-light text-[#FFF8D4] transition-all duration-300 hover:border-[#A3B087] hover:bg-[rgba(67,86,99,0.4)]"
        >
          −
        </button>
        <span className="min-w-[40px] text-center text-[15px] font-light text-[#FFF8D4]">
          {quantity}
        </span>
        <button
          onClick={() => updateQuantity(itemId, quantity + 1)}
          className="h-8 w-8 cursor-pointer rounded border border-[rgba(255,248,212,0.2)] bg-[rgba(67,86,99,0.3)] text-lg font-light text-[#FFF8D4] transition-all duration-300 hover:border-[#A3B087] hover:bg-[rgba(67,86,99,0.4)]"
        >
          +
        </button>
      </div>
      <div className="min-w-[100px] text-right text-base font-light tracking-wide text-[#FFF8D4]">
        {product.price === 0 ? '무료' : `${(product.price * quantity).toLocaleString()}원`}
      </div>
      <button
        onClick={() => {
          toast.custom((t) => (
            <div className="flex min-w-[300px] flex-col gap-3 rounded-lg border border-[rgba(163,176,135,0.3)] bg-[rgba(67,86,99,0.95)] p-4">
              <div className="text-sm font-light tracking-wide text-[#FFF8D4]">
                이 기억을 그냥 넘어갈까요?
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
                    removeFromCart(itemId);
                    toast.dismiss(t);
                    toast.success('기억이 삭제되었습니다.');
                  }}
                  className="cursor-pointer rounded border border-[rgba(163,176,135,0.5)] bg-[rgba(163,176,135,0.3)] px-4 py-2 text-[13px] font-light text-[#FFF8D4] transition-all duration-200 hover:bg-[rgba(163,176,135,0.5)]"
                >
                  웃어 넘기기
                </button>
              </div>
            </div>
          ));
        }}
        className="cursor-pointer rounded border border-[rgba(255,248,212,0.2)] bg-[rgba(67,86,99,0.3)] px-3.5 py-2 text-xs font-light tracking-wide text-[#FFF8D4] transition-all duration-300 hover:border-[#A3B087] hover:bg-[rgba(67,86,99,0.4)]"
      >
        웃어 넘기기
      </button>
    </div>
  );
}
