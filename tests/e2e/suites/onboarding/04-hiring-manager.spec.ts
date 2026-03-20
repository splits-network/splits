import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../../fixtures/test-users';
import { signInAndWait, saveAuthState } from '../../helpers/auth';

const user = TEST_USERS.hiring_manager;

test.describe('Onboarding — Hiring Manager', () => {
  test('sign in hiring manager and save auth state', async ({ page }) => {
    // Hiring managers are invited by company admins — they don't go through
    // the standard onboarding wizard. For now, just sign in and save auth state.
    // If they need an invitation flow, that's tested in the company-admin suite.
    const url = await signInAndWait(page, user.email, user.password);

    // If redirected to onboarding, they need to be invited first.
    // For E2E purposes, we sign in and save whatever state we get.
    if (url.includes('/onboarding')) {
      console.log('  Hiring manager redirected to onboarding — completing as recruiter/company admin first');
      // Hiring managers would need an invitation from company admin.
      // For now, skip and let the company-admin test suite handle invitation.
      test.skip(true, 'Hiring manager requires company admin invitation — handled in company-admin suite');
      return;
    }

    // Wait for portal to load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    await saveAuthState(page, 'hiring_manager');
  });
});
