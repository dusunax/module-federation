import { collection, doc, getDocs, getDoc, setDoc, updateDoc, query, orderBy, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { BASE_CATEGORIES, COMPOSITE_CATEGORIES } from '@shared/constants/categories';
import { resolveIntensityByName, IntensityLevel } from '@shared/constants/plutchikIntensity';
import type { Emotion } from '@shared/types/api';

interface IntensityConfig {
  [key: string]: {
    energyCost: number;
    order: number;
  };
}

let intensityConfigCache: IntensityConfig | null = null;

function mapRarityToIntensity(rarity?: string): IntensityLevel | null {
  if (rarity === 'common') return 'low';
  if (rarity === 'rare') return 'middle';
  if (rarity === 'epic') return 'high';
  return null;
}

function resolveIntensityByPlutchik(emotion: Emotion): IntensityLevel | null {
  const byName = resolveIntensityByName(emotion.name);
  if (byName) return byName;

  if (BASE_CATEGORIES.includes(emotion.category as (typeof BASE_CATEGORIES)[number])) return 'middle';
  if (COMPOSITE_CATEGORIES.includes(emotion.category as (typeof COMPOSITE_CATEGORIES)[number])) return 'middle';
  return null;
}

function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as T;
  }

  // Only deep-strip plain objects. Leave non-plain objects (e.g. Firestore FieldValue,
  // Timestamp, GeoPoint, Date, etc.) untouched so their special behavior is preserved.
  if (value && typeof value === 'object' && (value as object).constructor === Object) {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, stripUndefined(v)]);
    return Object.fromEntries(entries) as T;
  }

  return value;
}

function toTimestampValue(value: unknown): Timestamp | undefined {
  if (!value) return undefined;
  if (value instanceof Timestamp) return value;
  if (typeof value === 'number') return Timestamp.fromMillis(value);
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return Timestamp.fromMillis(parsed);
  }
  if (value && typeof value === 'object' && 'toDate' in (value as Record<string, unknown>)) {
    const maybe = value as { toDate?: () => Date };
    if (typeof maybe.toDate === 'function') {
      return Timestamp.fromMillis(maybe.toDate().getTime());
    }
  }
  return undefined;
}

export async function getIntensityConfig(): Promise<IntensityConfig> {
  if (intensityConfigCache) return intensityConfigCache;
  const docSnap = await getDoc(doc(db, 'config', 'intensity'));
  intensityConfigCache = (docSnap.exists() ? docSnap.data() : {}) as IntensityConfig;
  return intensityConfigCache;
}

function withIntensityInfo(emotion: Emotion, config: IntensityConfig): Emotion {
  const intensity: IntensityLevel = (emotion.intensity as IntensityLevel) || mapRarityToIntensity((emotion as unknown as { rarity?: string }).rarity || '') || 'low';
  const resolved = config[intensity];
  return {
    ...emotion,
    intensity,
    energyCost: resolved?.energyCost ?? 1,
    intensityOrder: resolved?.order ?? 1,
  };
}

function getCreatedAtValue(createdAt: unknown): number {
  if (!createdAt) return 0;
  if (typeof createdAt === 'number') return createdAt;
  if (typeof createdAt === 'string') {
    const millis = Date.parse(createdAt);
    return Number.isNaN(millis) ? 0 : millis;
  }
  if (createdAt instanceof Timestamp) return createdAt.toMillis();
  if (typeof createdAt === 'object' && createdAt && 'toMillis' in (createdAt as Record<string, unknown>)) {
    const maybe = createdAt as { toMillis?: () => number };
    if (typeof maybe.toMillis === 'function') return maybe.toMillis();
  }
  if (typeof createdAt === 'object' && createdAt && 'toDate' in (createdAt as Record<string, unknown>)) {
    const maybe = createdAt as { toDate?: () => Date };
    if (typeof maybe.toDate === 'function') return maybe.toDate().getTime();
  }
  if (typeof createdAt === 'object' && createdAt && 'seconds' in (createdAt as Record<string, unknown>)) {
    const seconds = (createdAt as { seconds?: number }).seconds;
    if (typeof seconds === 'number') return seconds * 1000;
  }
  return 0;
}

export async function getAllEmotions(searchTerm?: string, { includeAll = false } = {}): Promise<Emotion[]> {
  const [snapshot, config] = await Promise.all([
    getDocs(query(collection(db, 'emotions'), orderBy('id', 'asc'))),
    getIntensityConfig(),
  ]);

  let results: Emotion[] = [];
  snapshot.forEach((docSnap) => {
    results.push(withIntensityInfo(docSnap.data() as Emotion, config));
  });

  results.sort((a, b) => {
    const timeA = getCreatedAtValue(a.createdAt);
    const timeB = getCreatedAtValue(b.createdAt);
    if (timeA !== timeB) return timeB - timeA;
    return b.id - a.id;
  });

  if (!includeAll) {
    results = results.filter((e) => e.published === true);
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    results = results.filter(
      (e) =>
        e.name.toLowerCase().includes(term) ||
        e.category.toLowerCase().includes(term) ||
        e.description.toLowerCase().includes(term) ||
        e.story.toLowerCase().includes(term),
    );
  }

  return results;
}

export async function getEmotionById(id: number): Promise<Emotion | null> {
  const [docSnap, config] = await Promise.all([
    getDoc(doc(db, 'emotions', String(id))),
    getIntensityConfig(),
  ]);
  if (!docSnap.exists()) return null;
  return withIntensityInfo(docSnap.data() as Emotion, config);
}

export async function createEmotion(data: Partial<Emotion>): Promise<void> {
  const intensity = data.intensity || mapRarityToIntensity((data as unknown as { rarity?: string }).rarity);
  const docRef = doc(db, 'emotions', String(data.id));
  await setDoc(
    docRef,
    stripUndefined({
      ...data,
      ...(intensity && { intensity }),
      createdAt: serverTimestamp(),
    }),
  );
}

export async function updateEmotion(id: number, data: Partial<Emotion>): Promise<void> {
  const intensity = data.intensity || mapRarityToIntensity((data as unknown as { rarity?: string }).rarity);
  const docRef = doc(db, 'emotions', String(id));
  const normalizedCreatedAt = toTimestampValue(data.createdAt);
  await updateDoc(
    docRef,
    stripUndefined({
      ...data,
      ...(intensity && { intensity }),
      ...(normalizedCreatedAt ? { createdAt: normalizedCreatedAt } : {}),
    }),
  );
}
