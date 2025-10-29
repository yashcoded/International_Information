import { test, expect } from '@playwright/test';

test.describe('Theme Toggle', () => {
  test('should toggle between light and dark themes', async ({ page }) => {
    await page.goto('/');
    
    // Find theme toggle button
    const themeToggle = page.locator('button[title*="theme"], button:has-text("☀"), button:has-text("🌙")').first();
    await expect(themeToggle).toBeVisible();

    // Get initial theme
    const initialTheme = await page.evaluate(() => 
      document.documentElement.getAttribute('data-theme')
    );

    // Click theme toggle
    await themeToggle.click();
    await page.waitForTimeout(300);

    // Verify theme changed
    const newTheme = await page.evaluate(() => 
      document.documentElement.getAttribute('data-theme')
    );

    expect(newTheme).not.toBe(initialTheme);
  });

  test('should persist theme across page navigation', async ({ page }) => {
    await page.goto('/');
    
    // Set to light theme
    const themeToggle = page.locator('button[title*="theme"], button:has-text("☀"), button:has-text("🌙")').first();
    
    // Ensure we're in dark theme first
    let currentTheme = await page.evaluate(() => 
      document.documentElement.getAttribute('data-theme')
    );
    
    if (currentTheme !== 'dark') {
      await themeToggle.click();
      await page.waitForTimeout(200);
    }

    // Switch to light theme
    await themeToggle.click();
    await page.waitForTimeout(200);

    const lightTheme = await page.evaluate(() => 
      document.documentElement.getAttribute('data-theme')
    );
    expect(lightTheme).toBe('light');

    // Navigate to another page
    await page.goto('/TravelInfo');
    await page.waitForLoadState('networkidle');

    // Check theme persisted
    const persistedTheme = await page.evaluate(() => 
      document.documentElement.getAttribute('data-theme')
    );
    expect(persistedTheme).toBe('light');
  });

  test('should persist theme after page refresh', async ({ page }) => {
    await page.goto('/');
    
    const themeToggle = page.locator('button[title*="theme"], button:has-text("☀"), button:has-text("🌙")').first();
    
    // Set to light theme
    await themeToggle.click();
    await page.waitForTimeout(200);

    const themeBeforeRefresh = await page.evaluate(() => 
      document.documentElement.getAttribute('data-theme')
    );

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check theme persisted
    const themeAfterRefresh = await page.evaluate(() => 
      document.documentElement.getAttribute('data-theme')
    );

    expect(themeAfterRefresh).toBe(themeBeforeRefresh);
  });

  test('should have theme toggle on all pages', async ({ page }) => {
    const pages = ['/', '/TravelInfo', '/About'];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      const themeToggle = page.locator('button[title*="theme"], button:has-text("☀"), button:has-text("🌙")').first();
      await expect(themeToggle).toBeVisible();
    }
  });

  test('should apply correct styles for dark theme', async ({ page }) => {
    await page.goto('/');
    
    // Ensure dark theme is active
    const themeToggle = page.locator('button[title*="theme"], button:has-text("☀"), button:has-text("🌙")').first();
    
    let currentTheme = await page.evaluate(() => 
      document.documentElement.getAttribute('data-theme')
    );
    
    if (currentTheme !== 'dark') {
      await themeToggle.click();
      await page.waitForTimeout(300);
    }

    // Check dark theme is applied
    currentTheme = await page.evaluate(() => 
      document.documentElement.getAttribute('data-theme')
    );
    
    expect(currentTheme).toBe('dark');
  });

  test('should apply correct styles for light theme', async ({ page }) => {
    await page.goto('/');
    
    // Ensure light theme is active
    const themeToggle = page.locator('button[title*="theme"], button:has-text("☀"), button:has-text("🌙")').first();
    
    // Toggle until light (max 2 clicks)
    for (let i = 0; i < 2; i++) {
      const now = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      if (now === 'light') break;
      await themeToggle.click();
      await page.waitForTimeout(250);
    }

    // Check light theme is applied
    const currentTheme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    );
    
    expect(currentTheme).toBe('light');
  });
});

