/**
 * E2E Test Seed Script
 *
 * Creates Clerk test users and seeds the database with test data
 * for all 5 user roles + a second recruiter for multi-recruiter tests.
 *
 * Usage: pnpm tsx scripts/e2e-seed.ts
 *
 * Prerequisites:
 *   - SPLITS_CLERK_SECRET_KEY set in environment (portal Clerk app)
 *   - APP_CLERK_SECRET_KEY set for candidate Clerk app
 *   - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY set
 *
 * Output: tests/e2e/.auth/seed-data.json
 */

import { createClerkClient } from '@clerk/backend';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env from root .env
import 'dotenv/config';

const SPLITS_CLERK_SECRET_KEY = process.env.SPLITS_CLERK_SECRET_KEY!;
const APP_CLERK_SECRET_KEY = process.env.APP_CLERK_SECRET_KEY!;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OUTPUT_DIR = path.join(__dirname, '..', 'tests', 'e2e', '.auth');

if (!SPLITS_CLERK_SECRET_KEY) {
  console.error('ERROR: SPLITS_CLERK_SECRET_KEY is required (portal Clerk app)');
  process.exit(1);
}
if (!APP_CLERK_SECRET_KEY) {
  console.error('ERROR: APP_CLERK_SECRET_KEY is required (candidate Clerk app)');
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

// Clerk clients
const portalClerk = createClerkClient({ secretKey: SPLITS_CLERK_SECRET_KEY });
const candidateClerk = createClerkClient({ secretKey: APP_CLERK_SECRET_KEY });

// Supabase client (service role bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: 'public' },
});

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

