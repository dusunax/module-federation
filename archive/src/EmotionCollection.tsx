import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from 'auth/authStore';
import { subscribeToUserOrders } from 'auth/services/orderService';
import { getAllEmotions, Emotion } from 'auth/services/emotionService';
import { Order } from 'products/orderStore';
import { LockIcon } from 'lucide-react';

interface RarityStyle {
  border: string;
  glow: string;
}

const RARITY_STYLES: Record<string, RarityStyle> = {
  common: {
    border: 'border-[rgba(255,248,212,0.2)]',
    glow: '',
  },
  rare: {
    border: 'border-[#5B8DEF]',
    glow: 'shadow-[0_0_12px_rgba(91,141,239,0.3)]',
  },
  epic: {
    border: 'border-[#A855F7]',
    glow: 'shadow-[0_0_12px_rgba(168,85,247,0.3)]',
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
    const unsubscribe = subscribeToUserOrders(user.uid, (dbOrders) => {
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
    return (
      <div className="max-w-225 mx-auto min-h-[60vh] px-5 py-10">
        <div className="py-25 text-center text-[rgba(255,248,212,0.7)]">불러오는 중...</div>
      </div>
    );
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
              className="h-full rounded-full bg-[var(--color-accent-green)] transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="min-w-[40px] text-right text-sm font-normal tracking-wide text-[rgba(255,248,212,0.7)]">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Emotion grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {allEmotions.sort((a, b) => (a.rarityOrder ?? 0) - (b.rarityOrder ?? 0)).map((emotion) => {
          const isCollected = collectedIds.has(emotion.id);
          const rarity = RARITY_STYLES[emotion.rarity] || RARITY_STYLES.common;

          if (isCollected) {
            return (
              <div
                key={emotion.id}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 bg-[rgba(67,86,99,0.2)] p-5 backdrop-blur-[10px] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[rgba(67,86,99,0.3)] ${rarity.border} ${rarity.glow}`}
              >
                <span className="text-[40px] leading-none">{emotion.emoji}</span>
                <span className="text-center text-sm font-normal tracking-wide text-[#FFF8D4]">
                  {emotion.name}
                </span>
                <span className="text-xs font-normal tracking-wide text-[rgba(255,248,212,0.5)]">
                  {emotion.category}
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
