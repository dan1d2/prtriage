# 🤖 PR Triage Bot

A GitHub + Slack bot that helps engineering teams always have the next correct PR to review and prevents PRs from dying silently.

## 🚀 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdan1d2%2Fprtriage&env=GITHUB_APP_ID,GITHUB_APP_PRIVATE_KEY,GITHUB_APP_WEBHOOK_SECRET,GITHUB_APP_CLIENT_ID,GITHUB_APP_CLIENT_SECRET,SLACK_BOT_TOKEN,SLACK_SIGNING_SECRET,SLACK_APP_TOKEN&envDescription=Required%20for%20GitHub%20and%20Slack%20integration&envLink=https%3A%2F%2Fgithub.com%2Fdan1d2%2Fprtriage%2Fblob%2Fmain%2F.env.example&project-name=prtriage&repository-name=prtriage)

## ✨ Features

### 📊 PR State Management
- **READY**: PR is ready for review
- **WAITING_ON_REVIEWERS**: Needs reviewer attention
- **WAITING_ON_AUTHOR**: Author needs to address feedback
- **BLOCKED**: Blocked by checks or dependencies
- **DONE**: Merged or closed

### 🎯 Smart Prioritization
- **Scoring Algorithm**: Size (40%), Age (25%), Activity (20%), Dependencies (15%)
- **Automatic State Detection**: Based on GitHub events
- **Anti-Spam**: SHA-based deduplication, 5-minute cooldown

### 💬 Slack Integration
- **/prs**: List PRs ready for review
- **/prs_mine**: List your PRs
- **/prs_take**: Take a PR for review
- **/prs_snooze**: Snooze notifications
- **/prs_config**: Admin configuration
- **/prs_link**: Link Slack ↔ GitHub accounts

### 🔧 GitHub Integration
- **Webhook Processing**: Real-time PR updates
- **"Take" Functionality**: Adds user as reviewer
- **Branch Protection**: Supports 2 approvals + 4 checks
- **Event Handling**: PR, review, check suite, comments

## 🏗️ Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   GitHub    │◄──►│  PR Triage  │◄──►│    Slack    │
│    App      │    │     Bot     │    │     App     │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                    ┌─────────────┐
                    │ PostgreSQL  │
                    │   + Redis   │
                    └─────────────┘
```

## 🛠️ Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **GitHub**: GitHub App + Webhooks
- **Slack**: Bolt.js + Socket Mode
- **Database**: PostgreSQL + Redis
- **Deployment**: Vercel
- **Monitoring**: Winston logging + Health checks

## 📦 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL (or Supabase/Neon)
- Redis (or Upstash)
- GitHub Account
- Slack Workspace

### Local Development

```bash
# Clone repository
git clone https://github.com/dan1d2/prtriage.git
cd prtriage

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
# GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY, etc.

# Start development server
npm run dev
```

### Production Deployment

See [DEPLOY.md](DEPLOY.md) for detailed Vercel deployment instructions.

## 🔧 Configuration

### GitHub App Setup
1. Create GitHub App at https://github.com/settings/apps
2. Configure permissions and webhooks
3. Get: App ID, Private Key, Client ID/Secret, Webhook Secret

### Slack App Setup
1. Create Slack App at https://api.slack.com/apps
2. Configure scopes and slash commands
3. Get: Bot Token, Signing Secret, App Token

### Environment Variables
See [.env.example](.env.example) for all required variables.

## 📚 Usage

### Slack Commands

```bash
# List PRs ready for review
/prs

# List your PRs
/prs_mine

# Take a PR for review
/prs_take owner/repo#123

# Snooze notifications
/prs_snooze 4h "Focusing on deep work"

# Link Slack ↔ GitHub
/prs_link your-github-username

# Admin configuration
/prs_config
```

### GitHub Integration
- The bot automatically monitors PRs in configured repositories
- Updates PR state based on events
- Sends notifications to Slack when PRs need attention

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format
```

## 📊 Database Schema

See [src/db/connection.ts](src/db/connection.ts) for complete schema including:
- `pr_snapshots`: PR state history
- `slack_users`: Slack ↔ GitHub mapping
- `notifications`: Sent notifications
- `snoozes`: User notification snoozes
- `digests`: Daily digest records

## 🔍 Monitoring

- **Health Check**: `GET /health`
- **Logs**: Structured JSON logging with Winston
- **Metrics**: Request timing, error rates, queue sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT

## 🙏 Acknowledgments

- Built with [OpenClaw](https://openclaw.ai)
- Inspired by engineering teams tired of PRs dying silently
- Thanks to all contributors and testers

## 📞 Support

- **Issues**: https://github.com/dan1d2/prtriage/issues
- **Documentation**: [DEPLOY.md](DEPLOY.md)
- **Quick Start**: Use the Vercel deploy button above!