import { collection, doc, getDocs, writeBatch, getDoc, limit, query } from 'firebase/firestore';
import { db } from '../firebase';
import { BASE_EMOTIONS, COMPOSITE_EMOTIONS } from '@shared/constants/categories';
import type { VisibilityCondition } from '@shared/types/api';

interface SeedEmotionInput {
  name: { ko: string; en: string };
  emoji: string;
  intensity: 'high' | 'middle' | 'low';
  category: string;
  description: { ko: string; en: string };
  published: boolean;
  image: null;
  visibility: VisibilityCondition;
}

const INTENSITY_LEVELS = ['high', 'middle', 'low'] as const;

const EMOJIS: Record<string, string[]> = {
  joy:          ['🤩', '😊', '😌', '🥳', '😁', '🌈', '✨', '🎶', '🌻'],
  trust:        ['🤝', '😇', '🙂', '💎', '🛡️', '🤗', '🕊️', '🌿', '👐'],
  fear:         ['😱', '😨', '😟', '💀', '🕷️', '👻', '🌑', '⚡', '🫣'],
  surprise:     ['😲', '🤯', '😮', '🎉', '❗', '🫢', '💥', '🪄', '🌟'],
  sadness:      ['😭', '😢', '😔', '🌧️', '💧', '🥀', '🖤', '😿', '🫠'],
  disgust:      ['🤮', '😤', '😒', '🤢', '👎', '💢', '🚫', '😑', '🤦'],
  anger:        ['🤬', '😡', '😠', '🔥', '💣', '👊', '⚔️', '🌋', '💥'],
  anticipation: ['🔮', '🤔', '🧐', '⏳', '🎯', '🔭', '🌅', '📡', '🗺️'],
};

const COMPOSITE_EMOJIS: Record<string, string[]> = {
  love: ['❤️', '💞', '💗'],
  submission: ['🙏', '🙇', '🤝'],
  awe: ['😲', '🌌', '✨'],
  disapproval: ['🙅', '😒', '👎'],
  remorse: ['😔', '💧', '🕯️'],
  contempt: ['😒', '🧊', '🫤'],
  aggressiveness: ['🐺', '⚔️', '🔥'],
  optimism: ['🌤️', '🌈', '✨'],
};

const CONDITION_POOL_SINGLE: Partial<VisibilityCondition>[] = [
  { time: ['day'] },
  { time: ['night'] },
  { season: ['spring'] },
  { season: ['summer'] },
  { season: ['autumn'] },
  { season: ['winter'] },
  { day: ['weekday'] },
  { day: ['weekend'] },
  { weather: ['clear'] },
  { weather: ['rain'] },
];

const CONDITION_POOL_DOUBLE: Partial<VisibilityCondition>[] = [
  { time: ['day'], season: ['spring'] },
  { time: ['day'], season: ['summer'] },
  { time: ['day'], season: ['autumn'] },
  { time: ['night'], season: ['winter'] },
  { time: ['night'], season: ['summer'] },
  { time: ['day'], day: ['weekend'] },
  { time: ['night'], day: ['weekend'] },
  { time: ['day'], weather: ['clear'] },
  { time: ['night'], weather: ['rain'] },
  { season: ['spring'], weather: ['clear'] },
  { season: ['autumn'], weather: ['rain'] },
  { season: ['winter'], weather: ['snow'] },
  { day: ['weekday'], season: ['spring'] },
  { day: ['weekend'], season: ['summer'] },
  { time: ['day'], season: ['winter'] },
  { time: ['night'], season: ['autumn'] },
  { season: ['summer'], weather: ['clear'] },
  { day: ['weekday'], time: ['day'] },
  { day: ['weekend'], weather: ['clear'] },
  { season: ['spring'], day: ['weekend'] },
  { season: ['winter'], weather: ['clear'] },
  { time: ['night'], weather: ['clear'] },
  { day: ['weekday'], weather: ['rain'] },
  { season: ['autumn'], day: ['weekday'] },
];

const EMPTY_VISIBILITY: VisibilityCondition = {
  time: [], day: [], weather: [], season: [], event: [],
};

function makeVisibility(partial: Partial<VisibilityCondition>): VisibilityCondition {
  return { ...EMPTY_VISIBILITY, ...partial };
}

interface EventDef {
  event: string;
  category: string;
  intensity: 'high' | 'middle' | 'low';
  emoji: string;
  name: { ko: string; en: string };
  description: { ko: string; en: string };
}

