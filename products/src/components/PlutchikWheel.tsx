import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import type { Emotion } from '@shared/types/api';
import { CurrentConditions, isEmotionVisible } from '../utils/conditions';
import {
  PLUTCHIK_SECTORS,
  RING_NAMES,
  CENTER,
  VIEW_SIZE,
  getSegmentPath,
  getSegmentCentroid,
  getCompositePosition,
} from '../constants/plutchikWheelConfig';
import {
  CATEGORY_LABELS,
  COMPOSITE_CATEGORY_PAIRS,
  getIntensityLabel,
} from '@shared/constants/categories';

interface PlutchikWheelProps {
  emotions: Emotion[] | undefined;
  conditions: CurrentConditions;
  onAddToCart: (emotion: Emotion) => void;
  cartProductIds?: Set<number>;
}

interface SegmentData {
  sectorIndex: number;
  ringIndex: number;
  category: string;
  intensity: string;
  emotions: Emotion[];
  visibleEmotions: Emotion[];
  color: string;
  path: string;
  centroid: { x: number; y: number };
}

interface CompositeData {
  category: string;
  emotions: Emotion[];
  visibleEmotions: Emotion[];
  position: { x: number; y: number };
  sectorIndex: number;
}

interface SelectedInfo {
  emotions: Emotion[];
  label: string;
  position: { x: number; y: number };
}

interface SectorClickState {
  sectorIndex: number;
  clickCount: number;
}

const CLICK_CONFIRM_DELAY = 1000;

