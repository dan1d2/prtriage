# 🚀 Deploy to Vercel

This guide will help you deploy the PR Triage Bot to Vercel to get real URLs for GitHub and Slack configuration.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Connected to Vercel
3. **Repository Access**: You should have access to `dan1d2/prtriage`

## Step 1: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select **GitHub** and authorize if needed
4. Find and select **`dan1d2/prtriage`**
5. Configure project:
   - **Project Name**: `prtriage` (or your preferred name)
   - **Framework Preset**: `Other` (we'll use custom build)
   - **Root Directory**: `.`
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

6. Click **"Deploy"**

### Option B: Deploy via Vercel CLI

If you have Vercel CLI installed:
```bash
npm i -g vercel
vercel login
vercel
```

## Step 2: Get Your Deployment URLs

After deployment completes, Vercel will provide:

1. **Production URL**: `https://prtriage.vercel.app` (or similar)
2. **GitHub Webhook URL**: `https://prtriage.vercel.app/github/webhook`
3. **Slack Events URL**: `https://prtriage.vercel.app/slack/events`
4. **Health Check URL**: `https://prtriage.vercel.app/health`

## Step 3: Configure Environment Variables

In Vercel Dashboard, go to **Project Settings → Environment Variables** and add:

### GitHub Configuration
```
GITHUB_APP_ID=your_app_id_here
GITHUB_APP_PRIVATE_KEY=your_private_key_here
GITHUB_APP_WEBHOOK_SECRET=your_webhook_secret_here
GITHUB_APP_CLIENT_ID=your_client_id_here
GITHUB_APP_CLIENT_SECRET=your_client_secret_here
```

### Slack Configuration
```
SLACK_BOT_TOKEN=xoxb-your_bot_token_here
SLACK_SIGNING_SECRET=your_signing_secret_here
SLACK_APP_TOKEN=xapp-your_app_token_here  # For Socket Mode
```

### Database Configuration (Optional for MVP)
```
DATABASE_URL=postgresql://user:password@host:port/dbname
REDIS_URL=redis://host:port
```

### Other Configuration
```
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
APP_URL=https://prtriage.vercel.app
```

## Step 4: Redeploy with Environment Variables

After adding environment variables, redeploy the project:

1. Go to **Deployments** tab
2. Find your latest deployment
3. Click **"Redeploy"**

## Step 5: Verify Deployment

Check if your deployment is working:

1. **Health Check**: Visit `https://prtriage.vercel.app/health`
2. **Root Endpoint**: Visit `https://prtriage.vercel.app`
3. **GitHub Webhook**: Test with `curl -X POST https://prtriage.vercel.app/github/webhook`
4. **Slack Events**: Test with `curl -X POST https://prtriage.vercel.app/slack/events`

## Step 6: Configure GitHub App

Now use your real Vercel URLs in GitHub App configuration:

1. **Homepage URL**: `https://prtriage.vercel.app`
2. **Callback URL**: `https://prtriage.vercel.app/api/auth/github/callback`
3. **Webhook URL**: `https://prtriage.vercel.app/github/webhook`
4. **Webhook Secret**: Use the same as in environment variables

## Step 7: Configure Slack App

Use your real Vercel URLs in Slack App configuration:

1. **Request URLs for all slash commands**: `https://prtriage.vercel.app/slack/events`

## Troubleshooting

### Build Fails
- Check `npm run vercel-build` works locally
- Verify TypeScript compilation: `npm run build`

### Environment Variables Not Loading
- Redeploy after adding environment variables
- Check variable names match code

### GitHub Webhook Fails
- Verify webhook secret matches
- Check logs in Vercel Dashboard

### Slack Commands Not Working
- Verify Slack tokens are correct
- Check Socket Mode is enabled if using `SLACK_APP_TOKEN`

## Quick Deploy Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdan1d2%2Fprtriage&env=GITHUB_APP_ID,GITHUB_APP_PRIVATE_KEY,GITHUB_APP_WEBHOOK_SECRET,GITHUB_APP_CLIENT_ID,GITHUB_APP_CLIENT_SECRET,SLACK_BOT_TOKEN,SLACK_SIGNING_SECRET,SLACK_APP_TOKEN&envDescription=Required%20for%20GitHub%20and%20Slack%20integration&envLink=https%3A%2F%2Fgithub.com%2Fdan1d2%2Fprtriage%2Fblob%2Fmain%2F.env.example&project-name=prtriage&repository-name=prtriage)

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review GitHub repository issues
3. Contact maintainer