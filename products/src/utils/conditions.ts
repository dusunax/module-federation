export type {
  TimeOfDay,
  DayOfWeek,
  WeatherType,
  SeasonType,
  EventType,
  VisibilityCondition,
  CurrentConditions,
  ConditionType,
} from './conditionConstants';

export {
  CONDITION_META,
  CONDITION_TYPE_LABEL,
  EVENT_DATES,
  getConditionLabel,
} from './conditionConstants';

import type {
  TimeOfDay,
  DayOfWeek,
  WeatherType,
  SeasonType,
  EventType,
  CurrentConditions,
  VisibilityCondition,
} from './conditionConstants';
import { EVENT_DATES } from './conditionConstants';

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
