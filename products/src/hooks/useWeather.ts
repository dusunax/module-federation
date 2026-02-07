import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mapWeatherCode, WeatherType } from '../utils/conditions';

const SEOUL_LAT = 37.57;
const SEOUL_LNG = 126.98;

interface WeatherResponse {
  current_weather: {
    weathercode: number;
    temperature: number;
  };
}

function fetchWeather(lat: number, lng: number): Promise<{ weather: WeatherType; temperature: number | null }> {
  return fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`,
  )
    .then((res) => {
      if (!res.ok) throw new Error('Weather fetch failed');
      return res.json() as Promise<WeatherResponse>;
    })
    .then((data) => ({
      weather: mapWeatherCode(data.current_weather.weathercode),
      temperature: typeof data.current_weather.temperature === 'number' ? data.current_weather.temperature : null,
    }));
}

function getPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: SEOUL_LAT, lng: SEOUL_LNG });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve({ lat: SEOUL_LAT, lng: SEOUL_LNG }),
      { timeout: 5000 },
    );
  });
}

export function useWeather(): { weather: WeatherType; temperature: number | null; loading: boolean } {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    getPosition().then(setCoords);
  }, []);

  const { data, isLoading } = useQuery<{ weather: WeatherType; temperature: number | null }>({
    queryKey: ['weather', coords?.lat, coords?.lng],
    queryFn: () => fetchWeather(coords!.lat, coords!.lng),
    enabled: coords !== null,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });

  return {
    weather: data?.weather ?? 'clear',
    temperature: data?.temperature ?? null,
    loading: isLoading || coords === null,
  };
}
