/**
 * Plutchik 감정 시스템 — 단일 소스
 *
 * 구조:
 *   BASE_EMOTIONS      8개 기본 감정 (시계방향, 12시=joy)
 *     └ intensities[]  3단계 강도 (highest→middle→lowest, 안쪽→바깥쪽)
 *   COMPOSITE_EMOTIONS 8개 복합 감정 (인접 기본 감정 사이)
 *   INTENSITY_LEVELS   강도 단계 순서
 *
 * 다른 파일에서는 여기서 export된 상수/헬퍼만 사용합니다.
 */

// ─── 타입 ────────────────────────────────────────────

export interface EmotionIntensity {
  ko: string;
  en: string;
  color: string;
}

export interface BaseEmotion {
  code: string;
  ko: string;
  /** highest(안쪽) → lowest(바깥쪽) 순서 */
  intensities: [EmotionIntensity, EmotionIntensity, EmotionIntensity];
}

export interface CompositeEmotion {
  code: string;
  ko: string;
  /** 인접한 두 기본 감정 [시계방향 앞, 뒤] */
  pair: [string, string];
}

// ─── 강도 단계 ───────────────────────────────────────

export const INTENSITY_LEVELS = ['high', 'middle', 'low'] as const;
export type IntensityLevel = (typeof INTENSITY_LEVELS)[number];

// ─── 8개 기본 감정 (시계방향, 12시=joy) ──────────────
//
//  각 행: { ko, en, color }  ← highest → middle → lowest

export const BASE_EMOTIONS: BaseEmotion[] = [
  {
    code: 'joy', ko: '기쁨',
    intensities: [
      { ko: '황홀',   en: 'ecstasy',      color: '#F9A825' },
      { ko: '기쁨',   en: 'joy',          color: '#FFF176' },
      { ko: '평온',   en: 'serenity',     color: '#FFFDE7' },
    ],
  },
  {
    code: 'trust', ko: '신뢰',
    intensities: [
      { ko: '경탄',   en: 'admiration',   color: '#558B2F' },
      { ko: '신뢰',   en: 'trust',        color: '#AED581' },
      { ko: '수용',   en: 'acceptance',   color: '#F1F8E9' },
    ],
  },
  {
    code: 'fear', ko: '두려움',
    intensities: [
      { ko: '공포',   en: 'terror',       color: '#2E7D32' },
      { ko: '두려움', en: 'fear',         color: '#81C784' },
      { ko: '우려',   en: 'apprehension', color: '#E8F5E9' },
    ],
  },
  {
    code: 'surprise', ko: '놀람',
    intensities: [
      { ko: '경악',   en: 'amazement',    color: '#00838F' },
      { ko: '놀람',   en: 'surprise',     color: '#4DD0E1' },
      { ko: '산만',   en: 'distraction',  color: '#E0F7FA' },
    ],
  },
  {
    code: 'sadness', ko: '슬픔',
    intensities: [
      { ko: '비탄',   en: 'grief',        color: '#1565C0' },
      { ko: '슬픔',   en: 'sadness',      color: '#64B5F6' },
      { ko: '수심',   en: 'pensiveness',  color: '#E3F2FD' },
    ],
  },
  {
    code: 'disgust', ko: '혐오',
    intensities: [
      { ko: '증오',   en: 'loathing',     color: '#6A1B9A' },
      { ko: '혐오',   en: 'disgust',      color: '#BA68C8' },
      { ko: '권태',   en: 'boredom',      color: '#F3E5F5' },
    ],
  },
  {
    code: 'anger', ko: '분노',
    intensities: [
      { ko: '격분',   en: 'rage',         color: '#C62828' },
      { ko: '분노',   en: 'anger',        color: '#E57373' },
      { ko: '성가심', en: 'annoyance',    color: '#FFEBEE' },
    ],
  },
  {
    code: 'anticipation', ko: '기대',
    intensities: [
      { ko: '경계',   en: 'vigilance',    color: '#E65100' },
      { ko: '기대',   en: 'anticipation', color: '#FFB74D' },
      { ko: '관심',   en: 'interest',     color: '#FFF3E0' },
    ],
  },
];

// ─── 8개 복합 감정 (인접 기본 감정 사이, 시계방향) ───

export const COMPOSITE_EMOTIONS: CompositeEmotion[] = [
  { code: 'love',            ko: '사랑',   pair: ['joy', 'trust'] },
  { code: 'submission',      ko: '복종',   pair: ['trust', 'fear'] },
  { code: 'awe',             ko: '경외',   pair: ['fear', 'surprise'] },
  { code: 'disapproval',     ko: '비난',   pair: ['surprise', 'sadness'] },
  { code: 'remorse',         ko: '회한',   pair: ['sadness', 'disgust'] },
  { code: 'contempt',        ko: '경멸',   pair: ['disgust', 'anger'] },
  { code: 'aggressiveness',  ko: '공격성', pair: ['anger', 'anticipation'] },
  { code: 'optimism',        ko: '낙관',   pair: ['anticipation', 'joy'] },
];

// ─── 파생 상수 (위 마스터 데이터에서 자동 생성) ──────

/** 카테고리 코드 → 한글 라벨 (기본 + 강도별 + 복합 전체) */
export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries([
  ...BASE_EMOTIONS.map((e) => [e.code, e.ko]),
  ...BASE_EMOTIONS.flatMap((e) => e.intensities.map((i) => [i.en, i.ko])),
  ...COMPOSITE_EMOTIONS.map((e) => [e.code, e.ko]),
]);

/** 기본 카테고리 코드 배열 */
export const BASE_CATEGORIES = BASE_EMOTIONS.map((e) => e.code);

/** 복합 카테고리 코드 배열 */
export const COMPOSITE_CATEGORIES = COMPOSITE_EMOTIONS.map((e) => e.code);

/** 복합 감정 → 인접 기본 감정 쌍 */
export const COMPOSITE_CATEGORY_PAIRS: Record<string, [string, string]> = Object.fromEntries(
  COMPOSITE_EMOTIONS.map((e) => [e.code, e.pair])
);

// ─── 헬퍼 함수 ──────────────────────────────────────

const baseIndex = new Map(BASE_EMOTIONS.map((e, i) => [e.code, i]));

export function isBaseCategory(category?: string | null): boolean {
  return !!category && baseIndex.has(category);
}

export function isCompositeCategory(category?: string | null): boolean {
  return !!category && COMPOSITE_EMOTIONS.some((e) => e.code === category);
}

/** 기본 감정의 강도별 라벨 조회 */
export function getIntensityLabel(
  categoryCode: string,
  ringIndex: number
): EmotionIntensity | undefined {
  const base = BASE_EMOTIONS.find((e) => e.code === categoryCode);
  return base?.intensities[ringIndex];
}

/** 기본 감정의 색상 배열 (highest→lowest) */
export function getIntensityColors(categoryCode: string): string[] {
  const base = BASE_EMOTIONS.find((e) => e.code === categoryCode);
  return base ? base.intensities.map((i) => i.color) : [];
}
