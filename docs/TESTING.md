# Testing Documentation

## Overview

This project uses [Playwright](https://playwright.dev/) for end-to-end testing. The tests ensure that key user interactions and features work correctly across different scenarios.

## Setup

### Prerequisites

- Node.js (v18 or higher)
- pnpm package manager

### Installation

```bash
# Install dependencies
pnpm install

# Install Playwright browsers
pnpm exec playwright install chromium
```

## Running Tests

### Run all tests

```bash
pnpm exec playwright test
```

### Run tests in UI mode (interactive)

```bash
pnpm exec playwright test --ui
```

### Run specific test file

```bash
pnpm exec playwright test tests/scroll-to-top.spec.ts
```

### Run tests in headed mode (see browser)

```bash
pnpm exec playwright test --headed
```

### Debug tests

```bash
pnpm exec playwright test --debug
```

## Test Structure

### Test Files

All test files are located in the `tests/` directory and follow the naming convention `*.spec.ts`.

### Current Test Suites

#### 1. Navigation Tests (`navigation.spec.ts`)

Tests core navigation functionality across the application.

**Test Cases:**
- Navigate to all main pages (Home, TravelInfo, About)
- Sticky navbar on all pages
- Logo visibility and consistency
- Working navigation links
- 404 page handling

#### 2. Theme Toggle Tests (`theme-toggle.spec.ts`)

Tests dark/light theme switching functionality.

**Test Cases:**
- Toggle between light and dark themes
- Theme persistence across page navigation
- Theme persistence after page refresh
- Theme toggle availability on all pages
- Correct styling for dark theme
- Correct styling for light theme

#### 3. Travel Form Tests (`travel-form.spec.ts`)

Tests the main travel information form functionality.

**Test Cases:**
- Display all form fields correctly
- Show dropdown when typing in country fields
- Select country from dropdown
- Show transit country fields for layover options
- Show second transit field for 2 layovers
- Submit form with valid data
- Show loading state during submission
- Handle offline state gracefully
- Display request limit badge
- Validate required fields

#### 4. Conversation History Tests (`conversation-history.spec.ts`)

Tests conversation history and persistence features.

**Test Cases:**
- Save conversation after submission
- Persist conversation history across page refresh
- Show conversation sidebar when history button clicked
- Close conversation sidebar
- Display conversation messages correctly
- Show jump-to-message menu
- Auto-fill form from history selection

#### 5. Responsive Design Tests (`responsive-design.spec.ts`)

Tests responsive behavior across different device sizes.

**Test Cases:**
- Display correctly on Mobile (375px)
- Display correctly on Tablet (768px)
- Display correctly on Desktop (1920px)
- Proper touch targets on all devices
- Readable text on all devices
- Handle mobile menu if present
- Proper spacing on mobile
- Scale images properly
- Handle landscape orientation on mobile
- Proper button sizes on mobile
- No horizontal overflow on mobile

#### 6. Accessibility Tests (`accessibility.spec.ts`)

Tests accessibility compliance and best practices.

**Test Cases:**
- Proper heading hierarchy on home page
- Descriptive button labels
- Alt text for images
- Proper form labels
- Keyboard navigable
- Sufficient color contrast
- Focus indicators
- Proper page titles
- Semantic HTML
- Skip to content link (optional)
- Proper link text
- Proper ARIA roles for custom components
- Language attribute
- Proper button types
- Theme toggle accessibility

#### 7. Scroll to Top Button Tests (`scroll-to-top.spec.ts`)

Tests the scroll-to-top button functionality in the conversation interface.

**Test Cases:**
- Initial state (button hidden)
- Button appearance on scroll (>300px)
- Scroll to top functionality
- Button hide when at top
- Styling and hover effects
- Theme compatibility

### Test Best Practices

1. **Isolation**: Each test is independent and doesn't rely on state from other tests
2. **Cleanup**: Tests clean up after themselves
3. **Waits**: Uses proper waiting strategies (`waitForSelector`, `waitForTimeout`) instead of hard sleeps
4. **Assertions**: Uses meaningful assertions with clear error messages
5. **Selectors**: Uses CSS class selectors for reliability

## Configuration

The Playwright configuration is defined in `playwright.config.ts`:

- **Test Directory**: `./tests`
- **Base URL**: `http://localhost:3000`
- **Browser**: Chromium (Desktop Chrome)
- **Dev Server**: Automatically starts the Next.js dev server before running tests
- **Retries**: 2 retries in CI, 0 locally
- **Reporter**: HTML reporter for viewing results

## Writing New Tests

### Template for a New Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/your-page');
    await page.waitForLoadState('networkidle');
  });

  test('should do something specific', async ({ page }) => {
    // Arrange: Set up test conditions
    await page.fill('input[name="field"]', 'value');

    // Act: Perform the action
    await page.click('button:has-text("Submit")');

    // Assert: Verify the result
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

### Common Patterns

#### Filling out the travel form

```typescript
await page.fill('input[placeholder*="passport"]', 'United States');
await page.click('text=United States of America');

await page.fill('input[placeholder*="traveling from"]', 'United States');
await page.click('text=United States of America');

await page.fill('input[placeholder*="traveling to"]', 'Japan');
await page.click('text=Japan');

await page.click('button:has-text("Get Information")');
await page.waitForSelector('.chatMessage', { timeout: 30000 });
```

#### Switching themes

```typescript
const themeToggle = page.locator('button[title*="Switch to light theme"], button[title*="Switch to dark theme"]').first();
await themeToggle.click();
await page.waitForTimeout(200);
```

#### Scrolling in a specific container

```typescript
const container = page.locator('.chatMessages');
await container.evaluate((node) => {
  node.scrollTop = 400; // Scroll to specific position
});
```

## CI/CD Integration

This project uses GitHub Actions for continuous integration and deployment. The workflow is defined in `.github/workflows/test-and-deploy.yml`.

### Workflow Overview

The CI/CD pipeline consists of 4 jobs:

1. **Test Job** - Runs all Playwright tests
2. **Build Job** - Builds the Next.js application
3. **Deploy Job** - Deploys to Vercel (only on push to main/dev branches)
4. **Notify Job** - Sends status notifications

### Required GitHub Secrets

Add these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

- `OPENAI_API_KEY` - Your OpenAI API key
- `VERCEL_TOKEN` - Vercel authentication token
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID

### Workflow Features

- ✅ Runs on push and pull requests to main/dev/dev_1 branches
- ✅ Caches pnpm dependencies for faster builds
- ✅ Runs linter before tests
- ✅ Uploads test reports as artifacts
- ✅ Uploads screenshots on test failure
- ✅ Only deploys if all tests pass
- ✅ Automatic deployment to Vercel preview (dev branches) or production (main)

### Manual Workflow Trigger

You can also trigger the workflow manually from the Actions tab in GitHub.

### Viewing Test Results

1. Go to the **Actions** tab in your GitHub repository
2. Click on the latest workflow run
3. Download the `playwright-report` artifact
4. Extract and open `index.html` to view the detailed test report

## Troubleshooting

### Tests Fail with Timeout

- Increase timeout in test: `await page.waitForSelector('.element', { timeout: 60000 })`
- Check if the dev server is running properly
- Verify API keys are set in environment variables

### Button/Element Not Found

- Check CSS class names in the test match the actual implementation
- Use Playwright Inspector to debug: `pnpm exec playwright test --debug`
- Verify element is visible and not hidden by CSS

### Flaky Tests

- Add proper waits instead of fixed timeouts
- Use `waitForLoadState('networkidle')` to ensure page is fully loaded
- Check for race conditions in async operations

## Test Reports

After running tests, view the HTML report:

```bash
pnpm exec playwright show-report
```

This will open a browser with detailed test results, including:
- Pass/fail status for each test
- Screenshots on failure
- Traces for debugging
- Performance metrics

## Future Test Coverage

Planned areas for additional testing:

- [ ] Form validation tests
- [ ] Conversation history persistence
- [ ] Multiple layover scenarios
- [ ] Offline mode functionality
- [ ] Mobile responsiveness
- [ ] Accessibility (a11y) tests
- [ ] Performance benchmarks
- [ ] API integration tests
- [ ] PWA functionality tests

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Next.js Testing Documentation](https://nextjs.org/docs/testing)

