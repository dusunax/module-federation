export interface PlutchikSector {
  category: string;
  startAngle: number;
  colors: [string, string, string]; // [high, middle, low]
}

const ANGLE_STEP = 45;
const ANGLE_OFFSET = -90; // joy starts at 12 o'clock

const SECTOR_ORDER = [
  'joy',
  'trust',
  'fear',
  'surprise',
  'sadness',
  'disgust',
  'anger',
  'anticipation',
] as const;

const SECTOR_COLORS: Record<string, [string, string, string]> = {
  joy: ['#FFEB3B', '#FFF176', '#FFF9C4'],
  trust: ['#8BC34A', '#AED581', '#DCEDC8'],
  fear: ['#4CAF50', '#81C784', '#C8E6C9'],
  surprise: ['#00BCD4', '#4DD0E1', '#B2EBF2'],
  sadness: ['#2196F3', '#64B5F6', '#BBDEFB'],
  disgust: ['#9C27B0', '#BA68C8', '#E1BEE7'],
  anger: ['#F44336', '#E57373', '#FFCDD2'],
  anticipation: ['#FF9800', '#FFB74D', '#FFE0B2'],
};

export const PLUTCHIK_SECTORS: PlutchikSector[] = SECTOR_ORDER.map(
  (category, i) => ({
    category,
    startAngle: ANGLE_OFFSET + i * ANGLE_STEP,
    colors: SECTOR_COLORS[category],
  })
);

// Ring radii: high (innermost) → low (outermost)
export const RING_RADII: [number, number][] = [
  [60, 120],   // high
  [120, 185],  // middle
  [185, 245],  // low
];

export const RING_NAMES = ['high', 'middle', 'low'] as const;

export const CENTER = 250;
export const VIEW_SIZE = 500;
export const COMPOSITE_LABEL_RADIUS = 270;

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
  const startAngle = sector.startAngle;
  const endAngle = startAngle + ANGLE_STEP;
  return describeArc(CENTER, CENTER, innerR, outerR, startAngle, endAngle);
}

export function getSegmentCentroid(
  sectorIndex: number,
  ringIndex: number
): { x: number; y: number } {
  const sector = PLUTCHIK_SECTORS[sectorIndex];
  const [innerR, outerR] = RING_RADII[ringIndex];
  const midAngle = sector.startAngle + ANGLE_STEP / 2;
  const midR = (innerR + outerR) / 2;
  return polarToCartesian(CENTER, CENTER, midR, midAngle);
}

export function getCompositePosition(
  sectorIndex: number
): { x: number; y: number } {
  const sector = PLUTCHIK_SECTORS[sectorIndex];
  const midAngle = sector.startAngle + ANGLE_STEP;
  return polarToCartesian(CENTER, CENTER, COMPOSITE_LABEL_RADIUS, midAngle);
}
