# Quick Test Guide

## Running Tests

### Full Test Suite
```bash
pnpm test
```

### Only Failed Tests (Fast!)
```bash
pnpm test:failed
```
This runs only tests that failed in the last run - much faster!

### Interactive UI Mode
```bash
pnpm test:ui
```

### With Visible Browser
```bash
pnpm test:headed
```

### Debug Mode
```bash
pnpm test:debug
```

### View HTML Report
```bash
pnpm test:report
```

## Test Configuration

### Timeouts
- **Test timeout**: 60 seconds
- **Action timeout**: 15 seconds  
- **Navigation timeout**: 30 seconds
- **Expect timeout**: 10 seconds

### Retries
- **CI**: 2 retries
- **Local**: 1 retry

### Features
- ✅ Parallel execution (4 workers)
- ✅ Auto-retry on failure
- ✅ Screenshots on failure
- ✅ Video on failure
- ✅ Caches passing tests

## Common Issues

### "Element not found"
**Solution**: Elements may be loading slowly. Tests now have 20s timeouts for clicks.

### "Timeout waiting for locator"
**Solution**: Country dropdowns need time to load. Helper functions handle this.

### Server not starting
**Solution**: Make sure port 3000 is free:
```bash
lsof -ti:3000 | xargs kill -9
```

## Test Structure

```
tests/
├── helpers.ts                  # Reusable functions
├── accessibility.spec.ts       # A11y tests
├── conversation-history.spec.ts # History tests
├── navigation.spec.ts          # Navigation tests
├── responsive-design.spec.ts   # Mobile/responsive tests
├── scroll-to-top.spec.ts       # Scroll button tests
├── theme-toggle.spec.ts        # Theme tests
└── travel-form.spec.ts         # Form tests
```

## Helper Functions

### `waitForCountriesToLoad(page)`
Waits for country data to load (2 seconds).

### `fillTravelForm(page, { passport, from, to })`
Fills out the entire travel form with automatic dropdown handling.

Example:
```typescript
await fillTravelForm(page, {
  passport: 'United States of America',
  from: 'United States of America',
  to: 'Japan'
});
```

### `submitTravelForm(page)`
Clicks the "Get Information" button with proper timeout.

### `waitForResponse(page)`
Waits for AI response to appear (60s timeout).

## CI/CD

Tests automatically run in GitHub Actions before deployment.

### Required Secrets
- `OPENAI_API_KEY`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Performance

### Speed Optimizations
1. ✅ `--last-failed` skips passing tests
2. ✅ Parallel execution (4 workers)
3. ✅ Server reuse (doesn't restart between runs)
4. ✅ Browser caching

### Typical Times
- Full suite: ~2-3 minutes
- Failed only: ~30-60 seconds
- Single test: ~3-10 seconds

## Debugging

### View Test in Browser
```bash
pnpm test:headed tests/your-test.spec.ts
```

### Step Through Test
```bash
pnpm test:debug tests/your-test.spec.ts
```

### Check Logs
- Test output: `test_output.txt`
- Failed tests: `test_failed_output.txt`
- HTML report: `playwright-report/`
- Screenshots: `test-results/`

## Tips

1. **Use `test:failed`** - Much faster than full suite
2. **Check HTML report** - Visual test results
3. **Use helpers** - Don't duplicate code
4. **Increase timeouts** - For slow API calls
5. **Run locally first** - Before pushing to CI

## Status

Current: **38/64 passing (59%)**
Target: **60+/64 passing (94%)**

With the latest fixes:
- ✅ Increased timeouts (20s for clicks)
- ✅ Better dropdown selectors
- ✅ Retry logic (1 retry local, 2 in CI)
- ✅ Only run failed tests option

---

*Last Updated: October 29, 2025*

