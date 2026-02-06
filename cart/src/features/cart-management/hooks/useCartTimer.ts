import { useState, useEffect, useMemo } from 'react';
import { useCartStore } from 'products/cartStore';

export interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
}

export function useCartTimer(): Record<number, TimeRemaining> {
  const items = useCartStore((state) => state.items);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const [timeRemaining, setTimeRemaining] = useState<Record<number, TimeRemaining>>({});

  // addedAt 값들을 추출해서 의존성으로 사용 (addedAt이 변경되면 재계산)
  const addedAtValues = useMemo(() => {
    return Object.values(items).map((item) => ({
      itemId: item.id,
      addedAt: item.addedAt,
    }));
  }, [items]);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = Date.now();
      const newTimeRemaining: Record<number, TimeRemaining> = {};

      Object.values(items).forEach((item) => {
        const { id, addedAt } = item;
        if (addedAt) {
          const expirationTime = addedAt + 24 * 60 * 60 * 1000; // 24시간 후
          const remaining = expirationTime - now;

          if (remaining <= 0) {
            removeFromCart(id); // 24시간 지나면 삭제
          } else {
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
            newTimeRemaining[id] = { hours, minutes, seconds };
          }
        }
      });

      setTimeRemaining(newTimeRemaining);
    };

    calculateTimeRemaining();

    const timerInterval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(timerInterval);
  }, [items, removeFromCart, addedAtValues]);

  return timeRemaining;
}
