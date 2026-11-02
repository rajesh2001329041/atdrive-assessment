const { HttpError } = require('../utils/httpError');

// Third-party API: Open-Meteo (free, no API key). Called server-side so the browser never
// talks to it directly, and so failures/timeouts are normalised into clean API errors.
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const TIMEOUT_MS = 5000;

const WEATHER_CODES = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Rime fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Dense drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
  80: 'Rain showers', 81: 'Heavy rain showers', 82: 'Violent rain showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Severe thunderstorm with hail',
};

async function fetchJson(url) {
  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch {
    throw new HttpError(502, 'Weather service is unreachable, please try again later');
  }
  if (!response.ok) throw new HttpError(502, `Weather service responded with ${response.status}`);
  return response.json();
}

async function getWeather(city) {
  const geo = await fetchJson(`${GEO_URL}?name=${encodeURIComponent(city)}&count=1`);
  const place = geo.results && geo.results[0];
  if (!place) throw new HttpError(404, `City "${city}" not found`);

  const forecast = await fetchJson(
    `${FORECAST_URL}?latitude=${place.latitude}&longitude=${place.longitude}` +
      '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code'
  );
  const c = forecast.current;
  if (!c) throw new HttpError(502, 'Unexpected response from weather service');

  return {
    city: place.name,
    country: place.country,
    temperatureC: c.temperature_2m,
    humidityPercent: c.relative_humidity_2m,
    windSpeedKmh: c.wind_speed_10m,
    condition: WEATHER_CODES[c.weather_code] || 'Unknown',
    observedAt: c.time,
  };
}

module.exports = { getWeather };
