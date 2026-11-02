const weatherService = require('../../../src/services/weather.service');

const ok = (data) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(data) });

describe('weatherService.getWeather', () => {
  const realFetch = global.fetch;
  afterEach(() => { global.fetch = realFetch; });

  it('geocodes the city, then maps the forecast into our shape', async () => {
    global.fetch = jest
      .fn()
      .mockReturnValueOnce(ok({ results: [{ name: 'Hyderabad', country: 'India', latitude: 17.4, longitude: 78.5 }] }))
      .mockReturnValueOnce(ok({ current: { temperature_2m: 31, relative_humidity_2m: 50, wind_speed_10m: 8, weather_code: 61, time: 't' } }));

    const result = await weatherService.getWeather('Hyderabad');

    expect(global.fetch.mock.calls[1][0]).toContain('latitude=17.4&longitude=78.5');
    expect(result).toMatchObject({ city: 'Hyderabad', temperatureC: 31, condition: 'Light rain' });
  });

  it('falls back to "Unknown" for unmapped weather codes', async () => {
    global.fetch = jest
      .fn()
      .mockReturnValueOnce(ok({ results: [{ name: 'X', country: 'Y', latitude: 1, longitude: 2 }] }))
      .mockReturnValueOnce(ok({ current: { temperature_2m: 1, relative_humidity_2m: 1, wind_speed_10m: 1, weather_code: 1234, time: 't' } }));
    expect((await weatherService.getWeather('X')).condition).toBe('Unknown');
  });

  it('throws 404 when the city is unknown', async () => {
    global.fetch = jest.fn().mockReturnValueOnce(ok({}));
    await expect(weatherService.getWeather('Nowhereville')).rejects.toMatchObject({ status: 404 });
  });

  it('maps network failures and upstream errors to 502', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('down'));
    await expect(weatherService.getWeather('X')).rejects.toMatchObject({ status: 502 });
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) });
    await expect(weatherService.getWeather('X')).rejects.toMatchObject({ status: 502 });
  });

  it('throws 502 when the forecast payload is malformed', async () => {
    global.fetch = jest
      .fn()
      .mockReturnValueOnce(ok({ results: [{ name: 'X', country: 'Y', latitude: 1, longitude: 2 }] }))
      .mockReturnValueOnce(ok({}));
    await expect(weatherService.getWeather('X')).rejects.toMatchObject({ status: 502 });
  });
});
