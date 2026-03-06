import { Pool } from 'pg';
import { createLogger } from '../utils/logger';

const logger = createLogger('database');

let pool: Pool | null = null;

export async function initDatabase() {
  if (pool) {
    return pool;
  }

  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    logger.warn('DATABASE_URL not set, using in-memory mode');
    return null;
  }

  pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  // Test connection
  try {
    const client = await pool.connect();
    logger.info('Database connected successfully');
    
    // Create tables if they don't exist
    await createTables(client);
    
    client.release();
    return pool;
  } catch (error) {
    logger.error('Failed to connect to database', { error });
    throw error;
  }
}

async function createTables(client: any) {
  const queries = [
    // PR Snapshots
    `CREATE TABLE IF NOT EXISTS pr_snapshots (
      id SERIAL PRIMARY KEY,
      pr_id VARCHAR(255) UNIQUE NOT NULL,
      state VARCHAR(50) NOT NULL,
      title TEXT NOT NULL,
      author VARCHAR(255) NOT NULL,
      url TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL,
      last_push_sha VARCHAR(255) NOT NULL,
      last_notified_sha VARCHAR(255),
      checks JSONB,
      reviews JSONB,
      comments JSONB,
      labels JSONB,
      requested_reviewers JSONB,
      assignees JSONB,
      branch_protection JSONB,
      score DECIMAL(5,2) DEFAULT 0,
      created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Slack Users
    `CREATE TABLE IF NOT EXISTS slack_users (
      id SERIAL PRIMARY KEY,
      slack_id VARCHAR(255) UNIQUE NOT NULL,
      github_login VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      name VARCHAR(255),
      created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Notifications
    `CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      pr_id VARCHAR(255) NOT NULL,
      channel VARCHAR(255) NOT NULL,
      user_id VARCHAR(255),
      message TEXT NOT NULL,
      state VARCHAR(50) NOT NULL,
      sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      sha VARCHAR(255) NOT NULL,
      FOREIGN KEY (pr_id) REFERENCES pr_snapshots(pr_id) ON DELETE CASCADE
    )`,
    
    // Snoozes
    `CREATE TABLE IF NOT EXISTS snoozes (
      id SERIAL PRIMARY KEY,
      pr_id VARCHAR(255) NOT NULL,
      user_id VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      reason TEXT,
      created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pr_id) REFERENCES pr_snapshots(pr_id) ON DELETE CASCADE
    )`,
    
    // Digests
    `CREATE TABLE IF NOT EXISTS digests (
      id SERIAL PRIMARY KEY,
      channel VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      pr_count INTEGER NOT NULL
    )`,
    
    // Create indexes
    `CREATE INDEX IF NOT EXISTS idx_pr_snapshots_state ON pr_snapshots(state)`,
    `CREATE INDEX IF NOT EXISTS idx_pr_snapshots_score ON pr_snapshots(score DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_notifications_pr_id ON notifications(pr_id)`,
    `CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_snoozes_expires_at ON snoozes(expires_at)`,
  ];

  for (const query of queries) {
    try {
      await client.query(query);
    } catch (error) {
      logger.error('Failed to execute query', { query, error });
    }
  }
  
  logger.info('Database tables created/verified');
}

export function getPool() {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return pool;
}