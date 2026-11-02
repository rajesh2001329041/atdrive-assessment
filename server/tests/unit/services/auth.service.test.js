const bcrypt = require('bcryptjs');

jest.mock('../../../src/repositories/user.repository', () => ({ findByUsername: jest.fn(), create: jest.fn() }));
const users = require('../../../src/repositories/user.repository');
const authService = require('../../../src/services/auth.service');
const { verifyToken } = require('../../../src/utils/jwt');

beforeEach(() => jest.resetAllMocks());

describe('authService.register', () => {
  it('hashes the password and returns a verifiable token', async () => {
    users.findByUsername.mockResolvedValue(null);
    users.create.mockResolvedValue({ id: 7, username: 'rajesh' });

    const result = await authService.register({ username: 'rajesh', password: 'secret123' });

    expect(result.user).toEqual({ id: 7, username: 'rajesh' });
    expect(verifyToken(result.token).sub).toBe('7');
    expect(await bcrypt.compare('secret123', users.create.mock.calls[0][1])).toBe(true);
  });

  it('rejects a taken username with 409', async () => {
    users.findByUsername.mockResolvedValue({ id: 1 });
    await expect(authService.register({ username: 'rajesh', password: 'secret123' })).rejects.toMatchObject({ status: 409 });
    expect(users.create).not.toHaveBeenCalled();
  });
});

describe('authService.login', () => {
  it('accepts the right password', async () => {
    users.findByUsername.mockResolvedValue({ id: 7, username: 'rajesh', password: await bcrypt.hash('secret123', 4) });
    const result = await authService.login({ username: 'rajesh', password: 'secret123' });
    expect(result.token).toEqual(expect.any(String));
  });

  it('uses one generic 401 for a wrong password and an unknown user', async () => {
    users.findByUsername.mockResolvedValueOnce({ id: 7, username: 'rajesh', password: await bcrypt.hash('secret123', 4) });
    const wrongPassword = await authService.login({ username: 'rajesh', password: 'nope-nope' }).catch((e) => e);
    users.findByUsername.mockResolvedValueOnce(null);
    const unknownUser = await authService.login({ username: 'ghost', password: 'whatever' }).catch((e) => e);

    expect(wrongPassword.status).toBe(401);
    expect(unknownUser.status).toBe(401);
    expect(wrongPassword.message).toBe(unknownUser.message);
  });
});
