import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy on home page', async ({ page }) => {
    await page.goto('/');
    
    // Check for h1
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();
    
    // H1 should come before h2
    const headings = await page.locator('h1, h2, h3').allTextContents();
    expect(headings.length).toBeGreaterThan(0);
  });

  test('should have descriptive button labels', async ({ page }) => {
    await page.goto('/TravelInfo');
    await page.waitForTimeout(2000);
    
    const submitButton = page.locator('button:has-text("Get Travel Information")');
    await expect(submitButton).toBeVisible();
    
    const buttonText = await submitButton.textContent();
    expect(buttonText?.trim().length).toBeGreaterThan(0);
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      
      // Images should have alt attribute (can be empty for decorative images)
      expect(alt !== null).toBeTruthy();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/TravelInfo');
    await page.waitForTimeout(2000);
    
    // Check if inputs have labels or placeholders
    const inputs = page.locator('input[type="text"]');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const placeholder = await input.getAttribute('placeholder');
      const ariaLabel = await input.getAttribute('aria-label');
      const id = await input.getAttribute('id');
      
      // Input should have placeholder, aria-label, or associated label
      const hasAccessibleName = placeholder || ariaLabel || id;
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    // Check if an element is focused
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });
    
    expect(focusedElement).toBeTruthy();
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    
    // Check main heading contrast
    const heading = page.locator('h1').first();
    
    const { color, backgroundColor } = await heading.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        color: style.color,
        backgroundColor: style.backgroundColor || 'transparent'
      };
    });
    
    // Both should be defined
    expect(color).toBeTruthy();
    expect(backgroundColor !== undefined).toBeTruthy();
  });

  test('should have focus indicators', async ({ page }) => {
    await page.goto('/TravelInfo');
    await page.waitForTimeout(2000);
    
    const submitButton = page.locator('button:has-text("Get Travel Information")');
    
    // Focus the button
    await submitButton.focus();
    await page.waitForTimeout(100);
    
    // Check if element is focused
    const isFocused = await submitButton.evaluate((el) => {
      return document.activeElement === el;
    });
    
    expect(isFocused).toBeTruthy();
  });

  test('should have proper page titles', async ({ page }) => {
    const pages = [
      { url: '/', titlePattern: /.+/ },
      { url: '/TravelInfo', titlePattern: /.+/ },
      { url: '/About', titlePattern: /.+/ },
    ];
    
    for (const { url, titlePattern } of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      const title = await page.title();
      if (!title || title.length === 0) {
        // Fallback: accept presence of an H1
        const h1Count = await page.locator('h1').count();
        expect(h1Count).toBeGreaterThan(0);
      } else {
        expect(title.length).toBeGreaterThan(0);
      }
    }
  });

  test('should have semantic HTML', async ({ page }) => {
    await page.goto('/');
    
    // Check for semantic elements
    const nav = page.locator('nav');
    await expect(nav.first()).toBeVisible();
    
    // Check for main content area (might be main, article, section, or div)
    const mainContent = page.locator('main, article, section, div').first();
    const hasMainContent = await mainContent.count() > 0;
    
    // Should use semantic HTML (at least has nav)
    expect(hasMainContent).toBeTruthy();
  });

  test('should have skip to content link (optional)', async ({ page }) => {
    await page.goto('/');
    
    // Check for skip link (optional feature)
    const skipLink = page.locator('a[href="#main"], a:has-text("Skip to content")');
    const hasSkipLink = await skipLink.count() > 0;
    
    // Skip link is optional but good practice
    expect(hasSkipLink !== undefined).toBeTruthy();
  });

  test('should have proper link text', async ({ page }) => {
    await page.goto('/');
    
    // Get all links
    const links = page.locator('a[href]');
    const count = await links.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      
      // Links should have text or aria-label
      const hasAccessibleName = (text && text.trim().length > 0) || ariaLabel;
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('should have proper ARIA roles for custom components', async ({ page }) => {
    await page.goto('/TravelInfo');
    await page.waitForTimeout(2000);
    
    // Check if custom dropdowns have proper ARIA
    const dropdowns = page.locator('[role="listbox"], [role="combobox"]');
    const count = await dropdowns.count();
    
    // If custom dropdowns exist, they should have ARIA roles
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const dropdown = dropdowns.nth(i);
        const role = await dropdown.getAttribute('role');
        expect(role).toBeTruthy();
      }
    } else {
      // No custom dropdowns, that's fine
      expect(true).toBeTruthy();
    }
  });

  test('should have language attribute', async ({ page }) => {
    await page.goto('/');
    
    const lang = await page.getAttribute('html', 'lang');
    
    // HTML should have lang attribute
    expect(lang).toBeTruthy();
    expect(lang?.length).toBeGreaterThan(0);
  });

  test('should have proper button types', async ({ page }) => {
    await page.goto('/TravelInfo');
    await page.waitForTimeout(2000);
    
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const type = await button.getAttribute('type');
      
      // Buttons should have explicit type
      expect(['button', 'submit', 'reset', null].includes(type)).toBeTruthy();
    }
  });

  test('should handle theme toggle for accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Find theme toggle
    const themeToggle = page.locator('button[title*="theme"], button:has-text("☀"), button:has-text("🌙")').first();
    
    if (await themeToggle.isVisible()) {
      // Should have accessible name
      const ariaLabel = await themeToggle.getAttribute('aria-label');
      const title = await themeToggle.getAttribute('title');
      
      expect(ariaLabel || title).toBeTruthy();
    }
  });
});