function PlutchikWheel({ emotions, conditions, onAddToCart, cartProductIds }: PlutchikWheelProps): React.ReactElement {
  const [selectedInfo, setSelectedInfo] = useState<SelectedInfo | null>(null);
  const [hoveredSector, setHoveredSector] = useState<number | null>(null);
  const [hoveredComposite, setHoveredComposite] = useState<string | null>(null);
  const [sectorClickState, setSectorClickState] = useState<SectorClickState | null>(null);
  const sectorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const segments = useMemo((): SegmentData[] => {
    if (!emotions) return [];
    const result: SegmentData[] = [];
    for (let si = 0; si < PLUTCHIK_SECTORS.length; si++) {
      const sector = PLUTCHIK_SECTORS[si];
      for (let ri = 0; ri < RING_NAMES.length; ri++) {
        const intensity = RING_NAMES[ri];
        const matching = emotions.filter(
          (e) => e.category === sector.category && e.intensity === intensity
        );
        const visible = matching.filter((e) => isEmotionVisible(e, conditions));
        result.push({
          sectorIndex: si,
          ringIndex: ri,
          category: sector.category,
          intensity,
          emotions: matching,
          visibleEmotions: visible,
          color: sector.colors[ri],
          path: getSegmentPath(si, ri),
          centroid: getSegmentCentroid(si, ri),
        });
      }
    }
    return result;
  }, [emotions, conditions]);

  const composites = useMemo((): CompositeData[] => {
    if (!emotions) return [];
    return Object.entries(COMPOSITE_CATEGORY_PAIRS).map(([category, pair]) => {
      const matching = emotions.filter((e) => e.category === category);
      const visible = matching.filter((e) => isEmotionVisible(e, conditions));
      const sectorIndex = PLUTCHIK_SECTORS.findIndex((s) => s.category === pair[0]);
      return { category, emotions: matching, visibleEmotions: visible, position: getCompositePosition(sectorIndex), sectorIndex };
    });
  }, [emotions, conditions]);

  const segmentInCart = useCallback(
    (segment: SegmentData): boolean => {
      if (!cartProductIds || cartProductIds.size === 0) return false;
      return segment.visibleEmotions.some((e) => cartProductIds.has(e.id));
    },
    [cartProductIds]
  );

  // Confirm: map clickCount to ring and add to cart or show popup
  const confirmSectorSelection = useCallback(
    (sectorIndex: number, clickCount: number) => {
      if (!emotions) return;
      const sector = PLUTCHIK_SECTORS[sectorIndex];
      // 1 click → low (ringIndex 2), 2 → middle (1), 3 → high (0)
      const ringIndex = RING_NAMES.length - clickCount;
      const intensity = RING_NAMES[ringIndex];

      const matching = emotions.filter(
        (e) => e.category === sector.category && e.intensity === intensity
      );
      const visible = matching.filter((e) => isEmotionVisible(e, conditions));

      if (matching.length === 0) return;
      if (visible.length === 0) {
        toast.info('현재 조건에서는 이 감정이 보이지 않아요');
        return;
      }
      if (visible.length === 1) {
        onAddToCart(visible[0]);
      } else {
        const label = getIntensityLabel(sector.category, ringIndex);
        setSelectedInfo({
          emotions: visible,
          label: label ? `${label.ko} (${label.en})` : (CATEGORY_LABELS[sector.category] ?? sector.category),
          position: getSegmentCentroid(sectorIndex, ringIndex),
        });
      }
    },
    [emotions, conditions, onAddToCart]
  );

  // Sector-level click: cycles 1→2→3 within the same sector
  const handleSectorClick = useCallback(
    (sectorIndex: number) => {
      const sector = PLUTCHIK_SECTORS[sectorIndex];
      if (!emotions?.some((e) => e.category === sector.category)) return;

      setSectorClickState((prev) => ({
        sectorIndex,
        clickCount: prev && prev.sectorIndex === sectorIndex
          ? (prev.clickCount % 3) + 1
          : 1,
      }));
    },
    [emotions]
  );

  // Auto-confirm after delay
  useEffect(() => {
    if (!sectorClickState) return;
    if (sectorTimerRef.current) clearTimeout(sectorTimerRef.current);

    sectorTimerRef.current = setTimeout(() => {
      confirmSectorSelection(sectorClickState.sectorIndex, sectorClickState.clickCount);
      setSectorClickState(null);
    }, CLICK_CONFIRM_DELAY);

    return () => {
      if (sectorTimerRef.current) clearTimeout(sectorTimerRef.current);
    };
  }, [sectorClickState, confirmSectorSelection]);

  useEffect(() => {
    return () => {
      if (sectorTimerRef.current) clearTimeout(sectorTimerRef.current);
    };
  }, []);

  const handleCompositeClick = useCallback(
    (composite: CompositeData) => {
      if (composite.emotions.length === 0) return;
      if (composite.visibleEmotions.length === 0) {
        toast.info('현재 조건에서는 이 감정이 보이지 않아요');
        return;
      }
      setSelectedInfo({
        emotions: composite.visibleEmotions,
        label: CATEGORY_LABELS[composite.category] ?? composite.category,
        position: composite.position,
      });
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, handler: () => void) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handler();
      }
    },
    []
  );

  const getSegmentOpacity = (segment: SegmentData): number => {
    if (segment.emotions.length === 0) return 0.08;
    if (segment.visibleEmotions.length === 0) return 0.25;
    return 0.85;
  };

  const getPreSelectedRing = (sectorIndex: number): number | null => {
    if (!sectorClickState || sectorClickState.sectorIndex !== sectorIndex) return null;
    return RING_NAMES.length - sectorClickState.clickCount;
  };

  const preSelectionLabel = useMemo(() => {
    if (!sectorClickState) return null;
    const { sectorIndex, clickCount } = sectorClickState;
    const ringIndex = RING_NAMES.length - clickCount;
    const label = getIntensityLabel(PLUTCHIK_SECTORS[sectorIndex].category, ringIndex);
    return label ? { ko: label.ko, en: label.en, clickCount } : null;
  }, [sectorClickState]);

  const segmentKey = (s: SegmentData) => `${s.category}-${s.intensity}`;

  // Size controls
  const SIZE_MIN = 400;
  const SIZE_MAX = 1200;
  const SIZE_STEP = 100;
  const [wheelSize, setWheelSize] = useState(700);
  const sizeLevel = Math.min(9, Math.max(1, Math.round((wheelSize - SIZE_MIN) / SIZE_STEP) + 1));

  // Drag state
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startOx: number; startOy: number } | null>(null);

  const handleCenterPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      dragRef.current = { startX: e.clientX, startY: e.clientY, startOx: offset.x, startOy: offset.y };
      (e.target as Element).setPointerCapture(e.pointerId);
      setIsDragging(true);
    },
    [offset]
  );

  const handleCenterPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      setOffset({
        x: dragRef.current.startOx + (e.clientX - dragRef.current.startX),
        y: dragRef.current.startOy + (e.clientY - dragRef.current.startY),
      });
    },
    []
  );

  const handleCenterPointerUp = useCallback(() => {
    dragRef.current = null;
    setIsDragging(false);
  }, []);

  const svgRef = useRef<SVGSVGElement>(null);
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -20 : 20;
    setWheelSize((s) => Math.min(SIZE_MAX, Math.max(SIZE_MIN, s + delta)));
  }, []);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  return (
    <div className="flex flex-col items-center -translate-y-8 select-none">
      <div className="mb-3 fixed -top-12 flex items-center gap-2 z-10 bg-[#121626]/80 rounded-full p-1">
        <button
          onClick={() => setWheelSize((s) => Math.max(SIZE_MIN, s - SIZE_STEP))}
          disabled={wheelSize <= SIZE_MIN}
          aria-label="wheel-size-decrease"
          className="flex h-7 w-7 cursor-pointer bg-white/20 items-center justify-center rounded-full border border-[var(--color-border-faded)] text-sm text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-border-primary)] hover:text-[var(--color-text-primary)] disabled:cursor-default disabled:opacity-30"
        >
          −
        </button>
        <span className="min-w-[3ch] text-center text-[11px] text-[var(--color-text-faded)]">
          {sizeLevel}
        </span>
        <button
          onClick={() => setWheelSize((s) => Math.min(SIZE_MAX, s + SIZE_STEP))}
          disabled={wheelSize >= SIZE_MAX}
          aria-label="wheel-size-increase"
          className="flex h-7 w-7 cursor-pointer bg-white/20 items-center justify-center rounded-full border border-[var(--color-border-faded)] text-sm text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-border-primary)] hover:text-[var(--color-text-primary)] disabled:cursor-default disabled:opacity-30"
        >
          +
        </button>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_SIZE + 100} ${VIEW_SIZE + 100}`}
        className="w-full"
        style={{
          maxWidth: `${wheelSize}px`,
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        }}
        role="img"
        aria-label="Plutchik 감정 바퀴"
      >
        <g transform="translate(50, 50)">
          {/* Segments */}
          {segments.map((segment) => {
            const key = segmentKey(segment);
            const isSectorHovered = hoveredSector === segment.sectorIndex;
            const preSelectedRing = getPreSelectedRing(segment.sectorIndex);
            const isPreSelected = preSelectedRing === segment.ringIndex;
            const inCart = segmentInCart(segment);
            const baseOpacity = getSegmentOpacity(segment);
            const hasEmotions = segment.emotions.length > 0;

            let opacity = baseOpacity;
            if (inCart) opacity = 1;
            if (isSectorHovered && hasEmotions) opacity = Math.min(opacity + 0.1, 1);
            if (isPreSelected) opacity = 1;

            const strokeColor = isPreSelected ? '#fff' : 'none';
            const strokeWidth = isPreSelected ? 2.5 : 0;

            return (
              <g key={key}>
                <path
                  d={segment.path}
                  fill={segment.color}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  opacity={opacity}
                  className={`outline-none${hasEmotions ? ' cursor-pointer' : ''}`}
                  style={{
                    transition: 'opacity 0.15s ease, filter 0.15s ease',
                    filter: isPreSelected
                      ? 'brightness(1.25)'
                      : inCart
                        ? 'brightness(1.15) saturate(1.4) drop-shadow(0 0 4px rgba(255,255,255,0.4))'
                        : isSectorHovered && hasEmotions
                          ? 'brightness(1.1)'
                          : 'brightness(1)',
                  }}
                  role="button"
                  tabIndex={hasEmotions ? 0 : -1}
                  aria-label={`${CATEGORY_LABELS[segment.category] ?? segment.category} ${segment.intensity}`}
                  onClick={() => handleSectorClick(segment.sectorIndex)}
                  onKeyDown={(e) => handleKeyDown(e, () => handleSectorClick(segment.sectorIndex))}
                  onMouseEnter={() => setHoveredSector(segment.sectorIndex)}
                  onMouseLeave={() => setHoveredSector(null)}
                />
                {/* Intensity label (Korean + English) */}
                {(() => {
                  const label = getIntensityLabel(segment.category, segment.ringIndex);
                  return label ? (
                    <>
                      <text
                        x={segment.centroid.x}
                        y={segment.centroid.y - 4}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={segment.ringIndex === 0 ? 9 : 11}
                        fill={segment.ringIndex === 0 ? '#fff' : 'var(--color-bg-primary)'}
                        fontWeight={600}
                        pointerEvents="none"
                        opacity={0.9}
                      >
                        {label.ko}
                      </text>
                      <text
                        x={segment.centroid.x}
                        y={segment.centroid.y + 7}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={segment.ringIndex === 0 ? 7 : 8}
                        fill={segment.ringIndex === 0 ? '#fff' : 'var(--color-bg-primary)'}
                        fontWeight={400}
                        pointerEvents="none"
                        opacity={segment.ringIndex === 0 ? 0.8 : 0.6}
                      >
                        {label.en}
                      </text>
                    </>
                  ) : null;
                })()}
              </g>
            );
          })}

          {/* Center circle — drag handle + pre-selection feedback */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={55}
            fill="var(--color-bg-primary)"
            stroke={sectorClickState ? 'var(--color-accent-green)' : 'var(--color-border-primary)'}
            strokeWidth={sectorClickState ? 2 : 1}
            className="touch-none"
            style={{ cursor: isDragging ? 'grabbing' : 'grab', transition: 'stroke 0.2s ease' }}
            onPointerDown={handleCenterPointerDown}
            onPointerMove={handleCenterPointerMove}
            onPointerUp={handleCenterPointerUp}
            onPointerCancel={handleCenterPointerUp}
          />
          {preSelectionLabel ? (
            <>
              <text
                x={CENTER}
                y={CENTER - 12}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={13}
                fill="var(--color-accent-green)"
                fontWeight={600}
                pointerEvents="none"
              >
                {preSelectionLabel.ko}
              </text>
              <text
                x={CENTER}
                y={CENTER + 4}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                fill="var(--color-text-muted)"
                pointerEvents="none"
              >
                {preSelectionLabel.en}
              </text>
              <text
                x={CENTER}
                y={CENTER + 20}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={9}
                fill="var(--color-text-faded)"
                pointerEvents="none"
              >
                {'●'.repeat(preSelectionLabel.clickCount)}{'○'.repeat(3 - preSelectionLabel.clickCount)}
              </text>
            </>
          ) : (
            <>
              <text
                x={CENTER}
                y={CENTER - 8}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={14}
                fill="var(--color-text-primary)"
                fontWeight={500}
                pointerEvents="none"
              >
                감정
              </text>
              <text
                x={CENTER}
                y={CENTER + 10}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={11}
                fill="var(--color-text-muted)"
                pointerEvents="none"
              >
                바퀴
              </text>
            </>
          )}

          {/* Composite labels */}
          {composites.map((composite) => {
            const hasEmotions = composite.emotions.length > 0;
            const isVisible = composite.visibleEmotions.length > 0;
            const label = CATEGORY_LABELS[composite.category] ?? composite.category;
            const compositeKey = `composite-${composite.category}`;
            const isHovered = hoveredComposite === compositeKey;

            return (
              <text
                key={compositeKey}
                x={composite.position.x}
                y={composite.position.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                fontStyle="italic"
                fill={
                  isHovered && isVisible
                    ? 'var(--color-accent-green)'
                    : isVisible
                      ? 'var(--color-text-secondary)'
                      : 'var(--color-text-faded)'
                }
                opacity={hasEmotions ? (isVisible ? 0.9 : 0.4) : 0.15}
                className={`outline-none${hasEmotions ? ' cursor-pointer' : ''}`}
                style={{ transition: 'fill 0.15s ease, opacity 0.15s ease' }}
                role={hasEmotions ? 'button' : undefined}
                tabIndex={hasEmotions ? 0 : -1}
                aria-label={`복합 감정: ${label}`}
                onClick={() => handleCompositeClick(composite)}
                onKeyDown={(e) => handleKeyDown(e, () => handleCompositeClick(composite))}
                onMouseEnter={() => setHoveredComposite(compositeKey)}
                onMouseLeave={() => setHoveredComposite(null)}
              >
                {label}
                {composite.visibleEmotions.length > 1
                  ? ` (${composite.visibleEmotions.length})`
                  : ''}
              </text>
            );
          })}
        </g>
      </svg>

      {/* Selection popup (multiple emotions at same intensity) */}
      {selectedInfo &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 left-0 right-0 top-0 bottom-0 z-500 flex items-center justify-center bg-black/50"
            onClick={() => setSelectedInfo(null)}
            aria-label="emotion-select-overlay"
          >
            <div
              className="relative max-h-[80vh] w-[calc(100vw-32px)] max-w-[340px] overflow-y-auto rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] p-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
              aria-label="emotion-select-popup"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                  {selectedInfo.label}
                </h3>
                <button
                  onClick={() => setSelectedInfo(null)}
                  aria-label="emotion-select-close"
                  className="cursor-pointer rounded p-1 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-overlay-3)] hover:text-[var(--color-text-primary)]"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {selectedInfo.emotions.map((emotion) => (
                  <div
                    key={emotion.id}
                    className="flex items-center justify-between gap-3 rounded-md bg-[var(--color-overlay-2)] px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl shrink-0">{emotion.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-sm text-[var(--color-text-primary)] truncate">
                          {emotion.name.ko}
                        </p>
                        <p className="text-[11px] text-[var(--color-text-muted)]">
                          ⚡ {emotion.energyCost}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onAddToCart(emotion);
                        setSelectedInfo(null);
                      }}
                      aria-label={`add-to-cart-${emotion.id}`}
                      className="shrink-0 cursor-pointer rounded border border-[var(--color-border-green)] bg-[var(--color-green-overlay-1)] px-3 py-1.5 text-[11px] font-medium text-[var(--color-accent-green)] transition-colors hover:bg-[var(--color-green-overlay-2)]"
                    >
                      담기
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default PlutchikWheel;
