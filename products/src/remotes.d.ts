declare module 'auth/services/emotionService' {
  export interface Emotion {
    id: number;
    name: string;
    emoji?: string;
    description?: string;
    category?: string;
    energyCost: number;
    status?: string;
    story?: string;
    effects?: string[];
    createdAt?: { seconds?: number };
  }

  export const __setMockEmotions: (next: Emotion[]) => void;
  export const __setMockEmotionById: (next: Emotion | null) => void;
  export function getAllEmotions(search?: string): Promise<Emotion[]>;
  export function getEmotionById(id: number): Promise<Emotion>;
}

declare module 'auth/rememberingStore' {
  export const __setMockRememberingState: (next: { rememberingItems?: Record<number, { id: number }> }) => void;
  export const useRememberingStore: ((selector?: (state: { rememberingItems: Record<number, { id: number }> }) => unknown) => unknown) & {
    getState: () => { rememberingItems: Record<number, { id: number }> };
  };
}
