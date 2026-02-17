import { useState, useEffect, useCallback, useMemo } from 'react';
import { useWeather } from './useWeather';
import {
  CurrentConditions,
  getCurrentTimeOfDay,
  getCurrentDayInfo,
  getCurrentSeason,
  getActiveEvents,
  getConditionLabel,
} from '../utils/conditions';

export interface ConditionViewModel {
  timeHours: string;
  timeMinutes: string;
  timeLabel: string;
  isNight: boolean;
  seasonKey: 'spring' | 'summer' | 'autumn' | 'winter';
  dayText: string;
  weatherLabel?: string;
  seasonLabel?: string;
  eventLabels: string[];
  temperatureText?: string;
}

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
  const dayLabels = [conditions.day, ...conditions.dayExtras]
    .map((key) => getConditionLabel(key, true))
    .filter(Boolean);
  const isNight = conditions.time === 'night';
  const dayText = dayLabels.join('·');
  const timeLabel = getConditionLabel(conditions.time);
  const weatherLabel = getConditionLabel(conditions.weather);
  const seasonLabel = getConditionLabel(conditions.season);
  const eventLabels = conditions.events
    .map((event) => getConditionLabel(event))
    .filter(Boolean);
  const temperatureText =
    typeof conditions.temperature === 'number'
      ? `${Math.round(conditions.temperature)}°C`
      : undefined;

  return {
    timeHours: hours,
    timeMinutes: minutes,
    timeLabel,
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
