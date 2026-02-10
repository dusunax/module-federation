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

interface ConditionMeta {
  label: string;
  emoji?: string;
}

export const CONDITION_META: Record<string, ConditionMeta> = {
  day: { label: '낮' },
  night: { label: '밤', emoji: '🌃🌙' },
  monday: { label: '월요일' },
  tuesday: { label: '화요일' },
  wednesday: { label: '수요일' },
  thursday: { label: '목요일' },
  friday: { label: '금요일' },
  saturday: { label: '토요일' },
  sunday: { label: '일요일' },
  weekday: { label: '평일' },
  weekend: { label: '주말' },
  clear: { label: '맑음' },
  cloudy: { label: '흐림' },
  rain: { label: '비' },
  snow: { label: '눈' },
  storm: { label: '폭풍' },
  spring: { label: '봄' },
  summer: { label: '여름' },
  autumn: { label: '가을' },
  winter: { label: '겨울' },
  newyear: { label: '새해' },
  valentines: { label: '발렌타인' },
  whiteday: { label: '화이트데이' },
  halloween: { label: '할로윈' },
  christmas: { label: '크리스마스' },
  chuseok: { label: '추석' },
};

interface EventDateRange {
  ranges: Array<{ startMonth: number; startDay: number; endMonth: number; endDay: number }>;
  yearlyDates?: Record<number, Array<{ startMonth: number; startDay: number; endMonth: number; endDay: number }>>;
}

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

interface EmotionLike {
  visibility?: VisibilityCondition;
}

export function isEmotionVisible(emotion: EmotionLike, conditions: CurrentConditions): boolean {
  const v = emotion.visibility;
  if (!v) return true;

  const allDays = [conditions.day, ...conditions.dayExtras];

  if (v.time.length > 0 && !v.time.includes(conditions.time)) return false;
  if (v.day.length > 0 && !v.day.some((d) => allDays.includes(d))) return false;
  if (v.weather.length > 0 && !v.weather.includes(conditions.weather)) return false;
  if (v.season.length > 0 && !v.season.includes(conditions.season)) return false;
  if (v.event.length > 0 && !v.event.some((e) => conditions.events.includes(e))) return false;

  return true;
}

export function getCurrentTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? 'day' : 'night';
}

const DAY_MAP: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export function getCurrentDayInfo(): { day: DayOfWeek; extras: DayOfWeek[] } {
  const jsDay = new Date().getDay();
  const day = DAY_MAP[jsDay];
  const extras: DayOfWeek[] = jsDay === 0 || jsDay === 6 ? ['weekend'] : ['weekday'];
  return { day, extras };
}

export function getCurrentSeason(): SeasonType {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

function isDateInRange(
  month: number,
  dayOfMonth: number,
  startMonth: number,
  startDay: number,
  endMonth: number,
  endDay: number,
): boolean {
  const toNum = (m: number, d: number) => m * 100 + d;
  const current = toNum(month, dayOfMonth);
  const start = toNum(startMonth, startDay);
  const end = toNum(endMonth, endDay);

  if (start <= end) {
    return current >= start && current <= end;
  }
  return current >= start || current <= end;
}

export function getActiveEvents(now?: Date): EventType[] {
  const date = now ?? new Date();
  const month = date.getMonth() + 1;
  const dayOfMonth = date.getDate();
  const year = date.getFullYear();
  const active: EventType[] = [];

  for (const [event, config] of Object.entries(EVENT_DATES)) {
    let matched = false;

    for (const range of config.ranges) {
      if (isDateInRange(month, dayOfMonth, range.startMonth, range.startDay, range.endMonth, range.endDay)) {
        matched = true;
        break;
      }
    }

    if (!matched && config.yearlyDates) {
      const yearRanges = config.yearlyDates[year];
      if (yearRanges) {
        for (const range of yearRanges) {
          if (isDateInRange(month, dayOfMonth, range.startMonth, range.startDay, range.endMonth, range.endDay)) {
            matched = true;
            break;
          }
        }
      }
    }

    if (matched) active.push(event);
  }

  return active;
}

export function mapWeatherCode(wmoCode: number): WeatherType {
  if (wmoCode === 0) return 'clear';
  if ([1, 2, 3, 45, 48].includes(wmoCode)) return 'cloudy';
  if ((wmoCode >= 51 && wmoCode <= 67) || (wmoCode >= 80 && wmoCode <= 82)) return 'rain';
  if ((wmoCode >= 71 && wmoCode <= 77) || (wmoCode >= 85 && wmoCode <= 86)) return 'snow';
  if (wmoCode >= 95 && wmoCode <= 99) return 'storm';
  return 'clear';
}
