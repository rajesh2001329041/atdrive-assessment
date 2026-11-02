const { getPool } = require('../db/mysql');

async function findByUsername(username) {
  const [rows] = await getPool().execute(
    'SELECT id, username, password FROM users WHERE username = ?',
    [username]
  );
  return rows[0] || null;
}

async function create(username, passwordHash) {
  const [result] = await getPool().execute(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, passwordHash]
  );
  return { id: result.insertId, username };
}

module.exports = { findByUsername, create };
