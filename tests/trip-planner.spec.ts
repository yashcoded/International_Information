import { test, expect } from '@playwright/test';
import { mockTripPlan } from './helpers';

test.describe('Trip Planner', () => {
  test.beforeEach(async ({ page }) => {
    await mockTripPlan(page);
    await page.goto('/TripPlanner');
    await page.waitForLoadState('networkidle');
  });

  test('should display trip planner form', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Trip Planner/i);

    // Main textarea
    await expect(
      page.locator('textarea[placeholder*="Example: Plan a 10-day spring trip"]').first(),
    ).toBeVisible();

    // Optional details inputs
    await expect(page.locator('input[placeholder*="From"]').first()).toBeVisible();
    await expect(page.locator('input[placeholder*="To"]').first()).toBeVisible();
    await expect(page.locator('input[placeholder*="Days"]').first()).toBeVisible();

    // Primary button
    await expect(page.locator('button:has-text("Plan my trip")').first()).toBeVisible();
  });

  test('should plan a trip using stubbed API', async ({ page }) => {
    const goal = 'Plan a 5-day trip from Berlin to Rome in June with a mid-range budget.';
    await page
      .locator('textarea[placeholder*="Example: Plan a 10-day spring trip"]')
      .fill(goal);

    await page.locator('button:has-text("Plan my trip")').click();

    // Result panel should appear with "Your plan" header
    const planHeader = page.locator('text=/Your plan/i');
    await expect(planHeader).toBeVisible();

    // Check at least one step tab is rendered (labels use spaces: "check visa", "generate itinerary")
    const stepItems = page.locator('button:has-text("check visa"), button:has-text("generate itinerary")');
    await expect(stepItems.first()).toBeVisible();

    // Summary should include stubbed text
    const summary = page.locator('text=Stubbed trip plan for testing').first();
    await expect(summary).toBeVisible();
  });
});

