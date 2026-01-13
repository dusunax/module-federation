import React from 'react';
import { toast } from 'sonner';
import { EMOTION_STATUS } from 'products/utils/statusStyle';

export function CartSummary({
  normalItems,
  normalTotalItems,
  normalTotalPrice,
  startRemembering,
  updateAllOrderStatuses,
}) {
  if (normalItems.length === 0) {
    return null;
  }

  const handleRemember = () => {
    toast.custom((t) => (
      <div className="flex min-w-[300px] flex-col gap-3 rounded-lg border border-[rgba(163,176,135,0.3)] bg-[rgba(67,86,99,0.95)] p-4">
        <div className="text-sm font-light tracking-wide text-[#FFF8D4]">
          정말 기억하시겠습니까?
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
              startRemembering();

              const newStatuses = {};
              normalItems.forEach((item) => {
                newStatuses[item.product.id] = EMOTION_STATUS.BEING_UNDERSTOOD;
              });
              updateAllOrderStatuses(newStatuses);
              toast.dismiss(t);
            }}
            className="cursor-pointer rounded border border-[rgba(163,176,135,0.5)] bg-[rgba(163,176,135,0.3)] px-4 py-2 text-[13px] font-light text-[#FFF8D4] transition-all duration-200 hover:bg-[rgba(163,176,135,0.5)]"
          >
            기억하기
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="rounded border border-[rgba(163,176,135,0.3)] bg-[rgba(67,86,99,0.2)] p-[30px] backdrop-blur-[10px]">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm font-light tracking-wide text-[rgba(255,248,212,0.9)]">
          총 {normalTotalItems}개 순간
        </span>
      </div>
      <div className="mb-6 flex items-center justify-between">
        <span className="text-lg font-light tracking-wider text-[#FFF8D4]">총 금액</span>
        <span className="text-2xl font-light tracking-wider text-[#FFF8D4]">
          {normalTotalPrice === 0 ? '무료' : `${normalTotalPrice.toLocaleString()}원`}
        </span>
      </div>

      <button
        onClick={handleRemember}
        className="w-full cursor-pointer rounded border border-[rgba(163,176,135,0.5)] bg-[rgba(163,176,135,0.3)] py-4 text-base font-light tracking-wider text-[#FFF8D4] transition-all duration-300 hover:-translate-y-px hover:border-[rgba(163,176,135,0.7)] hover:bg-[rgba(163,176,135,0.5)]"
      >
        기억하기
      </button>
    </div>
  );
}
