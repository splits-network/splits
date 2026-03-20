/**
 * E2E Test Seed Script
 *
 * Creates Clerk test users only. The Clerk webhook handles creating
 * database user records. Onboarding tests complete the wizard for each
 * role, which creates role-specific records (recruiters, memberships, etc.).
 *
 * Usage: pnpm tsx scripts/e2e-seed.ts
 *
 * Prerequisites:
 *   - SPLITS_CLERK_SECRET_KEY set in environment (portal Clerk app)
 *   - APP_CLERK_SECRET_KEY set for candidate Clerk app
 *   - Clerk webhook configured and working (creates DB user on user.created)
 *
 * Output: tests/e2e/.auth/seed-data.json
 */

import { createClerkClient } from '@clerk/backend';
import fs from 'fs';
import path from 'path';

// Load env from root .env
import 'dotenv/config';

const SPLITS_CLERK_SECRET_KEY = process.env.SPLITS_CLERK_SECRET_KEY!;
const APP_CLERK_SECRET_KEY = process.env.APP_CLERK_SECRET_KEY!;
const OUTPUT_DIR = path.join(__dirname, '..', 'tests', 'e2e', '.auth');

if (!SPLITS_CLERK_SECRET_KEY) {
  console.error('ERROR: SPLITS_CLERK_SECRET_KEY is required (portal Clerk app)');
  process.exit(1);
}
if (!APP_CLERK_SECRET_KEY) {
  console.error('ERROR: APP_CLERK_SECRET_KEY is required (candidate Clerk app)');
  process.exit(1);
}

// Clerk clients
const portalClerk = createClerkClient({ secretKey: SPLITS_CLERK_SECRET_KEY });
const candidateClerk = createClerkClient({ secretKey: APP_CLERK_SECRET_KEY });

// Test user definitions
const TEST_USERS = {
  recruiter: {
    email: 'e2e-recruiter@test.splits.network',
    password: 'E2eTest!Recruiter2024',
    firstName: 'Test',
    lastName: 'Recruiter',
  },
  company_admin: {
    email: 'e2e-company-admin@test.splits.network',
    password: 'E2eTest!CompanyAdmin2024',
    firstName: 'Test',
    lastName: 'CompanyAdmin',
  },
  hiring_manager: {
    email: 'e2e-hiring-manager@test.splits.network',
    password: 'E2eTest!HiringManager2024',
    firstName: 'Test',
    lastName: 'HiringManager',
  },
  candidate: {
    email: 'e2e-candidate@test.splits.network',
    password: 'E2eTest!Candidate2024',
    firstName: 'Test',
    lastName: 'Candidate',
  },
  platform_admin: {
    email: 'e2e-admin@test.splits.network',
    password: 'E2eTest!Admin2024',
    firstName: 'Test',
    lastName: 'Admin',
  },
  second_recruiter: {
    email: 'e2e-recruiter2@test.splits.network',
    password: 'E2eTest!Recruiter2B2024',
    firstName: 'Test',
    lastName: 'RecruiterTwo',
  },
};

const CANDIDATE_ROLES = new Set(['candidate']);

function getClerkClient(role: string) {
  return CANDIDATE_ROLES.has(role) ? candidateClerk : portalClerk;
}

async function deleteClerkUser(key: string, email: string): Promise<void> {
  const clerk = getClerkClient(key);
  const existing = await clerk.users.getUserList({ emailAddress: [email] });

  for (const user of existing.data) {
    await clerk.users.deleteUser(user.id);
    console.log(`  → Deleted existing user: ${user.id} (${email})`);
  }
}

async function createClerkUser(
  key: string,
  config: (typeof TEST_USERS)[keyof typeof TEST_USERS]
) {
  const clerk = getClerkClient(key);
  const instance = CANDIDATE_ROLES.has(key) ? 'candidate' : 'portal';
  console.log(`  Creating Clerk user: ${config.email} (${instance} instance)`);

  const user = await clerk.users.createUser({
    emailAddress: [config.email],
    password: config.password,
    firstName: config.firstName,
    lastName: config.lastName,
    skipPasswordChecks: true,
  });

  console.log(`  → Created user: ${user.id}`);
  return user;
}

async function main() {
  console.log('=== E2E Test Seed Script ===\n');

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Step 1: Delete existing Clerk users (so webhook fires fresh on creation)
  console.log('Step 1: Cleaning up existing Clerk users...');
  for (const [key, config] of Object.entries(TEST_USERS)) {
    await deleteClerkUser(key, config.email);
  }

  // Step 2: Create fresh Clerk users (triggers webhook → creates DB users)
  console.log('\nStep 2: Creating Clerk users...');
  const clerkUsers: Record<string, any> = {};
  for (const [key, config] of Object.entries(TEST_USERS)) {
    clerkUsers[key] = await createClerkUser(key, config);
  }

  // Step 3: Wait for webhooks to process
  console.log('\nStep 3: Waiting 5s for webhooks to create DB records...');
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Step 4: Write seed data (credentials for auth fixtures)
  console.log('\nStep 4: Writing seed data...');
  const seedData = {
    users: Object.fromEntries(
      Object.entries(TEST_USERS).map(([key, config]) => [
        key,
        {
          clerkUserId: clerkUsers[key].id,
          email: config.email,
          password: config.password,
          firstName: config.firstName,
          lastName: config.lastName,
        },
      ])
    ),
    portal_url: 'http://localhost:3100',
    candidate_url: 'http://localhost:3101',
    corporate_url: 'http://localhost:3102',
  };

  const outputPath = path.join(OUTPUT_DIR, 'seed-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(seedData, null, 2));
  console.log(`Seed data written to: ${outputPath}`);

  console.log('\n=== Seed Complete ===');
  console.log('\nClerk users created. Webhooks will create DB user records.');
  console.log('Onboarding tests will complete the wizard for each role.\n');
  console.log('Next steps:');
  console.log('  1. Start the dev servers: pnpm dev');
  console.log('  2. Run: pnpm e2e');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
