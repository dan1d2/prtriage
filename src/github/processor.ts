import { createLogger } from '../utils/logger';
import { PRSnapshot, PRState } from '../types';

const logger = createLogger('github-processor');

export async function processWebhookEvent(event: string, payload: any) {
  logger.info('Processing GitHub event', { event });

  switch (event) {
    case 'pull_request':
      await handlePullRequestEvent(payload);
      break;
    case 'pull_request_review':
      await handlePullRequestReviewEvent(payload);
      break;
    case 'check_suite':
    case 'check_run':
      await handleCheckEvent(payload);
      break;
    case 'issue_comment':
      await handleIssueCommentEvent(payload);
      break;
    default:
      logger.debug('Unhandled event type', { event });
  }
}

async function handlePullRequestEvent(payload: any) {
  const { action, pull_request: pr, repository } = payload;
  const prId = `${repository.full_name}#${pr.number}`;

  logger.info('Processing pull_request event', {
    prId,
    action,
    state: pr.state,
    merged: pr.merged,
  });

  // Determine PR state
  const state = determinePRState(pr, action);

  // Create PR snapshot
  const snapshot: PRSnapshot = {
    prId,
    state,
    title: pr.title,
    author: pr.user.login,
    url: pr.html_url,
    createdAt: new Date(pr.created_at),
    updatedAt: new Date(pr.updated_at),
    lastPushSha: pr.head.sha,
    checks: await extractChecks(pr),
    reviews: await extractReviews(pr),
    comments: await extractComments(pr),
    labels: pr.labels.map((label: any) => label.name),
    requestedReviewers: [
      ...(pr.requested_reviewers || []).map((r: any) => r.login),
      ...(pr.requested_teams || []).map((t: any) => t.name),
    ],
    assignees: (pr.assignees || []).map((a: any) => a.login),
    branchProtection: await extractBranchProtection(repository, pr.base.ref),
    score: calculatePRScore(pr),
  };

  // Save to database
  await savePRSnapshot(snapshot);

  // Trigger notifications if needed
  if (shouldNotify(state, action)) {
    await triggerNotifications(snapshot);
  }
}

function determinePRState(pr: any, action: string): PRState {
  if (pr.state === 'closed') {
    return pr.merged ? 'DONE' : 'DONE'; // Closed without merge is also DONE
  }

  if (pr.draft) {
    return 'DRAFT';
  }

  // Check if checks are failing
  if (pr.mergeable_state === 'dirty' || pr.mergeable_state === 'blocked') {
    return 'BLOCKED';
  }

  // Check if changes were requested
  if (hasChangesRequested(pr)) {
    return 'WAITING_ON_AUTHOR';
  }

  // Check if reviews are pending
  if (needsReviews(pr)) {
    return 'WAITING_ON_REVIEWERS';
  }

  // Default to READY
  return 'READY';
}

function hasChangesRequested(pr: any): boolean {
  // TODO: Implement logic to check if changes were requested
  // This would require checking review states
  return false;
}

function needsReviews(pr: any): boolean {
  // TODO: Implement logic to check if reviews are needed
  // This would require checking requested reviewers vs approved reviews
  return true;
}

async function extractChecks(pr: any): Promise<any[]> {
  // TODO: Implement checks extraction
  return [];
}

async function extractReviews(pr: any): Promise<any[]> {
  // TODO: Implement reviews extraction
  return [];
}

async function extractComments(pr: any): Promise<any[]> {
  // TODO: Implement comments extraction
  return [];
}

async function extractBranchProtection(repository: any, branch: string): Promise<any> {
  // TODO: Implement branch protection extraction
  return {
    requiredChecks: ['ci/circleci', 'lint', 'test', 'build'],
    requiredApprovingReviews: 2,
    dismissStaleReviews: true,
    requireCodeOwnerReviews: false,
  };
}

function calculatePRScore(pr: any): number {
  // Simplified scoring algorithm
  let score = 0;
  
  // Size (40%) - smaller is better
  const changes = pr.additions + pr.deletions;
  const sizeScore = Math.max(0, 100 - (changes / 10));
  score += sizeScore * 0.4;
  
  // Age (25%) - older is higher priority
  const ageHours = (Date.now() - new Date(pr.created_at).getTime()) / (1000 * 60 * 60);
  const ageScore = Math.min(100, ageHours * 2);
  score += ageScore * 0.25;
  
  // Activity (20%) - recent activity increases priority
  const activityHours = (Date.now() - new Date(pr.updated_at).getTime()) / (1000 * 60 * 60);
  const activityScore = Math.max(0, 100 - activityHours);
  score += activityScore * 0.2;
  
  // Dependencies (15%) - blocking other work
  const dependencyScore = pr.labels?.some((l: any) => l.name.includes('blocking')) ? 100 : 0;
  score += dependencyScore * 0.15;
  
  return Math.round(score);
}

async function savePRSnapshot(snapshot: PRSnapshot) {
  // TODO: Implement database save
  logger.info('Saving PR snapshot', { prId: snapshot.prId, state: snapshot.state, score: snapshot.score });
}

function shouldNotify(state: PRState, action: string): boolean {
  // Notify for READY state or specific actions
  return state === 'READY' || action === 'review_requested';
}

async function triggerNotifications(snapshot: PRSnapshot) {
  // TODO: Implement notification triggering
  logger.info('Triggering notifications', { prId: snapshot.prId, state: snapshot.state });
}

async function handlePullRequestReviewEvent(payload: any) {
  // TODO: Implement review event handling
  logger.info('Processing pull_request_review event', { reviewId: payload.review.id });
}

async function handleCheckEvent(payload: any) {
  // TODO: Implement check event handling
  logger.info('Processing check event', { checkId: payload.check_run?.id || payload.check_suite?.id });
}

async function handleIssueCommentEvent(payload: any) {
  // TODO: Implement comment event handling
  logger.info('Processing issue_comment event', { commentId: payload.comment.id });
}