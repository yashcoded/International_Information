# CI/CD Setup Guide

## Overview

This guide explains how to set up continuous integration and deployment for the International Travel Information application using GitHub Actions and Vercel.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Repository                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │          Push/PR to main/dev/dev_1               │  │
│  └──────────────────┬───────────────────────────────┘  │
│                     │                                    │
│                     ▼                                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │          GitHub Actions Workflow                  │  │
│  │                                                     │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────┐  │  │
│  │  │  Test Job   │  │  Build Job  │  │  Deploy  │  │  │
│  │  │             │  │             │  │   Job    │  │  │
│  │  │  • Lint     │─▶│  • Build    │─▶│          │  │  │
│  │  │  • Test     │  │  • Validate │  │  •Vercel │  │  │
│  │  │  • Report   │  │  • Artifact │  │          │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   Vercel CDN     │
                    │  (Production/    │
                    │    Preview)      │
                    └──────────────────┘
```

## Prerequisites

Before setting up CI/CD, ensure you have:

1. ✅ GitHub repository with your code
2. ✅ Vercel account and project
3. ✅ OpenAI API key
4. ✅ All tests passing locally

## Step 1: Vercel Setup

### 1.1 Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `.next`

### 1.2 Add Environment Variables in Vercel

1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add the following:
   - `OPENAI_API_KEY` = `your-openai-api-key`
4. Apply to all environments (Production, Preview, Development)

### 1.3 Get Vercel Tokens

You need three pieces of information:

**A. Vercel Token**
1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name it "GitHub Actions Deploy"
4. Copy the token (you won't see it again!)

**B. Vercel Organization ID**
1. Go to your [Vercel Team Settings](https://vercel.com/teams)
2. Find your team/organization
3. Copy the **Team ID** from the URL: `vercel.com/teams/[TEAM_ID]`

**C. Vercel Project ID**
1. Go to your project settings
2. Scroll to "General"
3. Copy the **Project ID**

Alternatively, run this in your project directory:
```bash
npx vercel link
cat .vercel/project.json
```

## Step 2: GitHub Secrets Setup

### 2.1 Add Secrets to GitHub

1. Go to your GitHub repository
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click "New repository secret"
4. Add the following secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `OPENAI_API_KEY` | `sk-...` | Your OpenAI API key |
| `VERCEL_TOKEN` | `...` | Vercel deployment token |
| `VERCEL_ORG_ID` | `...` | Your Vercel organization ID |
| `VERCEL_PROJECT_ID` | `...` | Your Vercel project ID |

### 2.2 Verify Secrets

After adding secrets, they should appear in the list (values are hidden for security).

## Step 3: Workflow Configuration

The workflow file is already created at `.github/workflows/test-and-deploy.yml`.

### 3.1 Workflow Structure

```yaml
name: Test and Deploy

on:
  push:
    branches: [main, dev, dev_1]
  pull_request:
    branches: [main, dev, dev_1]

jobs:
  test:    # Run tests
  build:   # Build application
  deploy:  # Deploy to Vercel
  notify:  # Send notifications
```

### 3.2 Workflow Jobs

**Test Job**:
- Installs dependencies with pnpm
- Installs Playwright browsers
- Runs linter
- Runs all Playwright tests
- Uploads test reports and screenshots

**Build Job**:
- Builds Next.js application
- Validates build output
- Uploads build artifacts

**Deploy Job** (only on push to main/dev/dev_1):
- Deploys to Vercel
- Uses production deployment for `main` branch
- Uses preview deployment for other branches

**Notify Job**:
- Checks status of previous jobs
- Sends notifications on failure/success

## Step 4: Testing the Workflow

### 4.1 Trigger Workflow

Push a commit to trigger the workflow:

```bash
git add .
git commit -m "test: trigger CI/CD workflow"
git push origin dev_1
```

### 4.2 Monitor Workflow

1. Go to **Actions** tab in GitHub
2. Click on the running workflow
3. Monitor each job's progress
4. Check logs for any errors

### 4.3 View Test Results

After the workflow completes:

1. Click on the completed workflow run
2. Scroll to **Artifacts** section
3. Download `playwright-report`
4. Extract and open `index.html`

## Step 5: Deployment Verification

### 5.1 Check Vercel Deployment

1. Go to your Vercel dashboard
2. Find your project
3. Click on the latest deployment
4. Verify the deployment URL works

### 5.2 Test Deployed Application

Visit your deployed URL and test:
- ✅ Home page loads
- ✅ Navigation works
- ✅ Form submission works
- ✅ Theme toggle works
- ✅ All features functional

## Workflow Behavior

### Branch-Specific Behavior

| Branch | Tests | Build | Deploy | Environment |
|--------|-------|-------|--------|-------------|
| `main` | ✅ Yes | ✅ Yes | ✅ Yes | Production |
| `dev` | ✅ Yes | ✅ Yes | ✅ Yes | Preview |
| `dev_1` | ✅ Yes | ✅ Yes | ✅ Yes | Preview |
| PR | ✅ Yes | ✅ Yes | ❌ No | - |

### Deployment Conditions

Deployment only occurs when:
1. ✅ All tests pass
2. ✅ Build succeeds
3. ✅ Push event (not PR)
4. ✅ Branch is main/dev/dev_1

### Failure Handling

If tests or build fail:
- ❌ Deployment is skipped
- 📧 Notification is sent
- 📊 Logs are available in Actions tab
- 📸 Screenshots saved (for test failures)

## Optimization Tips

### 1. Speed Up Workflow

**Use Dependency Caching**:
Already implemented in the workflow with pnpm cache.

**Parallel Jobs**:
Test and Build jobs run in parallel after dependencies are installed.

**Browser Caching**:
Playwright browsers are cached automatically.

### 2. Reduce Test Time

```typescript
// Run tests in parallel
test.describe.configure({ mode: 'parallel' });

