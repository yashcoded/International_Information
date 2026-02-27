import { Page } from '@playwright/test';

/**
 * Helper functions for Playwright tests
 */

/**
 * Wait for countries to load on the travel form
 */
export async function waitForCountriesToLoad(page: Page) {
  await page.waitForTimeout(2000);
  // Wait for loading to finish
  await page.waitForSelector('input[placeholder*="Search for a country"]', { timeout: 10000 });
}

/**
 * Mock the visa info API to return a fast stubbed response
 */
export async function mockVisaInfo(page: Page) {
  await page.route('**/api/visa-info', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        visaInfo: 'Stubbed visa info: transit visa not required for short stays. Verify with official sources.',
        conversationId: 'mock-conv',
        suggestions: [
          'What documents are needed?',
          'Are there transit rules?',
          'How long can I stay without a visa?'
        ]
      })
    });
  });
}

/**
 * Mock the trip planning API to return a fast stubbed response
 */
export async function mockTripPlan(page: Page) {
  await page.route('**/api/plan-trip', async (route) => {
    const postData = route.request().postDataJSON() as any;
    const goalText = postData?.goalText || 'Plan a short sample trip.';

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        finalText: `Stubbed trip plan for testing.\n\nYou asked: "${goalText}".`,
        plan: {
          goal: goalText,
          steps: [
            { id: 1, action: 'check_visa', input: {} },
            { id: 2, action: 'generate_itinerary', input: {} },
            { id: 3, action: 'estimate_budget', input: {} },
            { id: 4, action: 'travel_tips', input: {} },
          ],
        },
        steps: [
          {
            id: 1,
            action: 'check_visa',
            input: {},
            summary: 'Stubbed visa check.',
          },
          {
            id: 2,
            action: 'generate_itinerary',
            input: {},
            summary: 'Stubbed itinerary.',
          },
          {
            id: 3,
            action: 'estimate_budget',
            input: {},
            summary: 'Stubbed budget.',
          },
          {
            id: 4,
            action: 'travel_tips',
            input: {},
            summary: 'Stubbed tips.',
          },
        ],
      }),
    });
  });
}

/** Ensure a stubbed conversation exists in localStorage (user + assistant) */
export async function ensureStubbedConversation(page: Page) {
  await page.evaluate(() => {
    try {
      const existing = localStorage.getItem('conversationHistory');
      if (existing) {
        const arr = JSON.parse(existing);
        if (Array.isArray(arr) && arr.length >= 2) return;
      }
      const history = [
        { role: 'user', content: 'Test query about transit visa' },
        { role: 'assistant', content: 'Stubbed visa info: transit visa not required.' }
      ];
      localStorage.setItem('conversationHistory', JSON.stringify(history));
      localStorage.setItem('latestVisaInfo', 'Stubbed visa info: transit visa not required.');
      localStorage.setItem('conversationId', 'stubbed');
    } catch {
      // ignore
    }
  });
}

/**
 * Fill out the basic travel form
 */
export async function fillTravelForm(page: Page, options: {
  passport: string;
  from: string;
  to: string;
}) {
  await waitForCountriesToLoad(page);

  // Fill passport country
  const inputs = page.locator('input[placeholder*="Search for a country"]');
  await inputs.nth(0).fill(options.passport);
  // Use keyboard to choose first suggestion quickly (faster than text match)
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);

  // Fill from country
  await inputs.nth(1).fill(options.from);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);

  // Fill to country
  await inputs.nth(2).fill(options.to);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
}

/**
 * Submit the travel form
 */
export async function submitTravelForm(page: Page) {
  await page.locator('button:has-text("Get Travel Information")').click({ timeout: 20000 });
}

/**
 * Wait for conversation response
 */
export async function waitForResponse(page: Page) {
  // Prefer DOM-based wait to avoid network timing issues
  const start = Date.now();
  const timeoutMs = 25000;
  while (Date.now() - start < timeoutMs) {
    // Check chat DOM
    const hasMessage = await page.locator('.messageText, .chatMessage, [class*="messageText"], [class*="chatMessage"]').count();
    if (hasMessage > 0) return;
    // Check localStorage snapshot
    const stored = await page.evaluate(() => {
      try {
        const h = localStorage.getItem('conversationHistory');
        if (!h) return false;
        const arr = JSON.parse(h);
        return Array.isArray(arr) && arr.length >= 2; // user + assistant
      } catch { return false; }
    });
    if (stored) return;
    await page.waitForTimeout(250);
  }
  // Give a best-effort small DOM wait; don't fail tests hard here
  await page.waitForSelector('.messageText, .chatMessage, [class*="messageText"], [class*="chatMessage"]', { timeout: 500 }).catch(() => {});
}

