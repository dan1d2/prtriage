import { Router } from 'express';
import { createLogger } from '../utils/logger';
import { processWebhookEvent } from './processor';

const logger = createLogger('github-webhook');
const router = Router();

// GitHub App webhook endpoint
router.post('/webhook', async (req, res) => {
  const event = req.headers['x-github-event'] as string;
  const deliveryId = req.headers['x-github-delivery'] as string;
  const signature = req.headers['x-hub-signature-256'] as string;

  logger.info('GitHub webhook received', {
    event,
    deliveryId,
    signature: signature ? 'present' : 'missing',
  });

  // TODO: Validate signature
  // if (!validateSignature(signature, req.body)) {
  //   logger.warn('Invalid signature', { deliveryId });
  //   return res.status(401).send('Invalid signature');
  // }

  try {
    // Process the event asynchronously
    processWebhookEvent(event, req.body).catch((error) => {
      logger.error('Failed to process webhook event', { error, event, deliveryId });
    });

    // Respond immediately to GitHub
    res.status(202).json({ accepted: true, deliveryId });
  } catch (error) {
    logger.error('Error handling webhook', { error, event, deliveryId });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check for GitHub webhook
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'github-webhook',
    timestamp: new Date().toISOString(),
  });
});

export async function initGitHub(): Promise<Router> {
  logger.info('GitHub webhook router initialized');
  return router;
}