const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

const signToken = (user) =>
  jwt.sign({ username: user.username }, jwtSecret, { subject: String(user.id), expiresIn: jwtExpiresIn });

const verifyToken = (token) => jwt.verify(token, jwtSecret);

module.exports = { signToken, verifyToken };
