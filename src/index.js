import { createConnection } from './connection.js';

process.on('uncaughtException', error => {
  console.error('Unexpected error:', error.message);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled rejection:', error?.message || error);
});

try {
  await createConnection();
} catch (error) {
  console.error('❌ Unable to start bot:', error.message);
  process.exitCode = 1;
}
