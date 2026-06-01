import app from './app.js';
import { validateEnv } from './config/env.js';
import env from './config/env.js';
import pool from './config/database.js';

validateEnv();

const server = app.listen(env.port, () => {
  console.log(`Server running on port ${env.port} (${env.nodeEnv})`);
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
