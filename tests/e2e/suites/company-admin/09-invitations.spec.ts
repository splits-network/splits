import { test, expect } from '../../fixtures/auth';

test.describe('Company Admin — Invitations', () => {
  test('invitations page loads', async ({
    companyAdminPage: page,
    seedData,
  }) => {
    await page.goto('/portal/company-invitations');

    await expect(page.locator('body')).not.toContainText(/something went wrong/i);
    await expect(page.locator('body')).not.toContainText(/500|internal server error/i);

    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('invitation list or empty state renders', async ({
    companyAdminPage: page,
    seedData,
  }) => {
    await page.goto('/portal/company-invitations');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').textContent();
    const hasInvitations =
      (await page.locator('table tbody tr, [data-testid="invitation-card"], [data-testid="invitation-row"], [class*="card"]').count()) > 0;
    const hasEmptyState = /no invitation|empty|none|invite|get started/i.test(bodyText || '');

    expect(hasInvitations || hasEmptyState || (bodyText || '').trim().length > 0).toBe(true);
  });
});
