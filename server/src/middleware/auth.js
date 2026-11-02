const { verifyToken } = require('../utils/jwt');
const { HttpError } = require('../utils/httpError');

function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new HttpError(401, 'Authentication required'));
  }
  try {
    const payload = verifyToken(token);
    req.user = { id: Number(payload.sub), username: payload.username };
    next();
  } catch {
    next(new HttpError(401, 'Invalid or expired token'));
  }
}

module.exports = { requireAuth };
