const request = require('supertest');
const bcrypt = require('bcryptjs');

jest.mock('../../src/repositories/user.repository', () => ({ findByUsername: jest.fn(), create: jest.fn() }));
const users = require('../../src/repositories/user.repository');
const app = require('../../src/app');

describe('POST /api/auth/register', () => {
  beforeEach(() => jest.resetAllMocks());

  it('creates a user, stores a bcrypt hash (not the plain password) and returns a token', async () => {
    users.findByUsername.mockResolvedValue(null);
    users.create.mockResolvedValue({ id: 7, username: 'rajesh' });

    const res = await request(app).post('/api/auth/register').send({ username: 'rajesh', password: 'secret123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toEqual({ id: 7, username: 'rajesh' });
    const storedHash = users.create.mock.calls[0][1];
    expect(storedHash).not.toBe('secret123');
    expect(await bcrypt.compare('secret123', storedHash)).toBe(true);
  });

  it('rejects a duplicate username with 409', async () => {
    users.findByUsername.mockResolvedValue({ id: 1, username: 'rajesh' });
    const res = await request(app).post('/api/auth/register').send({ username: 'rajesh', password: 'secret123' });
    expect(res.status).toBe(409);
  });

  it('validates input with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ username: 'ab', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.details.length).toBe(2);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(() => jest.resetAllMocks());

  it('returns a token for valid credentials', async () => {
    const hash = await bcrypt.hash('secret123', 4);
    users.findByUsername.mockResolvedValue({ id: 7, username: 'rajesh', password: hash });
    const res = await request(app).post('/api/auth/login').send({ username: 'rajesh', password: 'secret123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
  });

  it('returns 401 for a wrong password', async () => {
    const hash = await bcrypt.hash('secret123', 4);
    users.findByUsername.mockResolvedValue({ id: 7, username: 'rajesh', password: hash });
    const res = await request(app).post('/api/auth/login').send({ username: 'rajesh', password: 'wrong-pass' });
    expect(res.status).toBe(401);
  });

  it('returns 401 for an unknown user with the same message', async () => {
    users.findByUsername.mockResolvedValue(null);
    const res = await request(app).post('/api/auth/login').send({ username: 'ghost', password: 'whatever1' });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid username or password');
  });
});
