import { defineConfig, devices } from '@playwright/test';

const PORTAL_URL = 'http://localhost:3100';
const CANDIDATE_URL = 'http://localhost:3101';
const CORPORATE_URL = 'http://localhost:3102';

export default defineConfig({
  testDir: './suites',
  globalSetup: './global-setup.ts',
  globalTeardown: './global-teardown.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    // --- Suite execution order (sequential via dependencies) ---
    {
      name: 'corporate',
      testDir: './suites/corporate',
      use: { ...devices['Desktop Chrome'], baseURL: CORPORATE_URL },
    },
    {
      name: 'company-admin',
      testDir: './suites/company-admin',
      use: { ...devices['Desktop Chrome'], baseURL: PORTAL_URL },
      dependencies: ['corporate'],
    },
    {
      name: 'recruiter',
      testDir: './suites/recruiter',
      use: { ...devices['Desktop Chrome'], baseURL: PORTAL_URL },
      dependencies: ['company-admin'],
    },
    {
      name: 'hiring-manager',
      testDir: './suites/hiring-manager',
      use: { ...devices['Desktop Chrome'], baseURL: PORTAL_URL },
      dependencies: ['recruiter'],
    },
    {
      name: 'candidate',
      testDir: './suites/candidate',
      use: { ...devices['Desktop Chrome'], baseURL: CANDIDATE_URL },
      dependencies: ['hiring-manager'],
    },
    {
      name: 'platform-admin',
      testDir: './suites/platform-admin',
      use: { ...devices['Desktop Chrome'], baseURL: PORTAL_URL },
      dependencies: ['candidate'],
    },
    {
      name: 'lifecycle',
      testDir: './suites/lifecycle',
      use: { ...devices['Desktop Chrome'], baseURL: PORTAL_URL },
      dependencies: ['platform-admin'],
    },
  ],

  webServer: [
    {
      command: 'pnpm --filter @splits-network/portal dev',
      url: PORTAL_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter @splits-network/candidate dev',
      url: CANDIDATE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter @splits-network/corporate dev',
      url: CORPORATE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
