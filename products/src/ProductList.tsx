import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from './store/cartStore';
import { useOrderStore } from './store/orderStore';
import { getStatusConfig } from './utils/statusStyle';
import { isEmotionVisible } from './utils/conditions';
import { EMOTION_STATUS } from './constants';
import { getAllEmotions, Emotion } from 'auth/services/emotionService';
import { useCurrentConditions } from './hooks/useCurrentConditions';
import ConditionHintPopup from './components/ConditionHintPopup';
import CurrentConditionUI from './components/CurrentConditionUI';
import { InfoIcon } from 'lucide-react';

type SortDirection = 'asc' | 'desc' | null;

interface SortPrefs {
  dateSort: SortDirection;
  energySort: SortDirection;
}

const STORAGE_KEY = 'emotion-sort-prefs';
const DATE_STATES: SortDirection[] = ['desc', 'asc', null];
const ENERGY_STATES: SortDirection[] = ['asc', 'desc', null];

const DATE_LABELS: Record<string, string> = { desc: '최신순', asc: '오래된순' };
const ENERGY_LABELS: Record<string, string> = { asc: '낮은순', desc: '높은순' };
const ARROW: Record<string, string> = { asc: '↑', desc: '↓' };
const CATEGORY_LABELS: Record<string, string> = {
  joy: '기쁨',
  sadness: '슬픔',
  anger: '분노',
  fear: '두려움',
  disgust: '혐오',
  surprise: '놀람',
  trust: '신뢰',
  love: '사랑',
  obsession: '집착',
  anxiety: '불안',
  jealousy: '질투',
  disappointment: '실망',
  contempt: '경멸',
  discouragement: '낙담',
  guilt: '죄책감',
  hope: '희망',
};

function loadSortPrefs(): SortPrefs {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as SortPrefs;
  } catch {
    /* ignore */
  }
  return { dateSort: 'desc', energySort: null };
}

function saveSortPrefs(dateSort: SortDirection, energySort: SortDirection) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ dateSort, energySort }));
}

