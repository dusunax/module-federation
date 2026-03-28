import { create } from 'zustand';
import type { Order } from '@shared/types/api';

export type EmotionIntensity = 1 | 2 | 3 | 4 | 5;

export interface SharedEmotionRecord {
  id: string;
  emotion: string;
  date: string;
  intensity: EmotionIntensity;
  note?: string;
  createdAt: number;
}

export interface WeeklyEmotionPayload {
  version: '1.0.0';
  startDate: string;
  endDate: string;
  records: SharedEmotionRecord[];
}

interface SharedEmotionStoreState {
  records: SharedEmotionRecord[];
  setEmotionRecordsFromOrders: (orders: Order[]) => void;
  clearEmotionRecords: () => void;
  getRecentWeekRecords: (baseDate?: string | Date) => SharedEmotionRecord[];
  getRecentWeekPayload: (baseDate?: string | Date) => WeeklyEmotionPayload;
}

const clampIntensity = (value: number): EmotionIntensity => {
  if (!Number.isFinite(value)) {
    return 3;
  }

  return Math.min(5, Math.max(1, Math.round(value))) as EmotionIntensity;
};

const normalizeEmotionText = (value: string) => value.trim();
const toDateKey = (value: string): string => {
  const normalized = new Date(value);

  if (Number.isNaN(normalized.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return normalized.toISOString().slice(0, 10);
};

const getNow = (): Date => new Date();

const getWeekWindow = (baseDate: string | Date = getNow()) => {
  const end = new Date(baseDate);
  end.setHours(0, 0, 0, 0);
  const day = end.getDay();
  const start = new Date(end);
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);
  const weekEnd = new Date(start);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  end.setTime(weekEnd.getTime());
  return { start: start.getTime(), end: end.getTime() };
};

const getRecordTimestamp = (record: SharedEmotionRecord): number | null => {
  const createdAt = Number(record.createdAt);
  if (Number.isFinite(createdAt)) {
    return createdAt;
  }

  const dateTime = Date.parse(record.date);
  if (Number.isFinite(dateTime)) {
    return dateTime;
  }

  return null;
};

const normalizeTimestampValue = (value: unknown): number => {
  if (!value) {
    return Date.now();
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  if (typeof value === 'object') {
    const record = value as {
      toDate?: () => Date;
      toMillis?: () => number;
      seconds?: number;
    };

    if (typeof record.toMillis === 'function') {
      const ms = record.toMillis();
      if (Number.isFinite(ms)) {
        return ms;
      }
    }

    if (typeof record.toDate === 'function') {
      const date = record.toDate();
      const ms = date.getTime();
      if (Number.isFinite(ms)) {
        return ms;
      }
    }

    if (typeof record.seconds === 'number') {
      return record.seconds * 1000;
    }
  }

  return Date.now();
};

const normalizeDateValue = (value: unknown): string => {
  if (value instanceof Date) {
    return toDateKey(value.toISOString());
  }

  if (typeof value === 'number') {
    return toDateKey(new Date(value).toISOString());
  }

  if (typeof value === 'string') {
    return toDateKey(value);
  }

  if (typeof value === 'object') {
    const candidate = value as {
      toDate?: () => Date;
      toMillis?: () => number;
      seconds?: number;
    };

    if (typeof candidate.toDate === 'function') {
      return normalizeDateValue(candidate.toDate());
    }

    if (typeof candidate.toMillis === 'function') {
      return normalizeDateValue(candidate.toMillis());
    }

    if (typeof candidate.seconds === 'number') {
      return normalizeDateValue(candidate.seconds * 1000);
    }
  }

  return toDateKey(new Date().toISOString());
};

const normalizeOrderTimestampToDate = (value: unknown): string => {
  return normalizeDateValue(value);
};

const buildEmotionName = (item: Order['items'][number]): string => {
  if (!item.product) {
    return 'emotion';
  }

  if (item.product.name?.ko) {
    return item.product.name.ko;
  }

  if (item.product.name?.en) {
    return item.product.name.en;
  }

  return String(item.product.id ?? 'emotion');
};

const toDashboardRecordIntensity = (intensity: 'low' | 'middle' | 'high' | number | string = 3) => {
  if (intensity === 'low') return 2 as const;
  if (intensity === 'middle') return 3 as const;
  if (intensity === 'high') return 4 as const;
  const parsed = clampIntensity(Number(intensity));
  return parsed;
};

export const useSharedEmotionStore = create<SharedEmotionStoreState>((set, get) => ({
  records: [],
  setEmotionRecordsFromOrders: (orders) => {
    const parsed = orders.flatMap((order) => {
      const dateKey = normalizeOrderTimestampToDate(order.orderDate);
      const items = order.items ?? [];

      return items.flatMap((item, index) => {
        const emotionName = normalizeEmotionText(buildEmotionName(item));
        if (!emotionName) {
          return [];
        }

        const baseNote = item.product?.category ?? undefined;
        const addedAt = normalizeOrderTimestampToDate(item.addedAt ?? order.orderDate ?? dateKey);
        const createdAt = normalizeTimestampValue(item.addedAt ?? order.orderDate);
        const count = Number(item.quantity) > 0 ? Math.floor(Number(item.quantity)) : 1;

        const createRecord = (suffix: number): SharedEmotionRecord => ({
          id: `${order.id}-${item.product?.id ?? index}-${addedAt}-${suffix}`,
          emotion: emotionName,
          date: toDateKey(addedAt),
          intensity: toDashboardRecordIntensity(item.product?.intensity),
          note: baseNote,
          createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
        });

        return Array.from({ length: count > 0 ? count : 1 }, (_, suffix) => createRecord(suffix));
      });
    });

    set({ records: parsed });
  },
  clearEmotionRecords: () => {
    set({ records: [] });
  },
  getRecentWeekRecords: (baseDate) => {
    const { start, end } = getWeekWindow(baseDate);
    return get()
      .records.filter((record) => {
        const createdAt = getRecordTimestamp(record);
        if (createdAt === null) {
          return false;
        }

        return createdAt >= start && createdAt <= end;
      })
      .sort((a, b) => (getRecordTimestamp(b) ?? 0) - (getRecordTimestamp(a) ?? 0));
  },
  getRecentWeekPayload: (baseDate) => {
    const recentWeekRecords = get().getRecentWeekRecords(baseDate);
    const dates = recentWeekRecords.map((record) => record.date);
    const startDate = dates[dates.length - 1] ?? new Date().toISOString().slice(0, 10);
    const endDate = dates[0] ?? new Date().toISOString().slice(0, 10);

    return {
      version: '1.0.0',
      startDate,
      endDate,
      records: recentWeekRecords,
    };
  },
}));

export default useSharedEmotionStore;
