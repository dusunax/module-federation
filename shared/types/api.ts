export type FirestoreTimestamp = {
  toDate: () => Date;
  toMillis?: () => number;
  seconds?: number;
  nanoseconds?: number;
};

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
  intensity: 'high' | 'middle' | 'low';
  category: string;
  description: string;
  story: string;
  published: boolean;
  image: string | null;
  energyCost: number;
  intensityOrder: number;
  createdAt: FirestoreTimestamp;
  visibility: VisibilityCondition;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  plan: string;
  role?: string;
}

export interface OrderItem {
  product: Emotion;
  quantity: number;
  eventCount: { combine: number };
  addedAt: FirestoreTimestamp;
}

export interface Order {
  id: string;
  orderDate: FirestoreTimestamp;
  items: OrderItem[];
  totalEnergy: number;
  totalItems: number;
  status: string;
}

export interface DailyUsage {
  date: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  used: number;
  count: number;
}
