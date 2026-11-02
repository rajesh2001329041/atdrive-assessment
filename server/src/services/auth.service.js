const bcrypt = require('bcryptjs');
const users = require('../repositories/user.repository');
const { signToken } = require('../utils/jwt');
const { HttpError } = require('../utils/httpError');

const toAuthResult = (user) => ({ user: { id: user.id, username: user.username }, token: signToken(user) });

async function register({ username, password }) {
  if (await users.findByUsername(username)) {
    throw new HttpError(409, 'Username already taken');
  }
  const hash = await bcrypt.hash(password, 10);
  return toAuthResult(await users.create(username, hash));
}

async function login({ username, password }) {
  const user = await users.findByUsername(username);
  const ok = user && (await bcrypt.compare(password, user.password));
  if (!ok) throw new HttpError(401, 'Invalid username or password');
  return toAuthResult(user);
}

module.exports = { register, login };
