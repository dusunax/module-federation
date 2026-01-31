import React from 'react';
import { toast } from 'sonner';
import { getStatusConfig, EMOTION_STATUS } from 'products/utils/statusStyle';

const DURATION = 60000; // 1분

function formatRemainingTime(progress) {
  const remainingMs = ((100 - progress) / 100) * DURATION;
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function RememberingItemCard({ item, itemProgressData, orderStatuses, cancelItemRemembering }) {
  const { product, quantity } = item;
  const currentStatus = orderStatuses[product.id] || EMOTION_STATUS.HELD;
  const statusStyle = getStatusConfig(currentStatus);
  const progress = itemProgressData?.progress || 0;

  const handleCancel = () => {
    toast.custom((t) => (
      <div className="flex min-w-[300px] flex-col gap-3 rounded-lg border border-[rgba(163,176,135,0.3)] bg-[rgba(67,86,99,0.95)] p-4">
        <div className="text-sm font-light tracking-wide text-[#FFF8D4]">
          이 아이템의 기억하기를 취소할까요?
        </div>
        <div className="text-xs font-light text-[rgba(163,176,135,0.8)]">
          ⚡ {itemProgressData?.energyCost || 0} 에너지가 회복됩니다
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t)}
            className="cursor-pointer rounded border border-[rgba(255,248,212,0.2)] bg-[rgba(67,86,99,0.5)] px-4 py-2 text-[13px] font-light text-[#FFF8D4] transition-all duration-200 hover:bg-[rgba(67,86,99,0.7)]"
          >
            계속하기
          </button>
          <button
            onClick={async () => {
              await cancelItemRemembering(item.id);
              toast.dismiss(t);
              toast.success(`기억하기가 취소되었습니다. (⚡ ${itemProgressData?.energyCost || 0} 회복)`);
            }}
            className="cursor-pointer rounded border border-[rgba(229,115,115,0.5)] bg-[rgba(229,115,115,0.2)] px-4 py-2 text-[13px] font-light text-[#E57373] transition-all duration-200 hover:bg-[rgba(229,115,115,0.3)]"
          >
            취소하기
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="mb-4 rounded border border-[rgba(163,176,135,0.3)] bg-[rgba(163,176,135,0.1)] p-6 backdrop-blur-[10px]">
      <div className="flex items-center gap-5">
        <div className="text-5xl opacity-90">{product.emoji}</div>
        <div className="flex-1">
          <h3 className="my-0 mb-2 text-base font-light tracking-wide text-[#FFF8D4]">
            {product.name}
          </h3>
          <p className="my-0 mb-1.5 text-sm font-light tracking-wide text-[#A3B087]">
            ⚡ {product.energyCost || 1}
          </p>
          <div
            className="mt-1 text-[11px] font-light tracking-wide"
            style={{ color: statusStyle.color }}
          >
            {statusStyle.icon} {statusStyle.label}
          </div>
        </div>
        <div className="min-w-[40px] rounded bg-[rgba(67,86,99,0.3)] px-4 py-2 text-center text-[15px] font-light text-[rgba(255,248,212,0.7)]">
          {quantity}개
        </div>
        <div className="min-w-[100px] text-right text-base font-light tracking-wide text-[#A3B087]">
          ⚡ {(product.energyCost || 1) * quantity}
        </div>
      </div>

      {/* 개별 프로그레스바 */}
      <div className="mt-4 rounded bg-[rgba(67,86,99,0.3)] p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[12px] font-light tracking-wide text-[rgba(255,248,212,0.8)]">
            이해되는 중... {formatRemainingTime(progress)} 남음
          </span>
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-light tracking-wide text-[#A3B087]">
              {Math.round(progress)}%
            </span>
            <button
              onClick={handleCancel}
              className="cursor-pointer rounded border border-[rgba(229,115,115,0.3)] bg-[rgba(229,115,115,0.1)] px-2 py-1 text-[10px] font-light text-[#E57373] transition-all duration-200 hover:bg-[rgba(229,115,115,0.2)]"
            >
              취소
            </button>
          </div>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-[3px] bg-[rgba(67,86,99,0.5)]">
          <div
            className="h-full rounded-[3px] transition-[width] duration-100 ease-out"
            style={{
              width: `${progress}%`,
              background:
                'linear-gradient(90deg, rgba(163, 176, 135, 0.6) 0%, rgba(163, 176, 135, 0.9) 100%)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function RememberingSection({
  rememberingItems,
  rememberingTotalItems,
  isRemembering,
  itemProgress,
  orderStatuses,
  cancelItemRemembering,
}) {
  if (rememberingItems.length === 0) {
    return null;
  }

  return (
    <div className="mb-10">
      <div className="mb-5 border-b border-[rgba(163,176,135,0.3)] pb-4">
        <h2 className="m-0 text-xl font-light tracking-wider text-[#A3B087]">
          이해되는 중 ({rememberingTotalItems}개)
        </h2>
        <p className="mb-0 mt-1 text-xs font-light tracking-wide text-[rgba(163,176,135,0.8)]">
          기억으로 남기는 중입니다
        </p>
      </div>

      {/* 이해되는 중인 아이템 목록 - 개별 프로그레스바 */}
      <div className="mb-5">
        {rememberingItems.map((item) => (
          <RememberingItemCard
            key={item.id}
            item={item}
            itemProgressData={itemProgress[item.id]}
            orderStatuses={orderStatuses}
            cancelItemRemembering={cancelItemRemembering}
          />
        ))}
      </div>
    </div>
  );
}
