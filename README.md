# PR Triage Bot

> Never miss the next PR to review. Keep your engineering team flowing.

## 🎯 What is PR Triage Bot?

PR Triage Bot helps engineering teams always have the next correct PR to review and prevents PRs from dying silently.

### Key Features
- **Smart Prioritization**: Automatically identifies which PRs are ready for review
- **Slack Integration**: `/prs`, `/prs mine`, `/prs take` commands
- **GitHub Integration**: Real-time webhook processing
- **Anti-Spam**: SHA-based deduplication, 5-minute cooldown
- **"Take" Functionality**: One-click to add yourself as reviewer

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Webhooks │──▶│   State Machine  │──▶│   Slack Notify   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub API     │    │   PostgreSQL     │    │   Slack Bolt     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Tech Stack
- **Backend**: Node.js 18+, TypeScript 5.3+
- **GitHub**: Probot + Octokit
- **Slack**: Slack Bolt
- **Database**: PostgreSQL + Redis (cache)
- **Container**: Docker

## 📋 PR States

| State | Description | Notification |
|-------|-------------|--------------|
| **READY** | All checks pass, needs reviewers | Channel notification |
| **WAITING_ON_REVIEWERS** | Reviews requested, waiting | Digest only |
| **WAITING_ON_AUTHOR** | Changes requested or comments after last push | DM after 48h |
| **BLOCKED** | Failed checks or conflicts | Digest only |
| **DONE** | Merged or closed | None |

## 🚀 Quick Start

### 1. Clone & Setup
```bash
git clone https://github.com/dan1d2/prtriage.git
cd prtriage
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your tokens
```

### 3. Database Setup
```bash
npm run db:migrate
```

### 4. Run Development
```bash
npm run dev
```

## 🔧 Configuration

### GitHub App Setup
1. Create GitHub App with these permissions:
   - Pull requests: Read & Write
   - Checks: Read
   - Metadata: Read
   - Issues: Read
   - Contents: Read

2. Webhook events:
   - `pull_request`
   - `pull_request_review`
   - `check_suite`
   - `check_run`
   - `issue_comment`

### Slack App Setup
1. Create Slack App with these scopes:
   - `chat:write`
   - `commands`
   - `users:read`
   - `conversations:read`
   - `im:write`

2. Slash commands:
   - `/prs` - List PRs by priority
   - `/prs mine` - List your PRs
   - `/prs take` - Take a PR for review
   - `/prs snooze` - Snooze notifications
   - `/prs config` - Admin settings
   - `/prs link` - Link Slack ↔ GitHub

## 📊 Scoring Algorithm

PRs are scored for prioritization:
- **Size (40%)**: Smaller PRs get higher priority
- **Age (25%)**: Older PRs get higher priority
- **Activity (20%)**: Recent activity increases priority
- **Dependencies (15%)**: Blocking other work increases priority

## 🛡️ Branch Protection Integration

Respects repository branch protection rules:
- Required checks (typically 4)
- Required approving reviews (typically 2)
- CODEOWNERS file (if enabled)
- Dismiss stale reviews setting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a PR

## 📄 License

MIT

## 🙏 Acknowledgments

Built with ❤️ using:
- [Probot](https://probot.github.io/) - GitHub App framework
- [Slack Bolt](https://slack.dev/bolt-js/) - Slack App framework
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Redis](https://redis.io/) - Cache

---

**Maintained by**: [dan1d2](https://github.com/dan1d2)
**Project Status**: MVP Development