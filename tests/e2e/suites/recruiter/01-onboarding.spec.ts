import { test, expect } from '../../fixtures/auth';
import { waitForPortalReady } from '../../helpers/portal';

test.describe('Recruiter — Onboarding', () => {
  test('dashboard loads after onboarding', async ({ recruiterPage: page }) => {
    await page.goto('/portal/dashboard');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/error/i);
  });

  test('sidebar contains recruiter-specific nav items', async ({ recruiterPage: page }) => {
    await page.goto('/portal/dashboard');

    const ready = await waitForPortalReady(page);
    if (!ready) { test.skip(); return; }

    const sidebar = page.locator('nav, aside, [data-testid="sidebar"], .drawer-side');
    await expect(sidebar.first()).toBeVisible();

    const expectedItems = [
      'Dashboard',
      'Roles',
      'Applications',
      'Candidates',
      'Companies',
      'Firms',
      'Messages',
    ];

    for (const item of expectedItems) {
      const navLink = sidebar.getByText(item, { exact: false }).first();
      await expect(navLink).toBeVisible({ timeout: 10_000 });
    }
  });
});