const EVENT_EMOTIONS: EventDef[] = [
  {
    event: 'newyear', category: 'anticipation', intensity: 'middle', emoji: '🎆',
    name: { ko: '새해 복 많이 받으세요', en: 'Happy New Year!' },
    description: { ko: '새로운 시작에 대한 기대와 희망', en: 'A feeling full of expectation and hope for new beginnings' },
  },
  {
    event: 'seollal', category: 'joy', intensity: 'middle', emoji: '🧧',
    name: { ko: '설날의 포근함', en: 'Seollal Warmth' },
    description: { ko: '가족과 함께하는 설날의 포근한 정서', en: 'A warm feeling shared with family during Seollal' },
  },
  {
    event: 'valentines', category: 'joy', intensity: 'high', emoji: '💝',
    name: { ko: '발렌타인의 두근거림', en: 'Valentine\'s Flutter' },
    description: { ko: '사랑하는 사람을 향한 두근거리는 마음', en: 'A fluttering heart toward someone you love' },
  },
  {
    event: 'whiteday', category: 'trust', intensity: 'middle', emoji: '🤍',
    name: { ko: '화이트데이 감사', en: 'White Day Gratitude' },
    description: { ko: '받은 마음에 보답하고 싶은 따뜻한 감사', en: 'Warm gratitude wanting to return the love received' },
  },
  {
    event: 'halloween', category: 'surprise', intensity: 'high', emoji: '🎃',
    name: { ko: '할로윈 스릴', en: 'Halloween Thrill' },
    description: { ko: '으스스하면서도 즐거운 축제의 짜릿함', en: 'The thrill of a spooky yet joyful festival' },
  },
  {
    event: 'christmas', category: 'joy', intensity: 'middle', emoji: '🎄',
    name: { ko: '크리스마스 온기', en: 'Christmas Warmth' },
    description: { ko: '함께하는 따뜻함과 나눔의 기쁨', en: 'The warmth of togetherness and the joy of sharing' },
  },
  {
    event: 'chuseok', category: 'trust', intensity: 'low', emoji: '🌕',
    name: { ko: '추석 넉넉함', en: 'Chuseok Abundance' },
    description: { ko: '풍요로운 수확과 가족의 정이 느껴지는 넉넉한 마음', en: 'A generous feeling of abundant harvest and family bonds' },
  },
];

function buildBaseEmotions(): SeedEmotionInput[] {
  const emotions: SeedEmotionInput[] = [];
  let singleIdx = 0;
  let doubleIdx = 0;

  for (const base of BASE_EMOTIONS) {
    const emojiList = EMOJIS[base.code] ?? ['❓', '❓', '❓', '❓', '❓', '❓', '❓', '❓', '❓'];

    for (let ringIdx = 0; ringIdx < 3; ringIdx++) {
      const intensity = INTENSITY_LEVELS[ringIdx];
      const info = base.intensities[ringIdx];

      // Emotion 1: no conditions (always visible)
      emotions.push({
        name: { ko: info.ko, en: info.en },
        emoji: emojiList[ringIdx * 3],
        intensity,
        category: base.code,
        description: {
          ko: `${info.ko}(${info.en})은(는) ${base.ko}의 ${intensity === 'high' ? '강한' : intensity === 'middle' ? '보통' : '약한'} 형태입니다.`,
          en: `${info.en} is a ${intensity} intensity form of ${base.code}.`,
        },
        published: true,
        image: null,
        visibility: EMPTY_VISIBILITY,
      });

      // Emotion 2: 1 condition
      const singleCond = CONDITION_POOL_SINGLE[singleIdx % CONDITION_POOL_SINGLE.length];
      singleIdx++;
      emotions.push({
        name: {
          ko: `${info.ko}의 순간`,
          en: `Moment of ${info.en}`,
        },
        emoji: emojiList[ringIdx * 3 + 1],
        intensity,
        category: base.code,
        description: {
          ko: `특정 조건에서 느껴지는 ${info.ko}의 순간`,
          en: `A moment of ${info.en} felt under specific conditions`,
        },
        published: true,
        image: null,
        visibility: makeVisibility(singleCond),
      });

      // Emotion 3: 2 conditions
      const doubleCond = CONDITION_POOL_DOUBLE[doubleIdx % CONDITION_POOL_DOUBLE.length];
      doubleIdx++;
      emotions.push({
        name: {
          ko: `깊은 ${info.ko}`,
          en: `Deep ${info.en}`,
        },
        emoji: emojiList[ringIdx * 3 + 2],
        intensity,
        category: base.code,
        description: {
          ko: `복합적인 조건 속에서 깊어지는 ${info.ko}`,
          en: `${info.en} deepening under multiple conditions`,
        },
        published: true,
        image: null,
        visibility: makeVisibility(doubleCond),
      });
    }
  }

  return emotions;
}

