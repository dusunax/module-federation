/**
 * Plutchik 바퀴 SVG 지오메트리
 *
 * 감정 데이터(라벨, 색상)는 @shared/constants/categories 참조.
 * 이 파일은 바퀴 렌더링에 필요한 좌표/경로 계산만 담당.
 */
import {
  BASE_EMOTIONS,
  INTENSITY_LEVELS,
  getIntensityColors,
} from '@shared/constants/categories';

// ─── SVG 상수 ─────────────────────────────────────────

export const CENTER = 250;
export const VIEW_SIZE = 500;
export const COMPOSITE_LABEL_RADIUS = 270;

const ANGLE_STEP = 45;
const ANGLE_OFFSET = -90; // joy = 12시

/** Ring 반경: highest(안쪽) → lowest(바깥쪽) */
export const RING_RADII: [number, number][] = [
  [60, 120],   // highest
  [120, 185],  // middle
  [185, 245],  // lowest
];

export const RING_NAMES = INTENSITY_LEVELS;

// ─── 섹터 (BASE_EMOTIONS에서 파생) ───────────────────

export interface PlutchikSector {
  category: string;
  startAngle: number;
  colors: string[];
}

export const PLUTCHIK_SECTORS: PlutchikSector[] = BASE_EMOTIONS.map(
  (emotion, i) => ({
    category: emotion.code,
    startAngle: ANGLE_OFFSET + i * ANGLE_STEP,
    colors: getIntensityColors(emotion.code),
  })
);

// ─── SVG 경로 유틸 ───────────────────────────────────

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number
): { x: number; y: number } {
  const rad = toRadians(angleDeg);
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

export function describeArc(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number
): string {
  const outerStart = polarToCartesian(cx, cy, outerR, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerR, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
    'Z',
  ].join(' ');
}

export function getSegmentPath(sectorIndex: number, ringIndex: number): string {
  const sector = PLUTCHIK_SECTORS[sectorIndex];
  const [innerR, outerR] = RING_RADII[ringIndex];
  return describeArc(CENTER, CENTER, innerR, outerR, sector.startAngle, sector.startAngle + ANGLE_STEP);
}

export function getSegmentCentroid(
  sectorIndex: number,
  ringIndex: number
): { x: number; y: number } {
  const sector = PLUTCHIK_SECTORS[sectorIndex];
  const [innerR, outerR] = RING_RADII[ringIndex];
  return polarToCartesian(CENTER, CENTER, (innerR + outerR) / 2, sector.startAngle + ANGLE_STEP / 2);
}

export function getCompositePosition(
  sectorIndex: number
): { x: number; y: number } {
  const sector = PLUTCHIK_SECTORS[sectorIndex];
  return polarToCartesian(CENTER, CENTER, COMPOSITE_LABEL_RADIUS, sector.startAngle + ANGLE_STEP);
}
