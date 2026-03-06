import express from 'express';
import { createLogger } from './utils/logger';
import { healthRouter } from './utils/health';
import { webhookRouter } from './github/webhook';
import { initSlack } from './slack/app';

const logger = createLogger('server');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/health', healthRouter);
app.use('/github/webhook', webhookRouter);

// Root route for verification
app.get('/', (req, res) => {
  res.json({
    name: 'PR Triage Bot',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      githubWebhook: '/github/webhook',
      slackEvents: '/slack/events'
    },
    documentation: 'https://github.com/dan1d2/prtriage'
  });
});

// Slack events endpoint
app.post('/slack/events', async (req, res) => {
  try {
    // For now, just acknowledge the request
    // Slack Bolt will handle this when initialized
    if (req.body.type === 'url_verification') {
      res.json({ challenge: req.body.challenge });
      return;
    }
    
    res.status(200).send();
  } catch (error) {
    logger.error('Error handling Slack events', { error });
    res.status(500).send();
  }
});

// Start server
async function startServer() {
  try {
    // Initialize Slack app if tokens are configured
    if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_SIGNING_SECRET) {
      const slackApp = await initSlack();
      await slackApp.start();
      logger.info('Slack app started');
    } else {
      logger.warn('Slack tokens not configured, Slack app will not start');
    }

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`GitHub webhook: http://localhost:${PORT}/github/webhook`);
      logger.info(`Slack events: http://localhost:${PORT}/slack/events`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();