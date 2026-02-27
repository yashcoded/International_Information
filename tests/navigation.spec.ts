import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to all main pages', async ({ page }) => {
    // Home page
    await page.goto('/');
    await expect(page).toHaveTitle(/International Travel Information/i);
    await expect(page.locator('h1').first()).toContainText(/International Travel Information/i);

    // Navigate to Get Information page
    await page.click('a[href*="TravelInfo"]');
    await page.waitForLoadState('networkidle');
    await expect(page.url()).toContain('TravelInfo');
    await expect(page.locator('h1')).toContainText(/Visa Information/i);

    // Navigate to Trip Planner page (if present)
    const plannerLink = page.locator('a[href*="TripPlanner"]').first();
    if (await plannerLink.count()) {
      await plannerLink.click();
      await page.waitForLoadState('networkidle');
      // At least ensure we landed on a page with a visible heading
      await expect(page.locator('h1').first()).toBeVisible();
    }

    // Navigate to About page if present
    const aboutLink = page.locator('a[href*="About"]').first();
    if (await aboutLink.count()) {
      await aboutLink.click();
      await page.waitForLoadState('networkidle');
    }

    // Navigate back to Home
    await page.locator('a[href="/"]').first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.url()).toBe('http://localhost:3000/');
  });

  test('should have sticky navbar on all pages', async ({ page }) => {
    // Check home page
    await page.goto('/');
    const navbar = page.locator('nav').first();
    await expect(navbar).toBeVisible();

    // Scroll down and check navbar is still visible
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(200);
    await expect(navbar).toBeVisible();

    // Check on TravelInfo page
    await page.goto('/TravelInfo');
    await expect(navbar).toBeVisible();

    // Check on TripPlanner page
    await page.goto('/TripPlanner');
    await expect(navbar).toBeVisible();

    // Check on About page
    await page.goto('/About');
    await expect(navbar).toBeVisible();
  });

  test('should display correct logo on all pages', async ({ page }) => {
    const pages = ['/', '/TravelInfo', '/About'];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      // Logo could be img, svg, or text
      const logo = page.locator('img[alt*="logo"], img[alt*="Logo"], svg, a:has-text("Travel Info")').first();
      await expect(logo).toBeVisible();
    }
  });

  test('should have working navigation links in navbar', async ({ page }) => {
    await page.goto('/');
    
    // Check all nav links are present (use .first() for multiple matches)
    await expect(page.locator('a[href="/"]').first()).toBeVisible();
    await expect(page.locator('a[href*="TravelInfo"]').first()).toBeVisible();
    await expect(page.locator('a[href*="TripPlanner"]').first()).toBeVisible();
    await expect(page.locator('a[href*="About"]').first()).toBeVisible();
  });

  test('should handle 404 page gracefully', async ({ page }) => {
    await page.goto('/non-existent-page');
    // Should show 404 or redirect to home
    const url = page.url();
    const hasNotFound = await page.locator('text=/404|Not Found|Page not found/i').isVisible().catch(() => false);
    
    // Either shows 404 page or redirects
    expect(hasNotFound || url === 'http://localhost:3000/').toBeTruthy();
  });
});

