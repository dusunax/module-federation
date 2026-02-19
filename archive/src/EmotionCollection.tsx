import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from 'auth/authStore';
import { subscribeToUserOrders } from 'auth/services/orderService';
import { getAllEmotions } from 'auth/services/emotionService';
import type { Emotion, Order } from '@shared/types/api';
import { LockIcon, Sparkles } from 'lucide-react';
import { CATEGORY_LABELS } from '@shared/constants/categories';
import CollectionSkeleton from '@shared/components/skeletons/CollectionSkeleton';

interface IntensityStyle {
  border: string;
  glow: string;
}

const INTENSITY_STYLES: Record<string, IntensityStyle> = {
  low: {
    border: 'border-[rgba(120,206,140,0.55)]',
    glow: 'shadow-[0_0_10px_rgba(120,206,140,0.25)]',
  },
  middle: {
    border: 'border-[#F4C35E]',
    glow: 'shadow-[0_0_12px_rgba(244,195,94,0.28)]',
  },
  high: {
    border: 'border-[#E36A6A]',
    glow: 'shadow-[0_0_12px_rgba(227,106,106,0.3)]',
  },
};

function EmotionCollection() {
  const user = useAuthStore((state) => state.user);
  const [allEmotions, setAllEmotions] = useState<Emotion[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllEmotions()
      .then((data) => setAllEmotions(data))
      .catch((err) => {
        console.error('Failed to fetch emotions:', err);
        setError('감정 목록을 불러오는데 실패했습니다.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = subscribeToUserOrders(user.uid, (dbOrders: Order[] | null) => {
      setOrders(dbOrders || []);
    });
    return () => unsubscribe && unsubscribe();
  }, [user?.uid]);

  const collectedIds = useMemo(() => {
    const ids = new Set<number>();
    for (const order of orders) {
      if (!order.items) continue;
      for (const { product } of order.items) {
        ids.add(product.id);
      }
    }
    return ids;
  }, [orders]);

  const collectedCount = useMemo(
    () => allEmotions.filter((e) => collectedIds.has(e.id)).length,
    [allEmotions, collectedIds],
  );

  const totalCount = allEmotions.length;
  const percentage = totalCount > 0 ? Math.round((collectedCount / totalCount) * 100) : 0;

  if (loading) {
    return <CollectionSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-225 mx-auto min-h-[60vh] px-5 py-10">
        <div className="py-25 text-center text-[rgba(255,100,100,0.9)]">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-225 mx-auto px-5 py-10">
      {/* Header */}
      <div className="mb-10 border-b border-[rgba(255,248,212,0.15)] pb-6">
        <h1 className="m-0 mb-2 text-[28px] font-normal tracking-wider text-[#FFF8D4]">
          감정 도감
        </h1>
        <p className="m-0 mb-4 text-[13px] font-normal tracking-wide text-[rgba(255,248,212,0.7)]">
          {collectedCount} / {totalCount} 수집 완료
        </p>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[rgba(255,248,212,0.1)]">
            <div
              className="h-full rounded-full bg-(--color-accent-green) transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="min-w-10 text-right text-sm font-normal tracking-wide text-[rgba(255,248,212,0.7)]">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Emotion grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {allEmotions.sort((a, b) => (a.intensityOrder ?? 0) - (b.intensityOrder ?? 0)).map((emotion) => {
          const isCollected = collectedIds.has(emotion.id);
          const intensity = INTENSITY_STYLES[emotion.intensity] || INTENSITY_STYLES.low;
          const categoryLabel = CATEGORY_LABELS[emotion.category] ?? emotion.category;

          if (isCollected) {
            return (
              <div
                key={emotion.id}
                className={`relative flex flex-col items-center gap-2 rounded-lg border-2 bg-[rgba(67,86,99,0.2)] p-5 backdrop-blur-[10px] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[rgba(67,86,99,0.3)] ${intensity.border} ${intensity.glow}`}
              >
                <span className="text-[40px] leading-none">{emotion.emoji}</span>
                <span className="text-center text-sm font-normal tracking-wide text-[#FFF8D4]">
                  {emotion.name.ko}
                </span>
                {emotion.visibility?.event?.length > 0 && (
                  <Sparkles
                    size={16}
                    className="absolute right-3 top-3 text-[var(--color-accent-green)] opacity-85"
                  />
                )}
                <span className="text-xs font-normal tracking-wide text-[rgba(255,248,212,0.5)]">
                  {categoryLabel}
                </span>
                <span className="text-xs font-normal tracking-wide text-[rgba(255,248,212,0.4)]">
                  ⚡ {emotion.energyCost}
                </span>
              </div>
            );
          }

          return (
            <div
              key={emotion.id}
              className="flex flex-col items-center gap-2 rounded-lg border-2 border-[rgba(255,248,212,0.08)] bg-[rgba(67,86,99,0.1)] p-5 opacity-50"
            >
              <LockIcon className="h-10 w-10 text-[rgba(255,248,212,0.3)]" />
              <span className="text-center text-sm font-normal tracking-wide text-[rgba(255,248,212,0.3)]">
                ???
              </span>
              <span className="text-xs font-normal tracking-wide text-[rgba(255,248,212,0.2)]">
                ⚡ {emotion.energyCost}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EmotionCollection;
