import { App, LogLevel } from '@slack/bolt';
import { createLogger } from '../utils/logger';

const logger = createLogger('slack-app');

let slackApp: App | null = null;

export async function initSlack(): Promise<App> {
  if (slackApp) {
    return slackApp;
  }

  const botToken = process.env.SLACK_BOT_TOKEN;
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  const appToken = process.env.SLACK_APP_TOKEN;

  if (!botToken || !signingSecret) {
    logger.warn('Slack tokens not configured, Slack app will not start');
    throw new Error('Slack tokens not configured');
  }

  slackApp = new App({
    token: botToken,
    signingSecret: signingSecret,
    socketMode: !!appToken,
    appToken: appToken,
    logLevel: LogLevel.INFO,
    port: Number(process.env.PORT || 3000) + 1,
  });

  // Register commands
  registerCommands(slackApp);

  logger.info('Slack app initialized');
  return slackApp;
}

function registerCommands(app: App) {
  // /prs command - List PRs by priority
  app.command('/prs', async ({ command, ack, say }) => {
    await ack();
    
    try {
      const prs = await getPrioritizedPRs();
      
      if (prs.length === 0) {
        await say('🎉 No PRs need review right now! Everything is caught up.');
        return;
      }
      
      const blocks = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📋 PRs Ready for Review',
            emoji: true,
          },
        },
        {
          type: 'divider',
        },
      ];
      
      prs.slice(0, 5).forEach((pr: any, index: number) => {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${index + 1}. ${pr.title}*\n👤 ${pr.author} | ⭐ Score: ${pr.score}/100\n🔗 <${pr.url}|View on GitHub>`,
          },
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Take',
              emoji: true,
            },
            value: pr.prId,
            action_id: `take_pr_${pr.prId}`,
          },
        });
        
        if (index < prs.length - 1 && index < 4) {
          blocks.push({ type: 'divider' });
        }
      });
      
      if (prs.length > 5) {
        blocks.push({
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `...and ${prs.length - 5} more PRs. Use \`/prs all\` to see everything.`,
            },
          ],
        });
      }
      
      await say({ blocks });
    } catch (error) {
      logger.error('Error handling /prs command', { error });
      await say('❌ Error fetching PRs. Please try again later.');
    }
  });

  // /prs mine command - List user's PRs
  app.command('/prs_mine', async ({ command, ack, say }) => {
    await ack();
    
    try {
      const githubLogin = await getGitHubLogin(command.user_id);
      const userPRs = await getUserPRs(githubLogin);
      
      if (userPRs.length === 0) {
        await say(`You don't have any PRs waiting for review. Great work! 🎉`);
        return;
      }
      
      const blocks = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📋 Your PRs',
            emoji: true,
          },
        },
        {
          type: 'divider',
        },
      ];
      
      userPRs.forEach((pr: any) => {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${pr.title}*\n📊 State: ${pr.state} | ⭐ Score: ${pr.score}/100\n🔗 <${pr.url}|View on GitHub>`,
          },
        });
        
        blocks.push({ type: 'divider' });
      });
      
      await say({ blocks });
    } catch (error) {
      logger.error('Error handling /prs_mine command', { error });
      await say('❌ Error fetching your PRs. Please try again later.');
    }
  });

  // /prs take command - Take a PR for review
  app.command('/prs_take', async ({ command, ack, say }) => {
    await ack();
    
    try {
      const prId = command.text.trim();
      
      if (!prId) {
        await say('Please specify a PR to take. Example: `/prs take owner/repo#123`');
        return;
      }
      
      const success = await takePR(prId, command.user_id);
      
      if (success) {
        await say(`✅ You've taken PR ${prId} for review!`);
      } else {
        await say(`❌ Could not take PR ${prId}. It may already be taken or not exist.`);
      }
    } catch (error) {
      logger.error('Error handling /prs_take command', { error });
      await say('❌ Error taking PR. Please try again later.');
    }
  });

  // /prs snooze command - Snooze notifications
  app.command('/prs_snooze', async ({ command, ack, say }) => {
    await ack();
    
    try {
      const [duration, ...reasonParts] = command.text.split(' ');
      const reason = reasonParts.join(' ') || 'No reason provided';
      
      if (!duration || !['1h', '4h', '8h', '24h', '3d'].includes(duration)) {
        await say('Please specify a valid duration: 1h, 4h, 8h, 24h, or 3d');
        return;
      }
      
      await snoozeNotifications(command.user_id, duration, reason);
      await say(`🔕 Notifications snoozed for ${duration}. Reason: ${reason}`);
    } catch (error) {
      logger.error('Error handling /prs_snooze command', { error });
      await say('❌ Error snoozing notifications. Please try again later.');
    }
  });

  // /prs config command - Admin settings
  app.command('/prs_config', async ({ command, ack, say }) => {
    await ack();
    
    // TODO: Check if user is admin
    await say('⚙️ Configuration panel coming soon!');
  });

  // /prs link command - Link Slack ↔ GitHub
  app.command('/prs_link', async ({ command, ack, say }) => {
    await ack();
    
    try {
      const githubLogin = command.text.trim();
      
      if (!githubLogin) {
        await say('Please provide your GitHub username. Example: `/prs link dan1d2`');
        return;
      }
      
      await linkAccounts(command.user_id, githubLogin);
      await say(`✅ Linked Slack user <@${command.user_id}> to GitHub user \`${githubLogin}\``);
    } catch (error) {
      logger.error('Error handling /prs_link command', { error });
      await say('❌ Error linking accounts. Please try again later.');
    }
  });

  // Handle button clicks for "Take" action
  app.action(/take_pr_.+/, async ({ action, ack, say, body }) => {
    await ack();
    
    try {
      const prId = (action as any).value;
      const userId = body.user.id;
      
      const success = await takePR(prId, userId);
      
      if (success) {
        await say(`✅ <@${userId}> has taken PR ${prId} for review!`);
      } else {
        await say(`❌ Could not take PR ${prId}. It may already be taken.`);
      }
    } catch (error) {
      logger.error('Error handling take action', { error });
    }
  });
}

