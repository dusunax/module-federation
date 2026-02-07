import { RequestHandler, http, HttpResponse } from 'msw';

export const handlers: RequestHandler[] = [
  // Mock Open-Meteo weather API
  http.get('https://api.open-meteo.com/v1/forecast', () => {
    return HttpResponse.json({
      current_weather: {
        weathercode: 0, // Clear sky
        temperature: 15,
      },
    });
  }),
];
