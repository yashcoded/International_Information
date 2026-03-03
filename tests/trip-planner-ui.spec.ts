import { test, expect } from '@playwright/test';
import { mockTripPlan } from './helpers';

test.describe('Trip Planner UI details', () => {
  test.beforeEach(async ({ page }) => {
    await mockTripPlan(page);
    await page.goto('/TripPlanner');
    await page.waitForLoadState('networkidle');
  });

  test('shows semantic dropdown suggestions for From/To fields', async ({ page }) => {
    const fromInput = page.locator('input[placeholder*="From"]').first();
    await fromInput.fill('Fran');

    const suggestion = page.locator('ul >> text=France').first();
    await expect(suggestion).toBeVisible();

    await suggestion.click();
    await expect(fromInput).toHaveValue('France');
  });

  test('updates budget labels when moving the range slider', async ({ page }) => {
    // Budget range section: two value displays next to Min Price / Max Price
    const budgetSection = page.locator('label:has-text("Budget range")').locator('..');
    await expect(budgetSection.locator('input[type="range"]').first()).toBeVisible();

    const sliders = page.locator('input[type="range"]');
    const minSlider = sliders.nth(0);
    const maxSlider = sliders.nth(1);

    await minSlider.fill('1000');
    await maxSlider.fill('5000');

    // Value displays show $min and $max
    await expect(page.getByText('$1000', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('$5000', { exact: true }).first()).toBeVisible();
  });

  test('persists last plan in localStorage and restores it on reload', async ({ page }) => {
    const goal = 'Plan a 3-day trip to Paris.';
    await page
      .locator('textarea[placeholder*="Example: Plan a 10-day spring trip"]')
      .fill(goal);

    await page.locator('button:has-text("Plan my trip")').click();

    // Wait for result panel to render ("Your plan" header)
    await expect(page.locator('text=/Your plan/i')).toBeVisible();

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Plan should still be visible after reload (restored from localStorage)
    await expect(page.locator('text=/Your plan/i')).toBeVisible();
  });

  test.describe('Route simulation (anime.js map)', () => {
    test('does not show route simulation when From or To are empty', async ({ page }) => {
      // Initially no from/to - route card should not be in the DOM
      await expect(page.locator('text=Route simulation')).toHaveCount(0);
    });

    test('shows route simulation when From and To are filled', async ({ page }) => {
      const fromInput = page.locator('input[placeholder*="From"]').first();
      const toInput = page.locator('input[placeholder*="To"]').first();
      await expect(fromInput).toBeVisible({ timeout: 20000 });

      await fromInput.fill('France');
      await page.locator('ul >> text=France').first().click();

      await toInput.fill('Japan');
      await page.locator('ul >> text=Japan').first().click();

      // Route simulation card should appear
      const routeTitle = page.locator('text=Route simulation').first();
      await expect(routeTitle).toBeVisible();

      // Legend: Origin and Destination
      await expect(page.locator('text=Origin').first()).toBeVisible();
      await expect(page.locator('text=Destination').first()).toBeVisible();

      // Meta shows "Origin → Destination" when no transit
      await expect(page.locator('text=Origin → Destination').first()).toBeVisible();
    });

    test('route simulation shows SVG map with path and plane element', async ({ page }) => {
      const fromInput = page.locator('input[placeholder*="From"]').first();
      const toInput = page.locator('input[placeholder*="To"]').first();
      await expect(fromInput).toBeVisible({ timeout: 20000 });

      await fromInput.fill('Germany');
      await page.locator('ul >> text=Germany').first().click();

      await toInput.fill('Italy');
      await page.locator('ul >> text=Italy').first().click();

      await expect(page.locator('text=Route simulation').first()).toBeVisible();

      // SVG with route path (id=trip-route-path) and plane (id=trip-route-plane)
      const svg = page.locator('svg[viewBox="0 0 400 150"]').first();
      await expect(svg).toBeVisible();

      const path = page.locator('#trip-route-path').first();
      await expect(path).toBeVisible();

      const plane = page.locator('#trip-route-plane').first();
      await expect(plane).toBeVisible();
    });

    test('route simulation displays origin and destination city labels', async ({ page }) => {
      const fromInput = page.locator('input[placeholder*="From"]').first();
      const toInput = page.locator('input[placeholder*="To"]').first();
      await expect(fromInput).toBeVisible({ timeout: 20000 });

      await fromInput.fill('United Kingdom');
      await page.locator('ul >> text=United Kingdom').first().click();

      await toInput.fill('Spain');
      await page.locator('ul >> text=Spain').first().click();

      // City names appear in the SVG/labels (exact text may be in SVG <text>)
      await expect(page.locator('text=United Kingdom').first()).toBeVisible();
      await expect(page.locator('text=Spain').first()).toBeVisible();
    });
  });
});

