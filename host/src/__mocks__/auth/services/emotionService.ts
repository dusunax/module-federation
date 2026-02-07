import { vi } from 'vitest';
import type { Emotion } from 'auth/services/emotionService';

export const getAllEmotions = vi.fn(async (): Promise<Emotion[]> => []);
export const getEmotionById = vi.fn(async (): Promise<Emotion | null> => null);
export const createEmotion = vi.fn(async (): Promise<void> => {});
export const updateEmotion = vi.fn(async (): Promise<void> => {});