function ProductList() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortPrefs, setSortPrefs] = useState<SortPrefs>(loadSortPrefs);
  const [hintOpen, setHintOpen] = useState(false);
  const { dateSort, energySort } = sortPrefs;
  const navigate = useNavigate();
  const cartItems = useCartStore((state) => state.items);
  const orderStatuses = useOrderStore((state) => state.orderStatuses);
  const { conditions, view } = useCurrentConditions();

  const {
    data: emotions,
    isLoading,
    isFetching,
    error,
  } = useQuery<Emotion[], Error>({
    queryKey: ['emotions', searchTerm],
    queryFn: () => getAllEmotions(searchTerm || undefined),
  });

  const updateSort = useCallback((nextDate: SortDirection, nextEnergy: SortDirection) => {
    setSortPrefs({ dateSort: nextDate, energySort: nextEnergy });
    saveSortPrefs(nextDate, nextEnergy);
  }, []);

  const sortedEmotions = React.useMemo((): Emotion[] | undefined => {
    if (!emotions) return emotions;
    if (!dateSort && !energySort) return emotions;
    const sorted = [...emotions];
    sorted.sort((a: Emotion, b: Emotion) => {
      if (energySort) {
        const dir = energySort === 'asc' ? 1 : -1;
        const diff = (a.energyCost - b.energyCost) * dir;
        if (diff !== 0) return diff;
      }
      if (dateSort) {
        const dir = dateSort === 'desc' ? 1 : -1;
        const timeA = a.createdAt?.seconds ?? 0;
        const timeB = b.createdAt?.seconds ?? 0;
        if (timeA !== timeB) return (timeB - timeA) * dir;
        return (b.id - a.id) * dir;
      }
      return 0;
    });
    return sorted;
  }, [emotions, dateSort, energySort]);

  const visibleEmotions = React.useMemo((): Emotion[] | undefined => {
    if (!sortedEmotions) return sortedEmotions;
    return sortedEmotions.filter((emotion) => isEmotionVisible(emotion, conditions));
  }, [sortedEmotions, conditions]);

  const handleDateToggle = useCallback(() => {
    const idx = DATE_STATES.indexOf(dateSort);
    const next = DATE_STATES[(idx + 1) % DATE_STATES.length];
    updateSort(next, energySort);
  }, [dateSort, energySort, updateSort]);

  const handleEnergyToggle = useCallback(() => {
    const idx = ENERGY_STATES.indexOf(energySort);
    const next = ENERGY_STATES[(idx + 1) % ENERGY_STATES.length];
    updateSort(dateSort, next);
  }, [dateSort, energySort, updateSort]);

  const handleProductClick = (id: number) => {
    navigate(`/detail/${id}`);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-5">
      <div className="flex items-center gap-4 mb-6">
        <div className='flex'>
          {/* 현재 조건 */}
          <CurrentConditionUI view={view} />
          
          <button
            onClick={() => setHintOpen(true)}
            aria-label="condition-hint-button"
            className="self-end flex h-8 w-8 items-center justify-center rounded-full border-2 text-2xl no-underline transition-colors -translate-x-4 border-[var(--color-border-primary)] hover:bg-[var(--color-overlay-3)] cursor-pointer" 
          >
            <InfoIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 min-w-0 flex flex-col items-end gap-3">
          {/* 검색 */}
          <input
            type="text"
            aria-label="products-search"
            placeholder="순간, 카테고리, 스토리로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-[500px] rounded border border-[var(--color-border-primary)] bg-[var(--color-overlay-3)] px-4 py-3.5 text-sm font-normal text-[var(--color-text-primary)] outline-none transition-all duration-300 focus:border-[var(--color-accent-green)] focus:bg-[var(--color-overlay-4)]"
          />

          {/* 정렬 */}
          <div className="mb-3 flex items-center gap-2">
            <button
              onClick={handleDateToggle}
              aria-label="products-sort-date"
              className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-normal tracking-wide transition-all duration-200 ${
                dateSort
                  ? 'border-[var(--color-border-green)] bg-[var(--color-green-overlay-1)] text-[var(--color-accent-green)]'
                  : 'border-[var(--color-border-faded)] bg-transparent text-[var(--color-text-faded)] hover:border-[var(--color-border-primary)] hover:text-[var(--color-text-muted)]'
              }`}
            >
              날짜
              {dateSort && (
                <span className="text-[10px] opacity-80">
                  {ARROW[dateSort]} {DATE_LABELS[dateSort]}
                </span>
              )}
            </button>
            <button
              onClick={handleEnergyToggle}
              aria-label="products-sort-energy"
              className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-normal tracking-wide transition-all duration-200 ${
                energySort
                  ? 'border-[var(--color-border-green)] bg-[var(--color-green-overlay-1)] text-[var(--color-accent-green)]'
                  : 'border-[var(--color-border-faded)] bg-transparent text-[var(--color-text-faded)] hover:border-[var(--color-border-primary)] hover:text-[var(--color-text-muted)]'
              }`}
            >
              ⚡ 에너지
              {energySort && (
                <span className="text-[10px] opacity-80">
                  {ARROW[energySort]} {ENERGY_LABELS[energySort]}
                </span>
              )}
            </button>
          </div>

          {/* 에러 표시 */}
          {error && (
            <div className="mb-5 rounded border border-[var(--color-border-primary)] bg-[var(--color-overlay-2)] p-5 text-center text-[var(--color-text-primary)]">
              <p>에러: {error.message}</p>
            </div>
          )}
        </div>
      </div>


      {/* 검색 결과 표시 */}
      {searchTerm && (
        <p className="mb-5 text-[13px] font-normal text-[var(--color-text-secondary)]">
          검색 결과: {visibleEmotions?.length || 0}개
          {isFetching && <span className="ml-2.5 text-xs">업데이트 중...</span>}
        </p>
      )}

      {/* 로딩 상태 */}
      {isLoading && !emotions && (
        <div className="py-15 text-center">
          <p className="font-normal text-[var(--color-text-primary)]">로딩 중...</p>
        </div>
      )}

      {/* 순간 카드 목록 */}
      {!isLoading && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {visibleEmotions?.map((emotion) => {
            // 장바구니에 담겨있으면 held 상태로 표시
            // 같은 productId를 가진 아이템이 있는지 확인
            const hasInCart = Object.values(cartItems).some(
              (item) => item.product.id === emotion.id
            );
            // Prefer DB-driven status if available
            const dbStatus = orderStatuses ? orderStatuses[emotion.id] : undefined;
            const currentStatus = dbStatus
              ? dbStatus
              : hasInCart
                ? EMOTION_STATUS.HELD
                : emotion.status;
            const statusStyle = getStatusConfig(currentStatus);
            return (
              <div
                key={emotion.id}
                onClick={() => handleProductClick(emotion.id)}
                role="button"
                tabIndex={0}
                aria-label={`product-card-${emotion.id}`}
                className="relative flex cursor-pointer flex-col rounded border border-[var(--color-border-primary)] bg-[var(--color-overlay-2)] p-6 text-left backdrop-blur-[10px] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-accent-green)] hover:bg-[var(--color-overlay-3)]"
              >
                {/* 상태 표시 */}
                <div
                  className={`absolute right-4 top-4 rounded-sm bg-[var(--color-overlay-4)] px-2 py-1 text-[10px] font-normal tracking-wide ${statusStyle.label ? '' : 'hidden'}`}
                  style={{ color: statusStyle.color }}
                >
                  {statusStyle.label}
                </div>

                <div className="mb-4 text-5xl opacity-90">{emotion.emoji}</div>
                <h3 className="mb-1 text-base font-normal leading-6 tracking-wide ">
                  {emotion.name}
                </h3>
                <p className="mb-4 line-clamp-5 min-h-0 flex-1 text-[13px] font-normal leading-relaxed text-[var(--color-text-secondary)]">
                  {emotion.description}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-[var(--color-border-faded)] pt-4">
                  <span className="rounded-sm bg-[var(--color-overlay-3)] px-2.5 py-1 text-[11px] font-normal tracking-wider text-[var(--color-text-muted)]">
                    {CATEGORY_LABELS[emotion.category] ?? emotion.category}
                  </span>
                  <span className="text-sm font-normal tracking-wider text-[var(--color-accent-green)]">
                    ⚡ {emotion.energyCost}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && visibleEmotions?.length === 0 && (
        <div className="py-15 px-5 text-center text-[var(--color-text-muted)]">
          <p className="font-normal">검색 결과가 없습니다.</p>
        </div>
      )}

      <ConditionHintPopup
        emotions={emotions ?? []}
        conditions={conditions}
        isOpen={hintOpen}
        onClose={() => setHintOpen(false)}
      />
    </div>
  );
}

export default ProductList;
