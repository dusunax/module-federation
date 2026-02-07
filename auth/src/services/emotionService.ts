import { collection, doc, getDocs, getDoc, setDoc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface VisibilityCondition {
  time: ('day' | 'night')[];
  day: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | 'weekday' | 'weekend')[];
  weather: ('clear' | 'cloudy' | 'rain' | 'snow' | 'storm')[];
  season: ('spring' | 'summer' | 'autumn' | 'winter')[];
  event: string[];
}

export interface Emotion {
  id: number;
  name: string;
  emoji: string;
  rarity: string;
  category: string;
  description: string;
  story: string;
  effects: string[];
  published: boolean;
  image: string | null;
  energyCost?: number;
  rarityOrder?: number;
  createdAt?: { seconds: number };
  status?: string;
  visibility?: VisibilityCondition;
}

interface RarityConfig {
  [key: string]: {
    energyCost: number;
    order: number;
  };
}

let rarityConfigCache: RarityConfig | null = null;

export async function getRarityConfig(): Promise<RarityConfig> {
  if (rarityConfigCache) return rarityConfigCache;
  const docSnap = await getDoc(doc(db, 'config', 'rarity'));
  rarityConfigCache = docSnap.data() as RarityConfig;
  return rarityConfigCache;
}

function withRarityInfo(emotion: Emotion, config: RarityConfig): Emotion {
  const rarity = config[emotion.rarity];
  return {
    ...emotion,
    energyCost: rarity.energyCost,
    rarityOrder: rarity.order,
  };
}

export async function getAllEmotions(searchTerm?: string, { includeAll = false } = {}): Promise<Emotion[]> {
  const [snapshot, config] = await Promise.all([
    getDocs(query(collection(db, 'emotions'), orderBy('id', 'asc'))),
    getRarityConfig(),
  ]);

  let results: Emotion[] = [];
  snapshot.forEach((docSnap) => {
    results.push(withRarityInfo(docSnap.data() as Emotion, config));
  });

  results.sort((a, b) => {
    const timeA = a.createdAt?.seconds ?? 0;
    const timeB = b.createdAt?.seconds ?? 0;
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
    getRarityConfig(),
  ]);
  if (!docSnap.exists()) return null;
  return withRarityInfo(docSnap.data() as Emotion, config);
}

export async function createEmotion(data: Partial<Emotion>): Promise<void> {
  const docRef = doc(db, 'emotions', String(data.id));
  await setDoc(docRef, { ...data, createdAt: serverTimestamp() });
}

export async function updateEmotion(id: number, data: Partial<Emotion>): Promise<void> {
  const docRef = doc(db, 'emotions', String(id));
  await updateDoc(docRef, data);
}