function buildCompositeEmotions(): SeedEmotionInput[] {
  const emotions: SeedEmotionInput[] = [];
  let singleIdx = 0;
  let doubleIdx = 0;

  for (const composite of COMPOSITE_EMOTIONS) {
    const emojiList = COMPOSITE_EMOJIS[composite.code] ?? ['❓', '❓', '❓'];

    for (let idx = 0; idx < 3; idx++) {
      const intensity = INTENSITY_LEVELS[idx];
      const ko = composite.ko;
      const en = composite.code;

      if (idx === 0) {
        emotions.push({
          name: { ko, en },
          emoji: emojiList[0],
          intensity,
          category: composite.code,
          description: {
            ko: `${ko} 감정 그대로의 순간`,
            en: `A pure moment of ${en}.`,
          },
          published: true,
          image: null,
          visibility: EMPTY_VISIBILITY,
        });
        continue;
      }

      if (idx === 1) {
        const singleCond = CONDITION_POOL_SINGLE[singleIdx % CONDITION_POOL_SINGLE.length];
        singleIdx++;
        emotions.push({
          name: { ko: `${ko}의 순간`, en: `Moment of ${en}` },
          emoji: emojiList[1],
          intensity,
          category: composite.code,
          description: {
            ko: `특정 조건에서 느껴지는 ${ko}`,
            en: `A moment of ${en} felt under specific conditions`,
          },
          published: true,
          image: null,
          visibility: makeVisibility(singleCond),
        });
        continue;
      }

      const doubleCond = CONDITION_POOL_DOUBLE[doubleIdx % CONDITION_POOL_DOUBLE.length];
      doubleIdx++;
      emotions.push({
        name: { ko: `깊은 ${ko}`, en: `Deep ${en}` },
        emoji: emojiList[2],
        intensity,
        category: composite.code,
        description: {
          ko: `복합적인 조건 속에서 깊어지는 ${ko}`,
          en: `${en} deepening under multiple conditions`,
        },
        published: true,
        image: null,
        visibility: makeVisibility(doubleCond),
      });
    }
  }

  return emotions;
}

function buildEventEmotions(): SeedEmotionInput[] {
  return EVENT_EMOTIONS.map((def) => ({
    name: def.name,
    emoji: def.emoji,
    intensity: def.intensity,
    category: def.category,
    description: def.description,
    published: true,
    image: null,
    visibility: makeVisibility({ event: [def.event] }),
  }));
}

export async function isEmotionsCollectionEmpty(): Promise<boolean> {
  const snapshot = await getDocs(query(collection(db, 'emotions'), limit(1)));
  return snapshot.empty;
}

export async function seedEmotions(): Promise<number> {
  const baseEmotions = buildBaseEmotions();
  const compositeEmotions = buildCompositeEmotions();
  const eventEmotions = buildEventEmotions();
  const allEmotions = [...baseEmotions, ...compositeEmotions, ...eventEmotions];

  const existingSnapshot = await getDocs(collection(db, 'emotions'));
  let maxId = 0;
  const existingNames = new Set<string>();

  const normalize = (value: unknown): string | null => {
    if (typeof value === 'string') return value.trim().toLowerCase();
    if (value && typeof value === 'object' && 'ko' in value) {
      const ko = (value as { ko?: unknown }).ko;
      if (typeof ko === 'string') return ko.trim().toLowerCase();
    }
    return null;
  };

  existingSnapshot.forEach((docSnap) => {
    const data = docSnap.data() as { id?: number; name?: unknown };
    if (typeof data.id === 'number' && data.id > maxId) maxId = data.id;
    const key = normalize(data.name);
    if (key) existingNames.add(key);
  });

  const batch = writeBatch(db);

  let created = 0;
  for (const emotion of allEmotions) {
    const key = normalize(emotion.name);
    if (key && existingNames.has(key)) continue;
    maxId += 1;
    const docRef = doc(db, 'emotions', String(maxId));
    batch.set(docRef, { id: maxId, ...emotion });
    created += 1;
  }

  // Seed config/intensity if not present
  const intensityDocRef = doc(db, 'config', 'intensity');
  const intensitySnap = await getDoc(intensityDocRef);
  if (!intensitySnap.exists()) {
    batch.set(intensityDocRef, {
      low: { energyCost: 1, order: 3 },
      middle: { energyCost: 2, order: 2 },
      high: { energyCost: 3, order: 1 },
    });
  }

  if (created > 0 || !intensitySnap.exists()) {
    await batch.commit();
  }

  return created;
}
