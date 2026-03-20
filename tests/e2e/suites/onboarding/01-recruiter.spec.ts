import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../../fixtures/test-users';
import { signInAndWait, saveAuthState, dismissCookieBanner, captureConsoleErrors } from '../../helpers/auth';

const user = TEST_USERS.recruiter;

test.describe('Onboarding — Recruiter', () => {
  test('complete recruiter onboarding wizard', async ({ page }) => {
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
        await page.screenshot({ path: 'tests/e2e/.auth/recruiter-signin-debug.png' });
        test.skip(true, 'Recruiter sign-in failed');
        return;
      }
    }

    // Dismiss cookie banner before any interactions
    await dismissCookieBanner(page);

    // If landed on portal, verify onboarding is actually complete
    if (url.includes('/portal') && !url.includes('/onboarding')) {
      await page.goto('/portal/roles', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      url = page.url();

      if (!url.includes('/onboarding')) {
        console.log('  Recruiter already onboarded, saving auth state');
        await saveAuthState(page, 'recruiter');
        return;
      }
      console.log('  Recruiter redirected to onboarding — completing wizard');
    }

    // Wait for onboarding page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Dismiss cookie banner again (may appear after navigation)
    await dismissCookieBanner(page);

    // ── Handle whichever step we land on ──

    // Step 1: Role Selection (if visible)
    const recruiterCard = page.getByText('I am a Recruiter');
    if (await recruiterCard.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await recruiterCard.click();
      console.log('  Selected "I am a Recruiter"');
      await page.waitForTimeout(3000);
    }

    // Step 2: Plan Selection (if visible)
    const planHeading = page.getByText('Choose Your Plan');
    if (await planHeading.isVisible({ timeout: 10_000 }).catch(() => false)) {
      const getStartedBtn = page.locator('button:has-text("Get Started")').first();
      await expect(getStartedBtn).toBeVisible({ timeout: 10_000 });
      await getStartedBtn.click();
      console.log('  Selected Starter plan');
      await page.waitForTimeout(3000);
    }

    // Step 3: Recruiter Profile (if visible)
    const profileHeading = page.getByText('Build your profile');
    if (await profileHeading.isVisible({ timeout: 10_000 }).catch(() => false)) {
      // Phone (required)
      const phoneInput = page.locator('input[type="tel"]');
      if (await phoneInput.isVisible().catch(() => false)) {
        const currentPhone = await phoneInput.inputValue();
        if (!currentPhone) {
          await phoneInput.fill('+1 (555) 123-4567');
        }
      }

      // Location
      const locationInput = page.locator('input[placeholder="e.g., New York, NY"]');
      if (await locationInput.isVisible().catch(() => false)) {
        await locationInput.fill('New York, NY');
      }

      // Tagline
      const taglineInput = page.locator('input[placeholder="e.g., Tech Recruiting Expert"]');
      if (await taglineInput.isVisible().catch(() => false)) {
        await taglineInput.fill('E2E Test Tech Recruiter');
      }

      // Years of Experience
      const yearsInput = page.locator('input[placeholder="5"]');
      if (await yearsInput.isVisible().catch(() => false)) {
        await yearsInput.fill('5');
      }

      // Industry chip
      const techChip = page.getByText('Technology', { exact: true }).first();
      if (await techChip.isVisible().catch(() => false)) {
        await techChip.click();
      }

      // Specialty chip
      const engChip = page.getByText('Engineering', { exact: true }).first();
      if (await engChip.isVisible().catch(() => false)) {
        await engChip.click();
      }

      // Submit
      await page.getByRole('button', { name: 'Continue' }).click();
      console.log('  Filled recruiter profile');
      await page.waitForTimeout(3000);
    }

    // Step 4: Review & Launch (if visible)
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

    // Step 5: Success — wait for it or auto-redirect
    await page.getByText('You are all set!').or(page.getByText('Browse Open Roles'))
      .waitFor({ timeout: 30_000 }).catch(() => {
        console.log('  No success message — may have auto-redirected');
      });

    // Hard navigate to dashboard (forces fresh profile fetch)
    await page.evaluate(() => { window.location.href = '/portal/dashboard'; });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    if (page.url().includes('/onboarding')) {
      await page.screenshot({ path: 'tests/e2e/.auth/recruiter-onboarding-stuck.png' });
      const errors = getErrors();
      if (errors.length > 0) {
        console.log(`  Console errors:\n    ${errors.join('\n    ')}`);
      }
      const errorEl = page.locator('text=/failed|error|required/i').first();
      if (await errorEl.isVisible().catch(() => false)) {
        const errorMsg = await errorEl.textContent();
        console.log(`  Onboarding error: ${errorMsg}`);
      }
    }
    expect(page.url()).not.toContain('/onboarding');
    console.log('  Recruiter onboarding complete');

    await saveAuthState(page, 'recruiter');
  });
});
