import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getStatusConfig, EMOTION_STATUS } from 'products/utils/statusStyle';
import { useRememberingStore } from 'auth/rememberingStore';

const DURATION = 60000; // 1분

function formatRemainingTime(progress) {
  const remainingMs = ((100 - progress) / 100) * DURATION;
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function useRealtimeProgress(startTime, duration) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!startTime) {
      setProgress(0);
      return;
    }

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
    };

    updateProgress();
    const interval = setInterval(updateProgress, 100);

    return () => clearInterval(interval);
  }, [startTime, duration]);

  return progress;
}

function RememberingItemCard({ firestoreItem, orderStatuses, cancelItemRemembering }) {
  const productInfo = firestoreItem.productInfo;
  const currentStatus = orderStatuses[productInfo.id] || EMOTION_STATUS.BEING_UNDERSTOOD;
  const statusStyle = getStatusConfig(currentStatus);

  const startTime = firestoreItem.startTime;
  const duration = firestoreItem.duration || DURATION;
  const energyCost = firestoreItem.energyCost;

  const progress = useRealtimeProgress(startTime, duration);

  const handleCancel = () => {
    toast.custom((t) => (
      <div className="flex min-w-[300px] flex-col gap-3 rounded-lg border border-[rgba(163,176,135,0.3)] bg-[rgba(67,86,99,0.95)] p-4">
        <div className="text-sm font-light tracking-wide text-[#FFF8D4]">
          이 아이템의 기억하기를 취소할까요?
        </div>
        <div className="text-xs font-light text-[rgba(163,176,135,0.8)]">
          ⚡ {energyCost} 에너지가 회복됩니다
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
              await cancelItemRemembering(firestoreItem.cartItemId);
              toast.dismiss(t);
              toast.success(`기억하기가 취소되었습니다. (⚡ ${energyCost} 회복)`);
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
        <div className="text-5xl opacity-90">{productInfo.emoji}</div>
        <div className="flex-1">
          <h3 className="my-0 mb-2 text-base font-light tracking-wide text-[#FFF8D4]">
            {productInfo.name}
          </h3>
          <p className="my-0 mb-1.5 text-sm font-light tracking-wide text-[#A3B087]">
            ⚡ {productInfo.energyCost || 1}
          </p>
          <div
            className="mt-1 text-[11px] font-light tracking-wide"
            style={{ color: statusStyle.color }}
          >
            {statusStyle.icon} {statusStyle.label}
          </div>
        </div>
        <div className="min-w-[100px] text-right text-base font-light tracking-wide text-[#A3B087]">
          ⚡ {energyCost}
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

export function RememberingSection({ orderStatuses, cancelItemRemembering }) {
  const firestoreItems = useRememberingStore((state) => state.rememberingItems);
  const firestoreItemsList = Object.values(firestoreItems);

  if (firestoreItemsList.length === 0) {
    return null;
  }

  const totalItems = firestoreItemsList.length;

  return (
    <div className="mb-10">
      <div className="mb-5 border-b border-[rgba(163,176,135,0.3)] pb-4">
        <h2 className="m-0 text-xl font-light tracking-wider text-[#A3B087]">
          이해되는 중 ({totalItems}개)
        </h2>
        <p className="mb-0 mt-1 text-xs font-light tracking-wide text-[rgba(163,176,135,0.8)]">
          기억으로 남기는 중입니다
        </p>
      </div>

      {/* 이해되는 중인 아이템 목록 - Firestore 데이터 직접 사용 */}
      <div className="mb-5">
        {firestoreItemsList.map((firestoreItem) => (
          <RememberingItemCard
            key={firestoreItem.visibleItemId}
            firestoreItem={firestoreItem}
            orderStatuses={orderStatuses}
            cancelItemRemembering={cancelItemRemembering}
          />
        ))}
      </div>
    </div>
  );
}
