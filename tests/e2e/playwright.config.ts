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
  timeout: 60_000,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 15_000,
    navigationTimeout: 60_000,
  },

  projects: [
    // --- 1. Corporate (no auth, validates infra) ---
    {
      name: 'corporate',
      testDir: './suites/corporate',
      use: { ...devices['Desktop Chrome'], baseURL: CORPORATE_URL },
    },

    // --- 2. Portal Onboarding (recruiter, company admin, hiring manager, second recruiter) ---
    {
      name: 'onboarding-portal',
      testDir: './suites/onboarding',
      testMatch: ['01-recruiter*', '02-company*', '04-hiring*', '05-platform*', '06-second*'],
      use: { ...devices['Desktop Chrome'], baseURL: PORTAL_URL },
      dependencies: ['corporate'],
    },

    // --- 2b. Candidate Onboarding (separate Clerk instance, may fail independently) ---
    {
      name: 'onboarding-candidate',
      testDir: './suites/onboarding',
      testMatch: ['03-candidate*'],
      use: { ...devices['Desktop Chrome'], baseURL: CANDIDATE_URL },
      dependencies: ['corporate'],
    },

    // --- 3. Company Admin (creates roles/jobs that everything depends on) ---
    {
      name: 'company-admin',
      testDir: './suites/company-admin',
      use: { ...devices['Desktop Chrome'], baseURL: PORTAL_URL },
      dependencies: ['onboarding-portal'],
    },

    // --- 4. Recruiter (submits candidates, creates applications) ---
    {
      name: 'recruiter',
      testDir: './suites/recruiter',
      use: { ...devices['Desktop Chrome'], baseURL: PORTAL_URL },
      dependencies: ['company-admin'],
    },

    // --- 5. Hiring Manager (reviews applications) ---
    {
      name: 'hiring-manager',
      testDir: './suites/hiring-manager',
      use: { ...devices['Desktop Chrome'], baseURL: PORTAL_URL },
      dependencies: ['recruiter'],
    },

    // --- 6. Candidate (browses jobs, tracks applications) ---
    // Depends on onboarding-candidate for auth state, and onboarding-portal for portal data
    // Does NOT depend on hiring-manager — those are independent checks
    {
      name: 'candidate',
      testDir: './suites/candidate',
      use: { ...devices['Desktop Chrome'], baseURL: CANDIDATE_URL },
      dependencies: ['onboarding-candidate', 'onboarding-portal'],
    },

    // --- 7. Lifecycle (full cross-role flows — needs all role auth states) ---
    {
      name: 'lifecycle',
      testDir: './suites/lifecycle',
      use: { ...devices['Desktop Chrome'], baseURL: PORTAL_URL },
      dependencies: ['company-admin', 'recruiter'],
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
