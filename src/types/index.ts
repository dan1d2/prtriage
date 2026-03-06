export type PRState = 
  | 'DRAFT'
  | 'READY'
  | 'WAITING_ON_REVIEWERS'
  | 'WAITING_ON_AUTHOR'
  | 'BLOCKED'
  | 'DONE';

export interface PRSnapshot {
  prId: string; // `${owner}/${repo}#${number}`
  state: PRState;
  title: string;
  author: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  lastPushSha: string;
  lastNotifiedSha?: string;
  checks: CheckStatus[];
  reviews: Review[];
  comments: Comment[];
  labels: string[];
  requestedReviewers: string[];
  assignees: string[];
  branchProtection?: BranchProtection;
  score: number;
}

export interface CheckStatus {
  name: string;
  status: 'pending' | 'success' | 'failure' | 'cancelled';
  conclusion?: string;
  url?: string;
}

export interface Review {
  id: number;
  user: string;
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED';
  submittedAt: Date;
  body?: string;
}

export interface Comment {
  id: number;
  user: string;
  body: string;
  createdAt: Date;
  isAuthor: boolean;
}

export interface BranchProtection {
  requiredChecks: string[];
  requiredApprovingReviews: number;
  dismissStaleReviews: boolean;
  requireCodeOwnerReviews: boolean;
}

export interface SlackUser {
  slackId: string;
  githubLogin: string;
  email?: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  prId: string;
  channel: string;
  userId?: string;
  message: string;
  state: PRState;
  sentAt: Date;
  sha: string;
}

export interface Snooze {
  id: string;
  prId: string;
  userId: string;
  expiresAt: Date;
  reason?: string;
  createdAt: Date;
}

export interface Digest {
  id: string;
  channel: string;
  date: Date;
  sentAt: Date;
  prCount: number;
}