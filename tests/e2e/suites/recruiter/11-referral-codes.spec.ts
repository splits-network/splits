import { test, expect } from '../../fixtures/auth';
import { waitForPortalReady } from '../../helpers/portal';

test.describe('Recruiter — Referral Codes', () => {
  test('referral codes page loads', async ({ recruiterPage: page }) => {
    await page.goto('/portal/referral-codes');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('page has tabs or content sections', async ({ recruiterPage: page }) => {
    await page.goto('/portal/referral-codes');

    const ready = await waitForPortalReady(page);
    if (!ready) { test.skip(); return; }

    // Wait for page content to render
    const heading = page.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('create referral code if applicable', async ({ recruiterPage: page }) => {
    await page.goto('/portal/referral-codes');

    const createButton = page.locator(
      'button:has-text("Create"), button:has-text("New"), button:has-text("Generate"), ' +
      'a:has-text("Create"), a:has-text("New Code")'
    ).first();

    if (await createButton.isVisible().catch(() => false)) {
      await createButton.click();
      await page.waitForTimeout(500);
      // Should open a modal or form without errors
      await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
    }
  });
});