// Use shared contexts
test.use({ 
  viewport: { width: 1280, height: 720 }
});
```

### 3. Optimize Build

```javascript
// next.config.js
module.exports = {
  swcMinify: true,        // Use SWC for minification
  compress: true,          // Enable gzip compression
  productionBrowserSourceMaps: false,
};
```

## Troubleshooting

### Common Issues

**1. Tests Fail in CI but Pass Locally**

**Problem**: Environment differences
**Solution**:
```bash
# Run tests in CI mode locally
CI=true pnpm test
```

**2. Deployment Fails**

**Problem**: Missing secrets or invalid tokens
**Solution**:
- Verify all secrets are set correctly
- Check token expiration
- Regenerate Vercel token if needed

**3. Build Fails**

**Problem**: Missing environment variables
**Solution**:
- Add `OPENAI_API_KEY` to Vercel environment variables
- Rebuild deployment

**4. Slow Workflow**

**Problem**: Installing dependencies takes too long
**Solution**:
- Ensure pnpm caching is working
- Check cache hit rate in logs

**5. Test Timeouts**

**Problem**: Tests timeout in CI
**Solution**:
```typescript
// Increase timeout for CI
test.setTimeout(process.env.CI ? 60000 : 30000);
```

### Debug Workflow

**Enable Debug Logging**:

1. Go to Repository Settings > Secrets
2. Add secret: `ACTIONS_RUNNER_DEBUG` = `true`
3. Add secret: `ACTIONS_STEP_DEBUG` = `true`
4. Re-run workflow

**View Detailed Logs**:
- Click on any job in the Actions tab
- Expand each step to see detailed logs
- Look for error messages and stack traces

## Maintenance

### Regular Tasks

**Weekly**:
- ✅ Review failed workflows
- ✅ Check deployment status
- ✅ Monitor test execution times

**Monthly**:
- ✅ Update dependencies
- ✅ Review and optimize tests
- ✅ Check Vercel usage/billing

**Quarterly**:
- ✅ Audit GitHub secrets
- ✅ Rotate API keys
- ✅ Review workflow efficiency

### Updating Workflow

To modify the workflow:

1. Edit `.github/workflows/test-and-deploy.yml`
2. Test changes in a feature branch
3. Create PR to review changes
4. Merge when tests pass

## Security Best Practices

1. ✅ Never commit secrets to repository
2. ✅ Use GitHub Secrets for sensitive data
3. ✅ Rotate tokens periodically
4. ✅ Limit token permissions
5. ✅ Review workflow permissions
6. ✅ Enable branch protection rules

## Cost Considerations

### GitHub Actions

- Free for public repositories
- 2,000 minutes/month for private repositories
- Additional minutes: $0.008/minute

### Vercel

- Free tier: 100 GB bandwidth, 100 GB-hours compute
- Pro tier: $20/month/member
- Enterprise: Custom pricing

## Advanced Configuration

### Matrix Testing (Multiple Browsers)

```yaml
strategy:
  matrix:
    browser: [chromium, firefox, webkit]
steps:
  - name: Run tests
    run: pnpm exec playwright test --project=${{ matrix.browser }}
```

### Conditional Deployment

```yaml
deploy:
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
```

### Slack Notifications

```yaml
- name: Slack Notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Playwright CI Documentation](https://playwright.dev/docs/ci)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## Support

For issues with:
- **GitHub Actions**: [GitHub Support](https://support.github.com/)
- **Vercel**: [Vercel Support](https://vercel.com/support)
- **Playwright**: [Playwright Discord](https://discord.gg/playwright)

---

*Last Updated: October 29, 2025*
*Version: 1.0.0*