// Mock functions - TODO: Implement actual logic
async function getPrioritizedPRs(): Promise<any[]> {
  // TODO: Query database for READY PRs sorted by score
  return [
    {
      prId: 'dan1d2/autos-argentina#123',
      title: 'Fix Volkswagen Amarok comparison',
      author: 'dan1d2',
      score: 85,
      url: 'https://github.com/dan1d2/autos-argentina/pull/123',
      state: 'READY',
    },
    {
      prId: 'dan1d2/prtriage#1',
      title: 'Initial PR Triage Bot implementation',
      author: 'prtriage-bot',
      score: 92,
      url: 'https://github.com/dan1d2/prtriage/pull/1',
      state: 'READY',
    },
  ];
}

async function getGitHubLogin(slackId: string): Promise<string> {
  // TODO: Query database for GitHub login
  return 'dan1d2';
}

async function getUserPRs(githubLogin: string): Promise<any[]> {
  // TODO: Query database for user's PRs
  return [];
}

async function takePR(prId: string, slackUserId: string): Promise<boolean> {
  // TODO: Implement taking PR logic
  // 1. Get GitHub login from Slack ID
  // 2. Add user as reviewer via GitHub API
  // 3. Update PR state
  logger.info('Taking PR', { prId, slackUserId });
  return true;
}

async function snoozeNotifications(slackUserId: string, duration: string, reason: string): Promise<void> {
  // TODO: Implement snooze logic
  logger.info('Snoozing notifications', { slackUserId, duration, reason });
}

async function linkAccounts(slackId: string, githubLogin: string): Promise<void> {
  // TODO: Implement account linking logic
  logger.info('Linking accounts', { slackId, githubLogin });
}