async function findOrCreateClerkUser(
  key: string,
  config: (typeof TEST_USERS)[keyof typeof TEST_USERS]
) {
  const clerk = getClerkClient(key);
  console.log(`  Creating/finding Clerk user: ${config.email} (${CANDIDATE_ROLES.has(key) ? 'candidate' : 'portal'} instance)`);

  const existing = await clerk.users.getUserList({
    emailAddress: [config.email],
  });

  if (existing.data.length > 0) {
    console.log(`  → Found existing user: ${existing.data[0].id}`);
    return existing.data[0];
  }

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

/**
 * Create or find a user record in the database (users table).
 * This is what the Clerk webhook would normally do.
 */
async function ensureDbUser(clerkUserId: string, email: string, name: string): Promise<string> {
  // Check if user already exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle();

  if (existing) {
    // Update onboarding to completed if not already
    await supabase
      .from('users')
      .update({ onboarding_status: 'completed', onboarding_completed_at: new Date().toISOString() })
      .eq('id', existing.id);
    console.log(`  → Found existing DB user: ${existing.id}`);
    return existing.id;
  }

  const { data, error } = await supabase
    .from('users')
    .insert({
      clerk_user_id: clerkUserId,
      email,
      name,
      onboarding_status: 'completed',
      onboarding_completed_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create DB user: ${error.message}`);
  console.log(`  → Created DB user: ${data.id}`);
  return data.id;
}

/**
 * Create or find a recruiter record and user_role.
 */
async function ensureRecruiter(userId: string, email: string, displayName: string): Promise<string> {
  const { data: existing } = await supabase
    .from('recruiters')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    console.log(`  → Found existing recruiter: ${existing.id}`);
    return existing.id;
  }

  const { data, error } = await supabase
    .from('recruiters')
    .insert({
      user_id: userId,
      email,
      display_name: displayName,
      verification_status: 'verified',
      subscription_tier: 'starter',
    })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create recruiter: ${error.message}`);

  // Create user_role
  await supabase.from('user_roles').insert({
    user_id: userId,
    role_name: 'recruiter',
    role_entity_id: data.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).then(({ error }) => {
    if (error && error.code !== '23505') throw error; // Ignore duplicate
  });

  console.log(`  → Created recruiter: ${data.id}`);
  return data.id;
}

/**
 * Create or find a company.
 */
async function ensureCompany(name: string): Promise<string> {
  const { data: existing } = await supabase
    .from('companies')
    .select('id')
    .eq('name', name)
    .maybeSingle();

  if (existing) {
    console.log(`  → Found existing company: ${existing.id}`);
    return existing.id;
  }

  const { data, error } = await supabase
    .from('companies')
    .insert({ name, status: 'active' })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create company: ${error.message}`);
  console.log(`  → Created company: ${data.id}`);
  return data.id;
}

/**
 * Create or find an organization and link it to a company.
 */
async function ensureOrganization(companyId: string, name: string): Promise<string> {
  const { data: existing } = await supabase
    .from('organizations')
    .select('id')
    .eq('company_id', companyId)
    .maybeSingle();

  if (existing) {
    console.log(`  → Found existing organization: ${existing.id}`);
    return existing.id;
  }

  const { data, error } = await supabase
    .from('organizations')
    .insert({ company_id: companyId, name })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create organization: ${error.message}`);
  console.log(`  → Created organization: ${data.id}`);
  return data.id;
}

/**
 * Create a membership linking a user to an organization with a role.
 */
async function ensureMembership(userId: string, organizationId: string, roleName: string): Promise<void> {
  const { data: existing } = await supabase
    .from('memberships')
    .select('id')
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (existing) {
    console.log(`  → Found existing membership: ${existing.id}`);
    return;
  }

  const { error } = await supabase
    .from('memberships')
    .insert({
      user_id: userId,
      organization_id: organizationId,
      role_name: roleName,
      status: 'active',
    });

  if (error && error.code !== '23505') throw new Error(`Failed to create membership: ${error.message}`);
  console.log(`  → Created membership (${roleName})`);
}

/**
 * Create a user_role entry.
 */
async function ensureUserRole(userId: string, roleName: string, entityId: string): Promise<void> {
  const { error } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role_name: roleName,
      role_entity_id: entityId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (error && error.code !== '23505') throw new Error(`Failed to create user_role: ${error.message}`);
}

/**
 * Create or find a candidate record and user_role.
 */
async function ensureCandidate(userId: string, email: string, fullName: string): Promise<string> {
  const { data: existing } = await supabase
    .from('candidates')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    console.log(`  → Found existing candidate: ${existing.id}`);
    return existing.id;
  }

  const { data, error } = await supabase
    .from('candidates')
    .insert({
      user_id: userId,
      email,
      full_name: fullName,
      verification_status: 'unverified',
    })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create candidate: ${error.message}`);

  // Create user_role
  await ensureUserRole(userId, 'candidate', data.id);

  console.log(`  → Created candidate: ${data.id}`);
  return data.id;
}

/**
 * Mark a user as platform admin.
 */
async function ensurePlatformAdmin(userId: string): Promise<void> {
  await supabase
    .from('users')
    .update({ is_platform_admin: true })
    .eq('id', userId);
  console.log(`  → Marked as platform admin`);
}

async function main() {
  console.log('=== E2E Test Seed Script ===\n');

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Step 1: Create Clerk users
  console.log('Step 1: Creating Clerk users...');
  const clerkUsers: Record<string, any> = {};
  for (const [key, config] of Object.entries(TEST_USERS)) {
    clerkUsers[key] = await findOrCreateClerkUser(key, config);
  }

  // Step 2: Create database records
  console.log('\nStep 2: Creating database records...');

  // 2a. Create DB users for all roles
  console.log('\n  --- Users ---');
  const dbUserIds: Record<string, string> = {};
  for (const [key, config] of Object.entries(TEST_USERS)) {
    const name = `${config.firstName} ${config.lastName}`;
    dbUserIds[key] = await ensureDbUser(clerkUsers[key].id, config.email, name);
  }

  // 2b. Create company + organization
  console.log('\n  --- Company ---');
  const companyId = await ensureCompany('E2E Test Company');
  const orgId = await ensureOrganization(companyId, 'E2E Test Company');

  // 2c. Create recruiter profiles
  console.log('\n  --- Recruiters ---');
  const recruiterId = await ensureRecruiter(
    dbUserIds.recruiter,
    TEST_USERS.recruiter.email,
    'Test Recruiter'
  );
  const secondRecruiterId = await ensureRecruiter(
    dbUserIds.second_recruiter,
    TEST_USERS.second_recruiter.email,
    'Test RecruiterTwo'
  );

  // 2d. Create company admin membership
  console.log('\n  --- Company Admin ---');
  await ensureMembership(dbUserIds.company_admin, orgId, 'company_admin');
  await ensureUserRole(dbUserIds.company_admin, 'company_admin', orgId);

  // 2e. Create hiring manager membership
  console.log('\n  --- Hiring Manager ---');
  await ensureMembership(dbUserIds.hiring_manager, orgId, 'hiring_manager');
  await ensureUserRole(dbUserIds.hiring_manager, 'hiring_manager', orgId);

  // 2f. Create candidate profile
  console.log('\n  --- Candidate ---');
  const candidateId = await ensureCandidate(
    dbUserIds.candidate,
    TEST_USERS.candidate.email,
    'Test Candidate'
  );

  // 2g. Mark platform admin
  console.log('\n  --- Platform Admin ---');
  await ensurePlatformAdmin(dbUserIds.platform_admin);

  // Step 3: Write seed data
  console.log('\nStep 3: Writing seed data...');
  const seedData = {
    users: Object.fromEntries(
      Object.entries(TEST_USERS).map(([key, config]) => [
        key,
        {
          clerkUserId: clerkUsers[key].id,
          dbUserId: dbUserIds[key],
          email: config.email,
          password: config.password,
          firstName: config.firstName,
          lastName: config.lastName,
        },
      ])
    ),
    company: { id: companyId, name: 'E2E Test Company', organizationId: orgId },
    recruiters: {
      primary: { id: recruiterId, userId: dbUserIds.recruiter },
      secondary: { id: secondRecruiterId, userId: dbUserIds.second_recruiter },
    },
    candidate: { id: candidateId, userId: dbUserIds.candidate },
    portal_url: 'http://localhost:3100',
    candidate_url: 'http://localhost:3101',
    corporate_url: 'http://localhost:3102',
  };

  const outputPath = path.join(OUTPUT_DIR, 'seed-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(seedData, null, 2));
  console.log(`\nSeed data written to: ${outputPath}`);

  console.log('\n=== Seed Complete ===');
  console.log('\nAll users have database profiles with onboarding completed.');
  console.log('\nNext steps:');
  console.log('  1. Start the dev servers: pnpm dev');
  console.log('  2. Run: pnpm e2e');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
