const request = require('supertest');
const { authHeader } = require('../helpers');
const app = require('../../src/app');

const ok = (data) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(data) });

describe('GET /api/weather', () => {
  const realFetch = global.fetch;
  afterEach(() => { global.fetch = realFetch; });

  it('requires authentication', async () => {
    expect((await request(app).get('/api/weather')).status).toBe(401);
  });

  it('returns a normalised weather payload', async () => {
    global.fetch = jest
      .fn()
      .mockReturnValueOnce(ok({ results: [{ name: 'Hyderabad', country: 'India', latitude: 17.4, longitude: 78.5 }] }))
      .mockReturnValueOnce(
        ok({ current: { temperature_2m: 31.2, relative_humidity_2m: 55, wind_speed_10m: 9.4, weather_code: 2, time: '2026-10-30T10:00' } })
      );
    const res = await request(app).get('/api/weather?city=Hyderabad').set(authHeader());
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ city: 'Hyderabad', temperatureC: 31.2, condition: 'Partly cloudy' });
  });

  it('returns 404 for an unknown city', async () => {
    global.fetch = jest.fn().mockReturnValueOnce(ok({}));
    const res = await request(app).get('/api/weather?city=Nowhereville').set(authHeader());
    expect(res.status).toBe(404);
  });

  it('returns 502 when the third-party API is down', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network down'));
    const res = await request(app).get('/api/weather').set(authHeader());
    expect(res.status).toBe(502);
  });

  it('returns 502 when the third-party API responds with an error status', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) });
    const res = await request(app).get('/api/weather').set(authHeader());
    expect(res.status).toBe(502);
  });
});
