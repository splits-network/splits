/**
 * Global setup — runs before all test suites.
 * Just ensures the .auth directory exists for storageState files.
 * Actual authentication happens in onboarding test specs.
 */

import { type FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const AUTH_DIR = path.join(__dirname, '.auth');

async function globalSetup(config: FullConfig) {
  console.log('\n=== E2E Global Setup ===\n');
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  console.log('  Auth directory ready:', AUTH_DIR);
  console.log('\n=== Setup Complete ===\n');
}

export default globalSetup;
