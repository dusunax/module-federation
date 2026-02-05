import React from 'react';
import { toast } from 'sonner';
import { EMOTION_STATUS } from 'products/utils/statusStyle';
import showConfirmToast from '@shared/components/showConfirmToast';

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

    showConfirmToast({
      title: '정말 기억하시겠습니까?',
      description: `⚡ ${normalTotalEnergyCost} 에너지 소모`,
      confirmLabel: '기억하기',
      cancelLabel: '취소',
      onConfirm: async () => {
        try {
          await startRemembering();
          const newStatuses = {};
          normalItems.forEach((item) => {
            newStatuses[item.product.id] = EMOTION_STATUS.BEING_UNDERSTOOD;
          });
          updateAllOrderStatuses(newStatuses);
        } catch (error) {
          toast.error('에너지 차감에 실패했습니다.');
        }
      },
    });
  };

  // Component UI
  return (
    <div className="rounded border border-[rgba(163,176,135,0.3)] bg-[rgba(67,86,99,0.2)] p-[30px] backdrop-blur-[10px]">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm font-normal tracking-wide text-[rgba(255,248,212,0.9)]">
          총 {normalTotalItems}개 시간
        </span>
      </div>
      <div className="mb-6 flex items-center justify-between">
        <span className="text-lg font-normal tracking-wider text-[#FFF8D4]">필요 에너지</span>
        <span
          className={`text-2xl font-normal tracking-wider ${hasEnoughEnergy ? 'text-[#A3B087]' : 'text-[#E57373]'}`}
        >
          ⚡ {normalTotalEnergyCost} / {currentEnergy}
        </span>
      </div>

      <button
        onClick={handleRemember}
        disabled={isDisabled}
        className={`w-full rounded border py-4 text-base font-normal tracking-wider text-[#FFF8D4] transition-all duration-300 ${
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
