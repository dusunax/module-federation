import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCartStore } from './store/cartStore';
import { useRememberingStore } from 'auth/rememberingStore';
import { useOrderStore } from './store/orderStore';
import { getStatusConfig } from './utils/statusStyle';
import { isEmotionVisible } from './utils/conditions';
import { EMOTION_STATUS } from './constants';
import { getAllEmotions, Emotion } from 'auth/services/emotionService';
import { useCurrentConditions } from './hooks/useCurrentConditions';
import ConditionHintPopup from './components/ConditionHintPopup';
import CurrentConditionUI from './components/CurrentConditionUI';
import PlutchikWheel from './components/PlutchikWheel';
import { InfoIcon, ListIcon, CircleDotIcon } from 'lucide-react';
import { CATEGORY_LABELS } from '@shared/constants/categories';

type ViewMode = 'list' | 'wheel';
type SortDirection = 'asc' | 'desc' | null;
type CollectionFilter = 'all' | 'collected' | 'uncollected';

interface SortPrefs {
  energySort: SortDirection;
}

const STORAGE_KEY = 'emotion-sort-prefs';
const ENERGY_STATES: SortDirection[] = ['asc', 'desc', null];

const ENERGY_LABELS: Record<string, string> = { asc: '낮은순', desc: '높은순' };
const ARROW: Record<string, string> = { asc: '↑', desc: '↓' };
const INTENSITY_LABELS: Record<string, string> = {
  low: 'Low',
  middle: 'Middle',
  high: 'High',
};

function loadSortPrefs(): SortPrefs {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as SortPrefs;
  } catch {
    /* ignore */
  }
  return { energySort: null };
}

function saveSortPrefs(energySort: SortDirection) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ energySort }));
}

