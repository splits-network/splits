import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../../fixtures/test-users';
import { signInAndWait, saveAuthState } from '../../helpers/auth';

const user = TEST_USERS.company_admin;

test.describe('Onboarding — Company Admin', () => {
  test('complete company admin onboarding wizard', async ({ page }) => {
    // Sign in — should redirect to /onboarding for new users
    const url = await signInAndWait(page, user.email, user.password);

    // If already onboarded, save auth state and skip
    if (url.includes('/portal')) {
      console.log('  Company admin already onboarded, saving auth state');
      await saveAuthState(page, 'company_admin');
      return;
    }

    expect(url).toContain('/onboarding');

    // --- Step 1: Role Selection ---
    const companyCard = page.getByText('I am a Company');
    await expect(companyCard).toBeVisible({ timeout: 15_000 });
    await companyCard.click();

    // Company admin skips plan selection → goes directly to company info (Step 3/2)

    // --- Step 2: Company Info ---
    await expect(
      page.getByText('Tell us about your company').or(page.getByText('Step 2'))
    ).toBeVisible({ timeout: 15_000 });

    // Company Name (required)
    await page.locator('input[placeholder*="Acme"]').fill('E2E Test Company');

    // Website (required)
    await page.locator('input[placeholder*="example.com"]').or(
      page.locator('input[type="url"]')
    ).first().fill('https://e2e-test.splits.network');

    // Location (optional)
    const locationInput = page.locator('input[placeholder*="City"]').first();
    if (await locationInput.isVisible().catch(() => false)) {
      await locationInput.fill('San Francisco, CA');
    }

    // Industry (required) — dropdown select
    const industrySelect = page.locator('select').filter({ hasText: /industry|select/i }).first();
    if (await industrySelect.isVisible().catch(() => false)) {
      await industrySelect.selectOption('technology');
    } else {
      // May be a different select element — try by position or label
      const selects = page.locator('select');
      const count = await selects.count();
      if (count >= 1) {
        await selects.nth(0).selectOption('technology');
      }
    }

    // Company Size (required) — dropdown select
    const sizeSelect = page.locator('select').filter({ hasText: /employees|size/i }).first();
    if (await sizeSelect.isVisible().catch(() => false)) {
      await sizeSelect.selectOption('51-200');
    } else {
      const selects = page.locator('select');
      const count = await selects.count();
      if (count >= 2) {
        await selects.nth(1).selectOption('51-200');
      }
    }

    // Billing Terms (required) — dropdown select
    const billingSelect = page.locator('select').filter({ hasText: /billing|net|immediate/i }).first();
    if (await billingSelect.isVisible().catch(() => false)) {
      await billingSelect.selectOption('net_30');
    } else {
      const selects = page.locator('select');
      const count = await selects.count();
      if (count >= 3) {
        await selects.nth(2).selectOption('net_30');
      }
    }

    // Billing Email (required)
    const billingEmail = page.locator('input[placeholder*="billing"]').or(
      page.locator('input[type="email"]').last()
    );
    if (await billingEmail.isVisible().catch(() => false)) {
      await billingEmail.fill('billing@e2e-test.splits.network');
    }

    // Submit company info form
    const continueBtn = page.getByRole('button', { name: /continue|next|save/i }).first();
    await continueBtn.click();

    // --- Step 3: Review & Launch ---
    await expect(page.getByText('Review').or(page.getByText('Step 3').or(page.getByText('Step 4')))).toBeVisible({ timeout: 15_000 });

    const launchBtn = page.getByRole('button', { name: /launch|submit|go live|complete/i }).first();
    await expect(launchBtn).toBeVisible({ timeout: 10_000 });
    await launchBtn.click();

    // --- Success ---
    await expect(
      page.getByText('workspace is created').or(
        page.getByText('Success').or(
          page.getByText('Post Your First Role')
        )
      )
    ).toBeVisible({ timeout: 30_000 });

    // Navigate to dashboard and save auth state
    await page.goto('/portal/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    await saveAuthState(page, 'company_admin');
  });
});
