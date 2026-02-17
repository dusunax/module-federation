export type TimeOfDay = 'day' | 'night';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'
  | 'weekday'
  | 'weekend';

export type WeatherType = 'clear' | 'cloudy' | 'rain' | 'snow' | 'storm';

export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';

export type EventType = string;

export type VisibilityCondition = import('@shared/types/api').VisibilityCondition;

export interface CurrentConditions {
  time: TimeOfDay;
  day: DayOfWeek;
  dayExtras: DayOfWeek[];
  weather: WeatherType;
  temperature?: number;
  season: SeasonType;
  events: EventType[];
}

export type ConditionType = 'time' | 'weather' | 'season' | 'day' | 'event';

interface ConditionMeta {
  label: string;
  shortLabel?: string;
  type: ConditionType;
  emoji?: string;
}

export const CONDITION_TYPE_LABEL: Record<ConditionType, string> = {
  time: '시간',
  weather: '날씨',
  season: '계절',
  day: '요일',
  event: '이벤트',
};

export const CONDITION_META: Record<string, ConditionMeta> = {
  day: { label: '낮', type: 'time' },
  night: { label: '밤', type: 'time', emoji: '🌃🌙' },
  monday: { label: '월요일', shortLabel: '월', type: 'day' },
  tuesday: { label: '화요일', shortLabel: '화', type: 'day' },
  wednesday: { label: '수요일', shortLabel: '수', type: 'day' },
  thursday: { label: '목요일', shortLabel: '목', type: 'day' },
  friday: { label: '금요일', shortLabel: '금', type: 'day' },
  saturday: { label: '토요일', shortLabel: '토', type: 'day' },
  sunday: { label: '일요일', shortLabel: '일', type: 'day' },
  weekday: { label: '평일', type: 'day' },
  weekend: { label: '주말', type: 'day' },
  clear: { label: '맑음', type: 'weather' },
  cloudy: { label: '흐림', type: 'weather' },
  rain: { label: '비', type: 'weather' },
  snow: { label: '눈', type: 'weather' },
  storm: { label: '폭풍', type: 'weather' },
  spring: { label: '봄', type: 'season' },
  summer: { label: '여름', type: 'season' },
  autumn: { label: '가을', type: 'season' },
  winter: { label: '겨울', type: 'season' },
  newyear: { label: '새해', type: 'event' },
  valentines: { label: '발렌타인', type: 'event' },
  whiteday: { label: '화이트데이', type: 'event' },
  halloween: { label: '할로윈', type: 'event' },
  christmas: { label: '크리스마스', type: 'event' },
  chuseok: { label: '추석', type: 'event' },
  seollal: { label: '설날', type: 'event' },
};

export function getConditionLabel(key: string, short = false): string {
  const meta = CONDITION_META[key];
  if (!meta) return key;
  return (short && meta.shortLabel) ? meta.shortLabel : meta.label;
}

interface EventDateRange {
  ranges: Array<{ startMonth: number; startDay: number; endMonth: number; endDay: number }>;
  yearlyDates?: Record<number, Array<{ startMonth: number; startDay: number; endMonth: number; endDay: number }>>;
}

const SEOLLAL_DATES: Record<number, { month: number; day: number }> = {
  2026: { month: 2, day: 17 },
  2027: { month: 2, day: 6 },
  2028: { month: 1, day: 26 },
  2029: { month: 2, day: 13 },
  2030: { month: 2, day: 3 },
  2031: { month: 1, day: 23 },
  2032: { month: 2, day: 11 },
  2033: { month: 1, day: 31 },
  2034: { month: 2, day: 19 },
  2035: { month: 2, day: 8 },
  2036: { month: 1, day: 28 },
  2037: { month: 2, day: 15 },
  2038: { month: 2, day: 4 },
  2039: { month: 1, day: 24 },
  2040: { month: 2, day: 12 },
  2041: { month: 2, day: 1 },
  2042: { month: 1, day: 22 },
  2043: { month: 2, day: 10 },
  2044: { month: 1, day: 30 },
  2045: { month: 2, day: 17 },
  2046: { month: 2, day: 6 },
  2047: { month: 1, day: 26 },
  2048: { month: 2, day: 14 },
  2049: { month: 2, day: 2 },
  2050: { month: 1, day: 23 },
};

function buildHolidayWindow(
  year: number,
  month: number,
  day: number
): { startMonth: number; startDay: number; endMonth: number; endDay: number } {
  const base = new Date(Date.UTC(year, month - 1, day));
  const start = new Date(base);
  start.setUTCDate(start.getUTCDate() - 1);
  const end = new Date(base);
  end.setUTCDate(end.getUTCDate() + 1);
  return {
    startMonth: start.getUTCMonth() + 1,
    startDay: start.getUTCDate(),
    endMonth: end.getUTCMonth() + 1,
    endDay: end.getUTCDate(),
  };
}

const SEOLLAL_YEARLY_DATES: Record<
  number,
  Array<{ startMonth: number; startDay: number; endMonth: number; endDay: number }>
> = Object.fromEntries(
  Object.entries(SEOLLAL_DATES).map(([year, { month, day }]) => [
    Number(year),
    [buildHolidayWindow(Number(year), month, day)],
  ])
);

export const EVENT_DATES: Record<string, EventDateRange> = {
  newyear: {
    ranges: [
      { startMonth: 12, startDay: 31, endMonth: 12, endDay: 31 },
      { startMonth: 1, startDay: 1, endMonth: 1, endDay: 2 },
    ],
  },
  valentines: {
    ranges: [{ startMonth: 2, startDay: 13, endMonth: 2, endDay: 15 }],
  },
  whiteday: {
    ranges: [{ startMonth: 3, startDay: 13, endMonth: 3, endDay: 15 }],
  },
  halloween: {
    ranges: [{ startMonth: 10, startDay: 30, endMonth: 11, endDay: 1 }],
  },
  christmas: {
    ranges: [{ startMonth: 12, startDay: 24, endMonth: 12, endDay: 26 }],
  },
  seollal: {
    yearlyDates: SEOLLAL_YEARLY_DATES,
    ranges: [],
  },
  chuseok: {
    yearlyDates: {
      2024: [{ startMonth: 9, startDay: 16, endMonth: 9, endDay: 18 }],
      2025: [{ startMonth: 10, startDay: 5, endMonth: 10, endDay: 7 }],
      2026: [{ startMonth: 9, startDay: 24, endMonth: 9, endDay: 26 }],
      2027: [{ startMonth: 9, startDay: 14, endMonth: 9, endDay: 16 }],
    },
    ranges: [],
  },
};
