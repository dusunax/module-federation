import React from 'react';
import { toast } from 'sonner';
import { EMOTION_STATUS } from 'products/utils/statusStyle';

export function CartSummary({
  normalItems,
  normalTotalItems,
  normalTotalEnergyCost,
  currentEnergy,
  isLoggedIn,
  startRemembering,
  updateAllOrderStatuses,
}) {
  if (normalItems.length === 0) {
    return null;
  }

  const hasEnoughEnergy = currentEnergy >= normalTotalEnergyCost;
  const isDisabled = !isLoggedIn || !hasEnoughEnergy;

  const handleRemember = () => {
    if (!isLoggedIn) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    if (!hasEnoughEnergy) {
      toast.error('에너지가 부족합니다.');
      return;
    }

    toast.custom((t) => (
      <div className="flex min-w-[300px] flex-col gap-3 rounded-lg border border-[rgba(163,176,135,0.3)] bg-[rgba(67,86,99,0.95)] p-4">
        <div className="text-sm font-light tracking-wide text-[#FFF8D4]">
          정말 기억하시겠습니까?
        </div>
        <div className="mb-2 text-xs font-light text-[#A3B087]">
          ⚡ {normalTotalEnergyCost} 에너지 소모
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
            onClick={async () => {
              try {
                await startRemembering();

                const newStatuses = {};
                normalItems.forEach((item) => {
                  newStatuses[item.product.id] = EMOTION_STATUS.BEING_UNDERSTOOD;
                });
                updateAllOrderStatuses(newStatuses);
                toast.dismiss(t);
              } catch (error) {
                toast.error('에너지 차감에 실패했습니다.');
              }
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
        <span className="text-lg font-light tracking-wider text-[#FFF8D4]">필요 에너지</span>
        <span
          className={`text-2xl font-light tracking-wider ${hasEnoughEnergy ? 'text-[#A3B087]' : 'text-[#E57373]'}`}
        >
          ⚡ {normalTotalEnergyCost} / {currentEnergy}
        </span>
      </div>

      <button
        onClick={handleRemember}
        disabled={isDisabled}
        className={`w-full rounded border py-4 text-base font-light tracking-wider text-[#FFF8D4] transition-all duration-300 ${
          isDisabled
            ? 'cursor-not-allowed border-[rgba(255,248,212,0.1)] bg-[rgba(67,86,99,0.3)] opacity-50'
            : 'cursor-pointer border-[rgba(163,176,135,0.5)] bg-[rgba(163,176,135,0.3)] hover:-translate-y-px hover:border-[rgba(163,176,135,0.7)] hover:bg-[rgba(163,176,135,0.5)]'
        }`}
      >
        {!isLoggedIn ? '로그인 필요' : !hasEnoughEnergy ? '에너지 부족' : '기억하기'}
      </button>
    </div>
  );
}
