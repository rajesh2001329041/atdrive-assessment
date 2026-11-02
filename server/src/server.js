const app = require('./app');
const { port } = require('./config/env');
const { connectMongo } = require('./db/mongo');
const { initMysql } = require('./db/mysql');

async function main() {
  await connectMongo();
  await initMysql();
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
}

main().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
