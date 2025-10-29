import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0, // No retries locally for speed
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list'], // Show test progress
  ],
  timeout: 60000, // 60 seconds per test
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'off', // speed: disable tracing locally
    actionTimeout: 30000, // 30 seconds for actions
    navigationTimeout: 30000, // 30 seconds for page loads
    screenshot: 'off', // speed: disable screenshots
    video: 'off', // speed: disable videos
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes to start server
    env: {
      NEXT_PUBLIC_TEST_MODE: '1', // enable fast stubbed responses
    },
  },
});

