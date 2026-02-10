import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import showConfirmToast from '@shared/components/showConfirmToast';
import { getStatusConfig, EMOTION_STATUS } from 'products/utils/statusStyle';
import { useRememberingStore } from 'auth/rememberingStore';
import type { RememberingItem } from 'auth/store/rememberingStore';

const DURATION = 30000; // 30 seconds

function formatRemainingTime(progress: number) {
  const remainingMs = ((100 - progress) / 100) * DURATION;
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function useRealtimeProgress(startTime: number | undefined) {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (!startTime) {
      setProgress(0);
      return;
    }

    const start = new Date(startTime).getTime();
    const tick = () => {
      const now = Date.now();
      const elapsed = Math.max(0, now - start);
      const p = Math.min(100, (elapsed / DURATION) * 100);
      setProgress(p);
    };

    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [startTime]);

  return progress;
}

interface RememberingItemCardProps {
  firestoreItem: RememberingItem;
  cancelItemRemembering: (itemId: number | string) => Promise<RememberingItem | null>;
}

function RememberingItemCard({ firestoreItem, cancelItemRemembering }: RememberingItemCardProps): React.ReactElement {
  const {
    productInfo = {} as RememberingItem['productInfo'],
    status = EMOTION_STATUS.BEING_UNDERSTOOD,
    startTime,
    energyCost = 1,
    visibleItemId,
  } = firestoreItem;
  const statusStyle = getStatusConfig(status);
  const progress = useRealtimeProgress(startTime);

  const handleCancel = () => {
    showConfirmToast({
      title: '정말로 취소하시겠어요?',
      description: '이 작업은 진행 중이던 기억을 취소합니다.',
      confirmLabel: '취소',
      cancelLabel: '닫기',
      onConfirm: async () => {
        try {
          // pass the Firestore-visible id (doc id) to cancel
          await cancelItemRemembering(visibleItemId || String(firestoreItem.id));
          toast.success('기억이 취소되었습니다.');
        } catch (err) {
          console.error('cancelItemRemembering failed', err);
          toast.error('취소에 실패했습니다.');
        }
      },
    });
  };

  return (
    <div className="mb-4 rounded border border-[rgba(163,176,135,0.3)] bg-[rgba(163,176,135,0.1)] p-4 md:p-6 backdrop-blur-[10px]">
      <div className="flex flex-wrap items-center gap-3 md:gap-5">
        <div className="text-4xl md:text-5xl opacity-90">{productInfo.emoji || '🧠'}</div>
        <div className="flex-1">
          <h3 className="my-0 mb-2 text-base font-normal tracking-wide text-[#FFF8D4]">
            {productInfo.name || '알 수 없는 항목'}
          </h3>
          <p className="my-0 mb-1.5 text-sm font-normal tracking-wide text-[#A3B087]">
            ⚡ {productInfo.energyCost ?? energyCost}
          </p>
          <div
            className="mt-1 text-[11px] font-normal tracking-wide"
            style={{ color: statusStyle.color }}
          >
            {statusStyle.icon} {statusStyle.label}
          </div>
        </div>
        <div className="min-w-[60px] md:min-w-25 text-right text-sm md:text-base font-normal tracking-wide text-[#A3B087]">
          ⚡ {energyCost}
        </div>
      </div>

      <div className="mt-4 rounded bg-[rgba(67,86,99,0.3)] p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[12px] font-normal tracking-wide text-[rgba(255,248,212,0.8)]">
            이해되는 중... {formatRemainingTime(progress)} 남음
          </span>
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-normal tracking-wide text-[#A3B087]">
              {Math.round(progress)}%
            </span>
            <button
              onClick={handleCancel}
              className="cursor-pointer rounded border border-[rgba(229,115,115,0.3)] bg-[rgba(229,115,115,0.1)] px-2 py-1 text-[10px] font-normal text-[#E57373] transition-all duration-200 hover:bg-[rgba(229,115,115,0.2)]"
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

interface RememberingSectionProps {
  orderStatuses: Record<number, string>;
  cancelItemRemembering: (itemId: number | string) => Promise<RememberingItem | null>;
}

export function RememberingSection({ cancelItemRemembering }: RememberingSectionProps): React.ReactElement | null {
  const firestoreItems = useRememberingStore((state) => state.rememberingItems || {});
  const firestoreItemsList = Object.values(firestoreItems);

  if (firestoreItemsList.length === 0) return null;

  const totalItems = firestoreItemsList.length;

  return (
    <div className="mb-10">
      <div className="mb-5 border-b border-[rgba(163,176,135,0.3)] pb-4">
        <h2 className="m-0 text-xl font-normal tracking-wider text-[#A3B087]">
          이해되는 중 ({totalItems}개)
        </h2>
        <p className="mb-0 mt-1 text-xs font-normal tracking-wide text-[rgba(163,176,135,0.8)]">
          기억으로 남기는 중입니다
        </p>
      </div>

      <div className="mb-5">
        {firestoreItemsList.map((firestoreItem) => (
          <RememberingItemCard
            key={firestoreItem.id}
            firestoreItem={firestoreItem as RememberingItem}
            cancelItemRemembering={cancelItemRemembering}
          />
        ))}
      </div>
    </div>
  );
}