function ProductList() {
  const [viewMode, setViewMode] = useState<ViewMode>('wheel');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortPrefs, setSortPrefs] = useState<SortPrefs>(loadSortPrefs);
  const [hintOpen, setHintOpen] = useState(false);
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter>('all');
  const { energySort } = sortPrefs;
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);
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

  const updateSort = useCallback((nextEnergy: SortDirection) => {
    setSortPrefs({ energySort: nextEnergy });
    saveSortPrefs(nextEnergy);
  }, []);

  const sortedEmotions = React.useMemo((): Emotion[] | undefined => {
    if (!emotions) return emotions;
    if (!energySort) return emotions;
    const sorted = [...emotions];
    sorted.sort((a: Emotion, b: Emotion) => {
      if (energySort) {
        const dir = energySort === 'asc' ? 1 : -1;
        const diff = (a.energyCost - b.energyCost) * dir;
        if (diff !== 0) return diff;
      }
      return 0;
    });
    return sorted;
  }, [emotions, energySort]);

  const visibleEmotions = React.useMemo((): Emotion[] | undefined => {
    if (!sortedEmotions) return sortedEmotions;
    const filtered = sortedEmotions.filter((emotion) => isEmotionVisible(emotion, conditions));
    if (collectionFilter === 'all') return filtered;
    return filtered.filter((emotion) => {
      const status = orderStatuses?.[emotion.id];
      const collected = status === EMOTION_STATUS.REMEMBERED;
      return collectionFilter === 'collected' ? collected : !collected;
    });
  }, [sortedEmotions, conditions, collectionFilter, orderStatuses]);

  const handleEnergyToggle = useCallback(() => {
    const idx = ENERGY_STATES.indexOf(energySort);
    const next = ENERGY_STATES[(idx + 1) % ENERGY_STATES.length];
    updateSort(next);
  }, [energySort, updateSort]);

  const handleCollectionToggle = useCallback(() => {
    setCollectionFilter((prev) => {
      if (prev === 'all') return 'collected';
      if (prev === 'collected') return 'uncollected';
      return 'all';
    });
  }, []);

  const handleAddToCart = useCallback(
    (emotion: Emotion) => {
      addToCart(emotion);
      const cartState = useCartStore.getState();
      const rememberingState = useRememberingStore.getState();
      const rememberingItemIds = Object.keys(rememberingState.rememberingItems).map(Number);
      const normalQuantity = Object.values(cartState.items)
        .filter((item) => item.product.id === emotion.id && !rememberingItemIds.includes(item.id))
        .reduce((sum, item) => sum + item.quantity, 0);
      toast.success(`이 순간이 ${normalQuantity}만큼 담겨있어요`);
    },
    [addToCart]
  );

  const handleProductClick = (id: number) => {
    navigate(`/detail/${id}`);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-3 md:px-5">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="flex relative">
          {/* 현재 조건 */}
          <CurrentConditionUI view={view} />
          
          <button
            onClick={() => setHintOpen(true)}
            aria-label="condition-hint-button"
            className="self-end flex absolute bottom-0 right-0 md:static h-8 w-8 shrink-0 items-center md:-translate-x-1/2  justify-center rounded-full border-2 text-2xl no-underline transition-colors bg-[var(--color-overlay-3)] border-[var(--color-border-primary)] hover:bg-[var(--color-overlay-3)] cursor-pointer" 
          >
            <InfoIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 min-w-0 flex flex-col items-stretch md:items-end gap-3">
          {/* 검색 */}
          {viewMode === 'list' && (
            <input
              type="text"
              aria-label="products-search"
              placeholder="순간, 카테고리, 스토리로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:max-w-[500px] rounded border border-[var(--color-border-primary)] bg-[var(--color-overlay-3)] px-4 py-3.5 text-sm font-normal text-[var(--color-text-primary)] outline-none transition-all duration-300 focus:border-[var(--color-accent-green)] focus:bg-[var(--color-overlay-4)]"
            />
          )}

          {/* 뷰 모드 토글 + 정렬/필터 */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-full border border-[var(--color-border-faded)] overflow-hidden mr-1">
              <button
                onClick={() => setViewMode('wheel')}
                aria-label="view-mode-wheel"
                className={`flex cursor-pointer items-center gap-1 px-2.5 py-1.5 text-[11px] font-normal tracking-wide transition-all duration-200 ${
                  viewMode === 'wheel'
                    ? 'bg-[var(--color-green-overlay-1)] text-[var(--color-accent-green)]'
                    : 'bg-transparent text-[var(--color-text-faded)] hover:text-[var(--color-text-muted)]'
                }`}
              >
                <CircleDotIcon size={12} />
                감정 바퀴
              </button><button
                onClick={() => setViewMode('list')}
                aria-label="view-mode-list"
                className={`flex cursor-pointer items-center gap-1 px-2.5 py-1.5 text-[11px] font-normal tracking-wide transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-[var(--color-green-overlay-1)] text-[var(--color-accent-green)]'
                    : 'bg-transparent text-[var(--color-text-faded)] hover:text-[var(--color-text-muted)]'
                }`}
              >
                <ListIcon size={12} />
                목록
              </button>
            </div>
            {viewMode === 'list' && (
              <>
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
                <button
                  onClick={handleCollectionToggle}
                  aria-label="products-filter-collection"
                  className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-normal tracking-wide transition-all duration-200 ${
                    collectionFilter === 'all'
                      ? 'border-[var(--color-border-faded)] bg-transparent text-[var(--color-text-faded)] hover:border-[var(--color-border-primary)] hover:text-[var(--color-text-muted)]'
                      : 'border-[var(--color-border-green)] bg-[var(--color-green-overlay-1)] text-[var(--color-accent-green)]'
                  }`}
                >
                  {collectionFilter === 'all' && '수집 필터: 끔'}
                  {collectionFilter === 'collected' && '수집만'}
                  {collectionFilter === 'uncollected' && '미수집만'}
                </button>
              </>
            )}
          </div>

          {/* 에러 표시 */}
          {error && (
            <div className="mb-5 rounded border border-[var(--color-border-primary)] bg-[var(--color-overlay-2)] p-5 text-center text-[var(--color-text-primary)]">
              <p>에러: {error.message}</p>
            </div>
          )}
        </div>
      </div>


      {viewMode === 'list' && (
        <>
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
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 md:gap-6">
              {visibleEmotions?.map((emotion) => {
                const hasInCart = Object.values(cartItems).some(
                  (item) => item.product.id === emotion.id
                );
                const dbStatus = orderStatuses ? orderStatuses[emotion.id] : undefined;
                const currentStatus = dbStatus
                  ? dbStatus
                  : hasInCart
                    ? EMOTION_STATUS.HELD
                    : EMOTION_STATUS.NOTICING;
                const statusStyle = getStatusConfig(currentStatus);
                return (
                  <div
                    key={emotion.id}
                    onClick={() => handleProductClick(emotion.id)}
                    role="button"
                    tabIndex={0}
                    aria-label={`product-card-${emotion.id}`}
                    className="relative flex cursor-pointer flex-col rounded border border-[var(--color-border-primary)] bg-[var(--color-overlay-2)] p-4 md:p-6 text-left backdrop-blur-[10px] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-accent-green)] hover:bg-[var(--color-overlay-3)]"
                  >
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
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-sm bg-[var(--color-overlay-3)] px-2.5 py-1 text-[11px] font-normal tracking-wider text-[var(--color-text-muted)]">
                          {CATEGORY_LABELS[emotion.category] ?? emotion.category}
                        </span>
                        {emotion.intensity && (
                          <span className="rounded-sm border border-[rgba(163,176,135,0.35)] bg-[rgba(163,176,135,0.12)] px-2 py-0.5 text-[10px] font-normal tracking-wider text-[#A3B087]">
                            강도 {INTENSITY_LABELS[emotion.intensity] ?? emotion.intensity}
                          </span>
                        )}
                      </div>
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
        </>
      )}

      {viewMode === 'wheel' && (
        <>
          {isLoading && !emotions ? (
            <div className="py-15 text-center">
              <p className="font-normal text-[var(--color-text-primary)]">로딩 중...</p>
            </div>
          ) : (
            <PlutchikWheel
              emotions={emotions}
              conditions={conditions}
              onAddToCart={handleAddToCart}
            />
          )}
        </>
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
