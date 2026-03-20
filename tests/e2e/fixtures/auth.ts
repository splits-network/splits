import { test as base, type Page } from '@playwright/test';
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

function hasAuthState(role: TestRole): boolean {
  return fs.existsSync(storageStatePath(role));
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

/**
 * Extend base test with role-specific authenticated pages.
 * Each fixture creates a fresh browser context with the role's stored auth state.
 * Auth state is created by the onboarding test specs that run first.
 */
export const test = base.extend<AuthFixtures>({
  recruiterPage: async ({ browser }, use) => {
    if (!hasAuthState('recruiter')) {
      throw new Error('Recruiter auth state not found. Run onboarding tests first.');
    }
    const context = await browser.newContext({
      storageState: storageStatePath('recruiter'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  companyAdminPage: async ({ browser }, use) => {
    if (!hasAuthState('company_admin')) {
      throw new Error('Company admin auth state not found. Run onboarding tests first.');
    }
    const context = await browser.newContext({
      storageState: storageStatePath('company_admin'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  hiringManagerPage: async ({ browser }, use) => {
    if (!hasAuthState('hiring_manager')) {
      throw new Error('Hiring manager auth state not found. Run onboarding tests first.');
    }
    const context = await browser.newContext({
      storageState: storageStatePath('hiring_manager'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  candidatePage: async ({ browser }, use) => {
    if (!hasAuthState('candidate')) {
      throw new Error('Candidate auth state not found. Run onboarding tests first.');
    }
    const context = await browser.newContext({
      storageState: storageStatePath('candidate'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  platformAdminPage: async ({ browser }, use) => {
    if (!hasAuthState('platform_admin')) {
      throw new Error('Platform admin auth state not found. Run onboarding tests first.');
    }
    const context = await browser.newContext({
      storageState: storageStatePath('platform_admin'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  secondRecruiterPage: async ({ browser }, use) => {
    if (!hasAuthState('second_recruiter')) {
      throw new Error('Second recruiter auth state not found. Run onboarding tests first.');
    }
    const context = await browser.newContext({
      storageState: storageStatePath('second_recruiter'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  seedData: async ({}, use) => {
    // Legacy fixture — onboarding tests create data via the UI now.
    // Tests that need entity IDs should extract them from the UI or API.
    await use({});
  },
});

export { expect } from '@playwright/test';
