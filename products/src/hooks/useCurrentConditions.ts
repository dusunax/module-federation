import { useState, useEffect, useCallback, useMemo } from 'react';
import { useWeather } from './useWeather';
import {
  CurrentConditions,
  getCurrentTimeOfDay,
  getCurrentDayInfo,
  getCurrentSeason,
  getActiveEvents,
} from '../utils/conditions';

export interface ConditionViewModel {
  timeHours: string;
  timeMinutes: string;
  isNight: boolean;
  seasonKey: 'spring' | 'summer' | 'autumn' | 'winter';
  dayText: string;
  weatherLabel?: string;
  seasonLabel?: string;
  eventLabels: string[];
  temperatureText?: string;
}

const DAY_LABELS: Record<string, string> = {
  monday: '월',
  tuesday: '화',
  wednesday: '수',
  thursday: '목',
  friday: '금',
  saturday: '토',
  sunday: '일',
};

const WEATHER_LABELS: Record<string, string> = {
  clear: '맑음',
  cloudy: '흐림',
  rain: '비',
  snow: '눈',
  storm: '폭풍',
};

const SEASON_LABELS: Record<string, string> = {
  spring: '봄',
  summer: '여름',
  autumn: '가을',
  winter: '겨울',
};

const EVENT_LABELS: Record<string, string> = {
  newyear: '새해',
  valentines: '발렌타인',
  whiteday: '화이트데이',
  halloween: '할로윈',
  christmas: '크리스마스',
  chuseok: '추석',
};

function buildConditions(
  weather: ReturnType<typeof useWeather>['weather'],
  temperature: number | null
): CurrentConditions {
  const { day, extras } = getCurrentDayInfo();
  return {
    time: getCurrentTimeOfDay(),
    day,
    dayExtras: extras,
    weather,
    temperature: temperature ?? undefined,
    season: getCurrentSeason(),
    events: getActiveEvents(),
  };
}

function buildViewModel(conditions: CurrentConditions, now: Date): ConditionViewModel {
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const isWeekend = conditions.dayExtras.includes('weekend');
  const dayLabel = DAY_LABELS[conditions.day] ?? conditions.day;
  const isNight = conditions.time === 'night';
  const dayText = `${dayLabel} (${isWeekend ? '주말' : '평일'})`;
  const weatherLabel = WEATHER_LABELS[conditions.weather];
  const seasonLabel = SEASON_LABELS[conditions.season];
  const eventLabels = conditions.events
    .map((event) => EVENT_LABELS[event])
    .filter((label): label is string => Boolean(label));
  const temperatureText =
    typeof conditions.temperature === 'number'
      ? `${Math.round(conditions.temperature)}°C`
      : undefined;

  return {
    timeHours: hours,
    timeMinutes: minutes,
    isNight,
    seasonKey: conditions.season,
    dayText,  
    weatherLabel,
    seasonLabel,
    eventLabels,
    temperatureText,
  };
}

export function useCurrentConditions(): {
  conditions: CurrentConditions;
  loading: boolean;
  view: ConditionViewModel;
} {
  const { weather, temperature, loading: weatherLoading } = useWeather();
  const [conditions, setConditions] = useState<CurrentConditions>(() =>
    buildConditions(weather, temperature ?? null)
  );
  const [now, setNow] = useState(() => new Date());

  const refresh = useCallback(() => {
    setConditions(buildConditions(weather, temperature ?? null));
  }, [weather, temperature]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const view = useMemo(() => buildViewModel(conditions, now), [conditions, now]);

  return { conditions, loading: weatherLoading, view };
}
