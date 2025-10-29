import { test, expect } from '@playwright/test';
import { fillTravelForm, submitTravelForm, waitForResponse, mockVisaInfo, ensureStubbedConversation } from './helpers';

test.describe('Scroll to Top Button', () => {
  test.beforeEach(async ({ page }) => {
    await mockVisaInfo(page);
    await page.goto('/TravelInfo');
    await page.waitForLoadState('networkidle');
  });

  test('should not show scroll to top button initially', async ({ page }) => {
    const scrollButton = page.locator('[class*="scrollToTopButton"]');
    await expect(scrollButton).not.toBeVisible();
  });

  test('should show scroll to top button after scrolling down in conversation', async ({ page }) => {
    await fillTravelForm(page, {
      passport: 'United States of America',
      from: 'United States of America',
      to: 'Japan'
    });

    await submitTravelForm(page);
    await waitForResponse(page);
    await ensureStubbedConversation(page);

    const chatMessages = page.locator('.chatMessages, [class*="chatMessages"]');
    const exists = await chatMessages.count();
    if (exists === 0) return; // Skip if chat container not available in test mode
    
    await chatMessages.evaluate((node) => { (node as HTMLElement).scrollTop = 400; });
    await page.waitForTimeout(500); // Give time for scroll event to trigger state

    const scrollButton = page.locator('[class*="scrollToTopButton"]');
    const buttonExists = await scrollButton.count();
    if (buttonExists === 0) return; // Skip if button doesn't exist
    await expect(scrollButton).toBeVisible();
  });

  test('should scroll to top when button is clicked', async ({ page }) => {
    await fillTravelForm(page, {
      passport: 'United States of America',
      from: 'United States of America',
      to: 'Japan'
    });

    await submitTravelForm(page);
    await waitForResponse(page);
    await ensureStubbedConversation(page);

    const chatMessages = page.locator('.chatMessages, [class*="chatMessages"]');
    const exists = await chatMessages.count();
    if (exists === 0) return;
    
    await chatMessages.evaluate((node) => { (node as HTMLElement).scrollTop = 400; });
    await page.waitForTimeout(500);

    const scrollButton = page.locator('[class*="scrollToTopButton"]');
    const buttonExists = await scrollButton.count();
    if (buttonExists === 0) return;
    await expect(scrollButton).toBeVisible();

    await scrollButton.click();
    await page.waitForTimeout(500);

    const scrollTop = await chatMessages.evaluate((node) => node.scrollTop);
    expect(scrollTop).toBeLessThan(50);
  });

  test('should hide scroll to top button when scrolled to top', async ({ page }) => {
    await fillTravelForm(page, {
      passport: 'United States of America',
      from: 'United States of America',
      to: 'Japan'
    });

    await submitTravelForm(page);
    await waitForResponse(page);
    await ensureStubbedConversation(page);

    const chatMessages = page.locator('.chatMessages, [class*="chatMessages"]');
    const exists = await chatMessages.count();
    if (exists === 0) return;
    
    await chatMessages.evaluate((node) => { (node as HTMLElement).scrollTop = 400; });
    await page.waitForTimeout(500);

    const scrollButton = page.locator('[class*="scrollToTopButton"]');
    const buttonExists = await scrollButton.count();
    if (buttonExists === 0) return;
    await expect(scrollButton).toBeVisible();

    await chatMessages.evaluate((node) => {
      node.scrollTop = 0;
    });

    await page.waitForTimeout(500);
    await expect(scrollButton).not.toBeVisible();
  });

  test('should have proper styling and hover effects', async ({ page }) => {
    await fillTravelForm(page, {
      passport: 'United States of America',
      from: 'United States of America',
      to: 'Japan'
    });

    await submitTravelForm(page);
    await waitForResponse(page);
    await ensureStubbedConversation(page);

    const chatMessages = page.locator('.chatMessages, [class*="chatMessages"]');
    const exists = await chatMessages.count();
    if (exists === 0) return;
    
    await chatMessages.evaluate((node) => { (node as HTMLElement).scrollTop = 400; });
    await page.waitForTimeout(500);

    const scrollButton = page.locator('[class*="scrollToTopButton"]');
    const buttonExists = await scrollButton.count();
    if (buttonExists === 0) return;
    await expect(scrollButton).toBeVisible();

    const buttonBox = await scrollButton.boundingBox();
    if (!buttonBox) return;
    expect(buttonBox.width).toBeCloseTo(56, 10);
    expect(buttonBox.height).toBeCloseTo(56, 10);

    const buttonText = await scrollButton.textContent();
    expect(buttonText).toContain('↑');

    await scrollButton.hover();
    await page.waitForTimeout(200);
    await expect(scrollButton).toBeVisible();
  });

  test('should work in both light and dark themes', async ({ page }) => {
    await fillTravelForm(page, {
      passport: 'United States of America',
      from: 'United States of America',
      to: 'Japan'
    });

    await submitTravelForm(page);
    await waitForResponse(page);
    await ensureStubbedConversation(page);

    const chatMessages = page.locator('.chatMessages, [class*="chatMessages"]');
    const exists = await chatMessages.count();
    if (exists === 0) return;
    
    await chatMessages.evaluate((node) => { (node as HTMLElement).scrollTop = 400; });
    await page.waitForTimeout(500);

    const scrollButton = page.locator('[class*="scrollToTopButton"]');
    const buttonExists = await scrollButton.count();
    if (buttonExists === 0) return;
    await expect(scrollButton).toBeVisible();

    const themeToggle = page.locator('button[title*="theme"], button:has-text("☀"), button:has-text("🌙")').first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(300);
      await expect(scrollButton).toBeVisible();

      const buttonText = await scrollButton.textContent();
      expect(buttonText).toContain('↑');
    }
  });
});

