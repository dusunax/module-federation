import React, { useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { Emotion } from 'auth/services/emotionService';
import { CurrentConditions, isEmotionVisible } from '../utils/conditions';
import {
  PLUTCHIK_SECTORS,
  RING_NAMES,
  CENTER,
  VIEW_SIZE,
  getSegmentPath,
  getSegmentCentroid,
  getCompositePosition,
  polarToCartesian,
} from '../constants/plutchikWheelConfig';
import {
  CATEGORY_LABELS,
  COMPOSITE_CATEGORY_PAIRS,
} from '@shared/constants/categories';

interface PlutchikWheelProps {
  emotions: Emotion[] | undefined;
  conditions: CurrentConditions;
  onAddToCart: (emotion: Emotion) => void;
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

function PlutchikWheel({ emotions, conditions, onAddToCart }: PlutchikWheelProps): React.ReactElement {
  const [selectedInfo, setSelectedInfo] = useState<SelectedInfo | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

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

    return Object.entries(COMPOSITE_CATEGORY_PAIRS).map(([category, _pair]) => {
      const matching = emotions.filter((e) => e.category === category);
      const visible = matching.filter((e) => isEmotionVisible(e, conditions));
      const sectorIndex = PLUTCHIK_SECTORS.findIndex(
        (s) => s.category === _pair[0]
      );
      return {
        category,
        emotions: matching,
        visibleEmotions: visible,
        position: getCompositePosition(sectorIndex),
        sectorIndex,
      };
    });
  }, [emotions, conditions]);

  const handleSegmentClick = useCallback(
    (segment: SegmentData) => {
      if (segment.emotions.length === 0) return;
      if (segment.visibleEmotions.length === 0) {
        toast.info('현재 조건에서는 이 감정이 보이지 않아요');
        return;
      }
      const label =
        (CATEGORY_LABELS[segment.category] ?? segment.category) +
        ` (${segment.intensity})`;
      setSelectedInfo({
        emotions: segment.visibleEmotions,
        label,
        position: segment.centroid,
      });
    },
    [onAddToCart]
  );

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
    [onAddToCart]
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

  const segmentKey = (s: SegmentData) => `${s.category}-${s.intensity}`;

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${VIEW_SIZE + 100} ${VIEW_SIZE + 100}`}
        className="w-full max-w-[600px]"
        role="img"
        aria-label="Plutchik 감정 바퀴"
      >
        <g transform="translate(50, 50)">
          {/* Segments */}
          {segments.map((segment) => {
            const key = segmentKey(segment);
            const isHovered = hoveredKey === key;
            const opacity = getSegmentOpacity(segment);
            const hasEmotions = segment.emotions.length > 0;

            return (
              <g key={key}>
                <path
                  d={segment.path}
                  fill={segment.color}
                  stroke="var(--color-bg-primary)"
                  strokeWidth={1.5}
                  opacity={isHovered && hasEmotions ? Math.min(opacity + 0.15, 1) : opacity}
                  className={`outline-none${hasEmotions ? ' cursor-pointer' : ''}`}
                  style={{
                    transition: 'opacity 0.15s ease, filter 0.15s ease',
                    filter:
                      isHovered && hasEmotions
                        ? 'brightness(1.15)'
                        : 'brightness(1)',
                  }}
                  role="button"
                  tabIndex={hasEmotions ? 0 : -1}
                  aria-label={`${CATEGORY_LABELS[segment.category] ?? segment.category} ${segment.intensity}`}
                  onClick={() => handleSegmentClick(segment)}
                  onKeyDown={(e) =>
                    handleKeyDown(e, () => handleSegmentClick(segment))
                  }
                  onMouseEnter={() => setHoveredKey(key)}
                  onMouseLeave={() => setHoveredKey(null)}
                />
                {/* Category label (Korean + English) */}
                <text
                  x={segment.centroid.x}
                  y={segment.centroid.y - 5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={segment.ringIndex === 0 ? 9 : 11}
                  fill="var(--color-bg-primary)"
                  fontWeight={600}
                  pointerEvents="none"
                  opacity={0.9}
                >
                  {CATEGORY_LABELS[segment.category] ?? segment.category}
                </text>
                <text
                  x={segment.centroid.x}
                  y={segment.centroid.y + 7}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={segment.ringIndex === 0 ? 7 : 8}
                  fill="var(--color-bg-primary)"
                  fontWeight={400}
                  pointerEvents="none"
                  opacity={0.6}
                >
                  {segment.category}
                </text>
              </g>
            );
          })}

          {/* Center decoration */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={55}
            fill="var(--color-bg-primary)"
            stroke="var(--color-border-primary)"
            strokeWidth={1}
          />
          <text
            x={CENTER}
            y={CENTER - 8}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={14}
            fill="var(--color-text-primary)"
            fontWeight={500}
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
          >
            바퀴
          </text>

          {/* Composite labels */}
          {composites.map((composite) => {
            const hasEmotions = composite.emotions.length > 0;
            const isVisible = composite.visibleEmotions.length > 0;
            const label =
              CATEGORY_LABELS[composite.category] ?? composite.category;
            const compositeKey = `composite-${composite.category}`;
            const isHovered = hoveredKey === compositeKey;

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
                onKeyDown={(e) =>
                  handleKeyDown(e, () => handleCompositeClick(composite))
                }
                onMouseEnter={() => setHoveredKey(compositeKey)}
                onMouseLeave={() => setHoveredKey(null)}
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

      {/* Selection popup */}
      {selectedInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
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
                        {emotion.name}
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
        </div>
      )}
    </div>
  );
}

export default PlutchikWheel;
