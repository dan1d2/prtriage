import 'dotenv/config';
import express from 'express';
import { createLogger } from './utils/logger';
import { initDatabase } from './db/connection';
import { initGitHub } from './github/webhook';
import { initSlack } from './slack/app';
import { healthCheck } from './utils/health';

const app = express();
const logger = createLogger('main');
const PORT = process.env.PORT || 3000;

async function main() {
  logger.info('Starting PR Triage Bot...');

  // Initialize database
  try {
    await initDatabase();
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database', { error });
    process.exit(1);
  }

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', healthCheck);

  // Initialize GitHub webhook handler
  const githubRouter = await initGitHub();
  app.use('/github', githubRouter);

  // Initialize Slack app
  const slackApp = await initSlack();
  
  // Start Slack app (it starts its own server)
  await slackApp.start(Number(PORT) + 1);
  logger.info(`Slack app started on port ${Number(PORT) + 1}`);

  // Start main server
  app.listen(PORT, () => {
    logger.info(`PR Triage Bot listening on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info('Ready to process PRs! 🚀');
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    await slackApp.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully...');
    await slackApp.stop();
    process.exit(0);
  });
}

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise });
});

// Start the application
main().catch((error) => {
  logger.error('Failed to start application', { error });
  process.exit(1);
});