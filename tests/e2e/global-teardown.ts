/**
 * Global teardown — runs after all test suites.
 * Cleans up test data created during the test run.
 *
 * Note: Clerk users are NOT deleted — they're reusable across runs.
 * Only ephemeral test data (applications, placements, etc.) is cleaned up.
 */

import { type FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('\n=== E2E Global Teardown ===\n');

  // Test data cleanup can be added here as needed.
  // For now, we rely on the seed script creating fresh data each run
  // and the test database being reset between CI runs.

  console.log('  ℹ Teardown complete (no cleanup needed for local dev)');
  console.log('\n=== Teardown Complete ===\n');
}

export default globalTeardown;
