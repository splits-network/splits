import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../../fixtures/test-users';
import { signInAndWait, saveAuthState, dismissCookieBanner, captureConsoleErrors } from '../../helpers/auth';

const user = TEST_USERS.second_recruiter;

test.describe('Onboarding — Second Recruiter', () => {
  test('complete second recruiter onboarding wizard', async ({ page }) => {
    test.setTimeout(180_000);

    const getErrors = captureConsoleErrors(page);

    let url: string;
    try {
      url = await signInAndWait(page, user.email, user.password);
    } catch {
      await page.goto('/portal/dashboard', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      url = page.url();
      if (url.includes('/sign-in')) {
        test.skip(true, 'Second recruiter sign-in failed');
        return;
      }
    }

    // Dismiss cookie banner before any interactions
    await dismissCookieBanner(page);

    // If landed on portal, verify onboarding is complete
    if (url.includes('/portal') && !url.includes('/onboarding')) {
      await page.goto('/portal/roles', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      url = page.url();

      if (!url.includes('/onboarding')) {
        console.log('  Second recruiter already onboarded, saving auth state');
        await saveAuthState(page, 'second_recruiter');
        return;
      }
    }

    // Wait for onboarding page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Dismiss cookie banner again (may appear after navigation)
    await dismissCookieBanner(page);

    // ── Handle whichever step we land on ──

    // Step 1: Role Selection
    const recruiterCard = page.getByText('I am a Recruiter');
    if (await recruiterCard.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await recruiterCard.click();
      console.log('  Selected "I am a Recruiter"');
      await page.waitForTimeout(3000);
    }

    // Step 2: Plan Selection
    const planHeading = page.getByText('Choose Your Plan');
    if (await planHeading.isVisible({ timeout: 10_000 }).catch(() => false)) {
      const getStartedBtn = page.locator('button:has-text("Get Started")').first();
      await expect(getStartedBtn).toBeVisible({ timeout: 10_000 });
      await getStartedBtn.click();
      console.log('  Selected Starter plan');
      await page.waitForTimeout(3000);
    }

    // Step 3: Recruiter Profile
    const profileHeading = page.getByText('Build your profile');
    if (await profileHeading.isVisible({ timeout: 10_000 }).catch(() => false)) {
      const phoneInput = page.locator('input[type="tel"]');
      if (await phoneInput.isVisible().catch(() => false)) {
        const currentPhone = await phoneInput.inputValue();
        if (!currentPhone) {
          await phoneInput.fill('+1 (555) 222-3333');
        }
      }

      const locationInput = page.locator('input[placeholder="e.g., New York, NY"]');
      if (await locationInput.isVisible().catch(() => false)) {
        await locationInput.fill('Chicago, IL');
      }

      await page.getByRole('button', { name: 'Continue' }).click();
      console.log('  Filled second recruiter profile');
      await page.waitForTimeout(3000);
    }

    // Step 4: Review & Launch
    const reviewHeading = page.getByText('Review & Launch');
    if (await reviewHeading.isVisible({ timeout: 10_000 }).catch(() => false)) {
      console.log('  On Review & Launch page');

      // Set up response listener for the onboarding API call
      const responsePromise = page.waitForResponse(
        resp => resp.url().includes('/onboarding/recruiter') && resp.request().method() === 'POST',
        { timeout: 30_000 }
      ).catch(() => null);

      const launchBtn = page.locator('button.btn-primary.btn-lg').filter({ hasText: /Launch/i });
      await expect(launchBtn).toBeVisible({ timeout: 10_000 });
      await launchBtn.click();
      console.log('  Clicked Launch');

      // Wait for the API response
      const response = await responsePromise;
      if (response) {
        const status = response.status();
        console.log(`  Onboarding API response: ${status}`);
        if (status >= 400) {
          const body = await response.text().catch(() => 'Could not read body');
          console.log(`  API error body: ${body}`);
        }
      } else {
        console.log('  WARNING: No onboarding API response captured');
      }

      await page.waitForTimeout(5000);
    }

    // Step 5: Success
    await page.getByText('You are all set!').or(page.getByText('Browse Open Roles'))
      .waitFor({ timeout: 30_000 }).catch(() => {
        console.log('  No success message — may have auto-redirected');
      });

    // Navigate to dashboard with retry
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.goto('/portal/dashboard', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(3000);

      if (!page.url().includes('/onboarding')) break;
      console.log(`  Dashboard redirect attempt ${attempt + 1} — still on onboarding, retrying...`);
      await page.waitForTimeout(2000);
    }

    if (page.url().includes('/onboarding')) {
      await page.screenshot({ path: 'tests/e2e/.auth/second-recruiter-onboarding-stuck.png' });
      const errors = getErrors();
      if (errors.length > 0) {
        console.log(`  Console errors:\n    ${errors.slice(0, 3).join('\n    ')}`);
      }
    }

    expect(page.url()).not.toContain('/onboarding');
    console.log('  Second recruiter onboarding complete');

    await saveAuthState(page, 'second_recruiter');
  });
});
