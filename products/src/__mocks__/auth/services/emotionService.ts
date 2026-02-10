import type { Emotion } from '@shared/types/api';

let emotions: Emotion[] = [];
let emotionById: Emotion | null = null;

export const __setMockEmotions = (next: Emotion[]) => {
  emotions = next;
};

export const __setMockEmotionById = (next: Emotion | null) => {
  emotionById = next;
};

export async function getAllEmotions(_search?: string): Promise<Emotion[]> {
  return emotions;
}

export async function getEmotionById(id: number): Promise<Emotion> {
  if (emotionById && emotionById.id === id) return emotionById;
  const found = emotions.find((emotion) => emotion.id === id);
  if (found) return found;
  throw new Error('Emotion not found');
}
