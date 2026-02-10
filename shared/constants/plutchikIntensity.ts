export type IntensityLevel = 'low' | 'middle' | 'high';

export const PLUTCHIK_INTENSITY_MAP: Record<string, string> = {
  // Joy
  serenity: '평온',
  joy: '기쁨',
  ecstasy: '환희',
  // Sadness
  pensiveness: '우울',
  sadness: '슬픔',
  grief: '비탄',
  // Anger
  annoyance: '짜증',
  anger: '분노',
  rage: '격노',
  // Fear
  apprehension: '불안',
  fear: '두려움',
  terror: '공포',
  // Disgust
  boredom: '지루함',
  disgust: '혐오',
  loathing: '증오',
  // Surprise
  distraction: '산만',
  surprise: '놀람',
  amazement: '경탄',
  // Trust
  acceptance: '수용',
  trust: '신뢰',
  admiration: '존경',
  // Anticipation
  interest: '관심',
  anticipation: '기대',
  vigilance: '경계',
};

const PLUTCHIK_INTENSITY_LEVELS: Record<string, IntensityLevel> = {
  serenity: 'low',
  joy: 'middle',
  ecstasy: 'high',
  pensiveness: 'low',
  sadness: 'middle',
  grief: 'high',
  annoyance: 'low',
  anger: 'middle',
  rage: 'high',
  apprehension: 'low',
  fear: 'middle',
  terror: 'high',
  boredom: 'low',
  disgust: 'middle',
  loathing: 'high',
  distraction: 'low',
  surprise: 'middle',
  amazement: 'high',
  acceptance: 'low',
  trust: 'middle',
  admiration: 'high',
  interest: 'low',
  anticipation: 'middle',
  vigilance: 'high',
};

export function normalizeName(name?: string | null): string {
  return (name || '').toString().trim().toLowerCase().replace(/\s+/g, '');
}

export function resolveIntensityByName(name?: string | null): IntensityLevel | null {
  const normalized = normalizeName(name);
  if (normalized && PLUTCHIK_INTENSITY_LEVELS[normalized]) return PLUTCHIK_INTENSITY_LEVELS[normalized];

  if (name) {
    const direct = PLUTCHIK_INTENSITY_LEVELS[name];
    if (direct) return direct;
  }

  // Try mapping Korean name -> English key -> intensity
  for (const [englishKey, koreanValue] of Object.entries(PLUTCHIK_INTENSITY_MAP)) {
    const normalizedKo = normalizeName(koreanValue);
    if (normalized && normalized === normalizedKo) return PLUTCHIK_INTENSITY_LEVELS[englishKey];
    if (name && name === koreanValue) return PLUTCHIK_INTENSITY_LEVELS[englishKey];
  }
  return null;
}
