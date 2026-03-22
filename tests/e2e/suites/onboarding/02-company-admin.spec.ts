import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../../fixtures/test-users';
import { signInAndWait, saveAuthState, dismissCookieBanner, captureConsoleErrors } from '../../helpers/auth';

const user = TEST_USERS.company_admin;

test.describe('Onboarding — Company Admin', () => {
  test('complete company admin onboarding wizard', async ({ page }) => {
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
        test.skip(true, 'Company admin sign-in failed');
        return;
      }
    }

    // Dismiss cookie banner before any interactions
    await dismissCookieBanner(page);

    // If landed on portal, verify onboarding is actually complete by checking roles page
    if (url.includes('/portal') && !url.includes('/onboarding')) {
      await page.goto('/portal/roles', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      url = page.url();

      if (!url.includes('/onboarding')) {
        console.log('  Company admin already onboarded, saving auth state');
        await saveAuthState(page, 'company_admin');
        return;
      }
      console.log('  Company admin redirected to onboarding — completing wizard');
    }

    // Wait for onboarding page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Dismiss cookie banner again (may appear after navigation)
    await dismissCookieBanner(page);

    // ── Handle whichever step we land on ──

    // Step 1: Role Selection (if visible)
    const companyCard = page.getByText('I am a Company');
    if (await companyCard.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await companyCard.click();
      console.log('  Selected "I am a Company"');
      await page.waitForTimeout(3000);
    }

    // Step 3 (shown as "Step 2"): Company Info (if visible)
    const companyHeading = page.getByText('Tell us about your company');
    if (await companyHeading.isVisible({ timeout: 10_000 }).catch(() => false)) {
      console.log('  On Company Info step');

      // Company Name (required)
      const nameInput = page.locator('input[placeholder="Acme Corporation"]');
      await expect(nameInput).toBeVisible({ timeout: 5000 });
      await nameInput.fill('E2E Test Company');

      // Website (required)
      await page.locator('input[placeholder="https://www.example.com"]').fill('https://e2e-test.splits.network');

      // Location
      const locationInput = page.locator('input[placeholder="City, Country"]');
      if (await locationInput.isVisible().catch(() => false)) {
        await locationInput.fill('San Francisco, CA');
      }

      // Industry
      const industrySelect = page.locator('select').filter({ hasText: /Select industry/ });
      if (await industrySelect.isVisible().catch(() => false)) {
        await industrySelect.selectOption('technology');
      }

      // Company Size
      const sizeSelect = page.locator('select').filter({ hasText: /Select size/ });
      if (await sizeSelect.isVisible().catch(() => false)) {
        await sizeSelect.selectOption('51-200');
      }

      // Billing Email
      const billingInput = page.locator('input[placeholder="billing@company.com"]');
      if (await billingInput.isVisible().catch(() => false)) {
        await billingInput.fill('billing@e2e-test.splits.network');
      }

      // Submit
      await page.getByRole('button', { name: 'Continue' }).click();
      console.log('  Filled company info');
      await page.waitForTimeout(3000);
    }

    // Step 4 (shown as "Step 3"): Review & Launch (if visible)
    const reviewHeading = page.getByText('Review & Launch');
    if (await reviewHeading.isVisible({ timeout: 10_000 }).catch(() => false)) {
      console.log('  On Review & Launch page');

      // Set up response listener for the onboarding API call
      const responsePromise = page.waitForResponse(
        resp => resp.url().includes('/onboarding/business') && resp.request().method() === 'POST',
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
    await page.getByText('You are all set!').or(page.getByText('Post Your First Role'))
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
      await page.screenshot({ path: 'tests/e2e/.auth/company-admin-onboarding-stuck.png' });
      const errors = getErrors();
      if (errors.length > 0) {
        console.log(`  Console errors:\n    ${errors.slice(0, 3).join('\n    ')}`);
      }
    }
    expect(page.url()).not.toContain('/onboarding');
    console.log('  Company admin onboarding complete');

    await saveAuthState(page, 'company_admin');
  });
});
