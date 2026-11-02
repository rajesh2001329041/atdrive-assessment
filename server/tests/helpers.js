const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../src/config/env');

const tokenFor = (id = 1, username = 'rajesh') => jwt.sign({ username }, jwtSecret, { subject: String(id) });
const authHeader = (id, username) => ({ Authorization: `Bearer ${tokenFor(id, username)}` });

module.exports = { tokenFor, authHeader };
