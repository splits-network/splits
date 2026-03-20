/**
 * Global setup — runs before all test suites.
 * Authenticates each test user via Clerk and saves browser storage state.
 */

import { chromium, type FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const AUTH_DIR = path.join(__dirname, '.auth');
const PORTAL_URL = 'http://localhost:3100';
const CANDIDATE_URL = 'http://localhost:3101';

interface UserCreds {
  email: string;
  password: string;
  clerkUserId: string;
}

interface SeedData {
  users: Record<string, UserCreds>;
}

function loadSeedData(): SeedData {
  const seedPath = path.join(AUTH_DIR, 'seed-data.json');
  if (!fs.existsSync(seedPath)) {
    throw new Error(
      'Seed data not found. Run the seed script first:\n  pnpm tsx scripts/e2e-seed.ts'
    );
  }
  return JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
}

async function authenticateUser(
  baseUrl: string,
  email: string,
  password: string,
  storageStatePath: string
) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to sign-in page
    await page.goto(`${baseUrl}/sign-in`, { waitUntil: 'networkidle' });

    // Custom sign-in form — email and password on the same page.
    // Scope to the form containing the password field to avoid
    // matching the newsletter subscribe form.
    const form = page.locator('form:has(input[type="password"])');
    await form.waitFor({ timeout: 15_000 });

    // Fill email (placeholder: "you@company.com")
    await form.locator('input[type="email"]').fill(email);

    // Fill password (placeholder: "Enter your password")
    await form.locator('input[type="password"]').fill(password);

    // Click "Sign In" submit button
    await form.locator('button[type="submit"]').click();

    // Wait for redirect to portal (indicates successful auth)
    await page.waitForURL('**/portal/**', { timeout: 30_000 });

    // Save storage state (cookies + localStorage)
    await context.storageState({ path: storageStatePath });
    console.log(`  ✓ Authenticated: ${email}`);
  } catch (error) {
    console.error(`  ✗ Failed to authenticate: ${email}`, error);
    // Save screenshot for debugging
    await page.screenshot({
      path: path.join(AUTH_DIR, `auth-failure-${email.split('@')[0]}.png`),
    });
    throw error;
  } finally {
    await browser.close();
  }
}

async function globalSetup(config: FullConfig) {
  console.log('\n=== E2E Global Setup ===\n');

  const seedData = loadSeedData();

  // Authenticate portal users (recruiter, company_admin, hiring_manager, platform_admin, second_recruiter)
  const portalUsers = ['recruiter', 'company_admin', 'hiring_manager', 'platform_admin', 'second_recruiter'];
  for (const role of portalUsers) {
    const user = seedData.users[role];
    if (!user) {
      console.warn(`  ⚠ No seed data for role: ${role}, skipping`);
      continue;
    }
    const storagePath = path.join(AUTH_DIR, `${role}.json`);

    // Skip if storage state already exists and is recent (< 1 hour)
    if (fs.existsSync(storagePath)) {
      const stats = fs.statSync(storagePath);
      const ageMs = Date.now() - stats.mtimeMs;
      if (ageMs < 60 * 60 * 1000) {
        console.log(`  ⏭ Reusing auth state for: ${role} (${Math.round(ageMs / 60000)}m old)`);
        continue;
      }
    }

    await authenticateUser(PORTAL_URL, user.email, user.password, storagePath);
  }

  // Authenticate candidate user via candidate app
  const candidateUser = seedData.users['candidate'];
  if (candidateUser) {
    const storagePath = path.join(AUTH_DIR, 'candidate.json');
    if (fs.existsSync(storagePath)) {
      const stats = fs.statSync(storagePath);
      const ageMs = Date.now() - stats.mtimeMs;
      if (ageMs < 60 * 60 * 1000) {
        console.log(`  ⏭ Reusing auth state for: candidate (${Math.round(ageMs / 60000)}m old)`);
      } else {
        await authenticateUser(CANDIDATE_URL, candidateUser.email, candidateUser.password, storagePath);
      }
    } else {
      await authenticateUser(CANDIDATE_URL, candidateUser.email, candidateUser.password, storagePath);
    }
  }

  console.log('\n=== Setup Complete ===\n');
}

export default globalSetup;
