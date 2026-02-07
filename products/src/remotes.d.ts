declare module 'auth/services/emotionService' {
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
    emoji?: string;
    description?: string;
    category?: string;
    energyCost: number;
    status?: string;
    story?: string;
    createdAt?: { seconds?: number };
    visibility?: VisibilityCondition;
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
