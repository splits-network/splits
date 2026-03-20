import { test as base, type Page, type BrowserContext } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const AUTH_DIR = path.join(__dirname, '..', '.auth');

export type TestRole =
  | 'recruiter'
  | 'company_admin'
  | 'hiring_manager'
  | 'candidate'
  | 'platform_admin'
  | 'second_recruiter';

function storageStatePath(role: TestRole): string {
  return path.join(AUTH_DIR, `${role}.json`);
}

function getSeedData(): Record<string, any> {
  const seedPath = path.join(AUTH_DIR, 'seed-data.json');
  if (!fs.existsSync(seedPath)) {
    throw new Error(
      'Seed data not found. Run the seed script first: pnpm tsx scripts/e2e-seed.ts'
    );
  }
  return JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
}

type AuthFixtures = {
  recruiterPage: Page;
  companyAdminPage: Page;
  hiringManagerPage: Page;
  candidatePage: Page;
  platformAdminPage: Page;
  secondRecruiterPage: Page;
  seedData: Record<string, any>;
};

async function createAuthenticatedPage(
  context: typeof base,
  role: TestRole
): Promise<Page> {
  const storagePath = storageStatePath(role);
  if (!fs.existsSync(storagePath)) {
    throw new Error(
      `Auth state for "${role}" not found at ${storagePath}. Run global-setup first.`
    );
  }

  const browser = await context.step(`Create ${role} context`, async () => {
    // This is handled via test.use() with storageState instead
    return null;
  });
  return null as any; // Placeholder — real implementation below
}

/**
 * Extend base test with role-specific authenticated pages.
 * Each fixture creates a fresh browser context with the role's stored auth state.
 */
export const test = base.extend<AuthFixtures>({
  recruiterPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: storageStatePath('recruiter'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  companyAdminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: storageStatePath('company_admin'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  hiringManagerPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: storageStatePath('hiring_manager'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  candidatePage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: storageStatePath('candidate'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  platformAdminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: storageStatePath('platform_admin'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  secondRecruiterPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: storageStatePath('second_recruiter'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  seedData: async ({}, use) => {
    await use(getSeedData());
  },
});

export { expect } from '@playwright/test';
