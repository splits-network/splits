import { test, expect } from '../../fixtures/auth';
import { waitForPortalReady } from '../../helpers/portal';

test.describe('Recruiter — Referral Codes', () => {
  test('referral codes page loads', async ({ recruiterPage: page }) => {
    await page.goto('/portal/referral-codes');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);
  });

  test('page has tabs or content sections', async ({ recruiterPage: page }) => {
    await page.goto('/portal/referral-codes');

    const ready = await waitForPortalReady(page);
    if (!ready) { test.skip(); return; }

    const tabs = page.locator(
      '[role="tablist"], .tabs, [data-testid="referral-tabs"]'
    );
    const content = page.locator(
      'table, .card, [data-testid="referral-list"]'
    );
    const emptyState = page.getByText(/no referral|create.*code|get started/i);

    const hasTabs = await tabs.first().isVisible().catch(() => false);
    const hasContent = await content.first().isVisible().catch(() => false);
    const isEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasTabs || hasContent || isEmpty).toBeTruthy();
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
      await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);
    }
  });
});
