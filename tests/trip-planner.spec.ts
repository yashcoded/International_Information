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

    // Steps list should appear
    const stepsList = page.locator('text=/Plan steps/i');
    await expect(stepsList).toBeVisible();

    // Check at least one step is rendered
    const stepItems = page.locator('li:has-text("check_visa"), li:has-text("generate_itinerary")');
    await expect(stepItems.first()).toBeVisible();

    // Summary should include stubbed text
    const summary = page.locator('text=Stubbed trip plan for testing').first();
    await expect(summary).toBeVisible();
  });
});

