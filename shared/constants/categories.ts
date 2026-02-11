/**
 * Category labels mapping from category codes to Korean display names
 */
export const CATEGORY_LABELS: Record<string, string> = {
  joy: '기쁨',
  sadness: '슬픔',
  anger: '분노',
  fear: '두려움',
  disgust: '혐오',
  surprise: '놀람',
  trust: '신뢰',
  anticipation: '기대',
  love: '사랑',
  obsession: '집착',
  anxiety: '불안',
  jealousy: '질투',
  disappointment: '실망',
  contempt: '경멸',
  discouragement: '낙담',
  guilt: '죄책감',
  hope: '희망',
  anticipation: '기대',
  submission: '복종',
  awe: '경외',
  disapproval: '비난',
  remorse: '회한',
  aggressiveness: '공격성',
  optimism: '낙관',
};

export const BASE_CATEGORIES = [
  'joy',
  'sadness',
  'anger',
  'fear',
  'disgust',
  'surprise',
  'trust',
  'anticipation',
] as const;

export const COMPOSITE_CATEGORIES = [
  'love',
  'obsession',
  'anxiety',
  'jealousy',
  'disappointment',
  'contempt',
  'discouragement',
  'guilt',
  'hope',
  'submission',
  'awe',
  'disapproval',
  'remorse',
  'aggressiveness',
  'optimism',
] as const;

export function isBaseCategory(category?: string | null): boolean {
  return !!category && BASE_CATEGORIES.includes(category as (typeof BASE_CATEGORIES)[number]);
}

export function isCompositeCategory(category?: string | null): boolean {
  return !!category && COMPOSITE_CATEGORIES.includes(category as (typeof COMPOSITE_CATEGORIES)[number]);
}

export const COMPOSITE_CATEGORY_PAIRS: Record<string, [string, string]> = {
  love: ['joy', 'trust'],
  submission: ['trust', 'fear'],
  awe: ['fear', 'surprise'],
  disapproval: ['surprise', 'sadness'],
  remorse: ['sadness', 'disgust'],
  contempt: ['disgust', 'anger'],
  aggressiveness: ['anger', 'anticipation'],
  optimism: ['anticipation', 'joy'],
};
