import { test, expect } from '../../fixtures/auth';

test.describe('Company Admin — Onboarding', () => {
  test('dashboard loads after login (onboarding complete)', async ({
    companyAdminPage: page,
    seedData,
  }) => {
    await page.goto('/portal/dashboard');

    // Dashboard heading should be visible
    const heading = page.locator('h1, h2, [data-testid="dashboard-heading"]').first();
    await expect(heading).toBeVisible({ timeout: 15000 });

    // Page should not show an error state
    await expect(page.locator('body')).not.toContainText(/something went wrong/i);
    await expect(page.locator('body')).not.toContainText(/500|internal server error/i);
  });

  test('sidebar shows company navigation items', async ({
    companyAdminPage: page,
    seedData,
  }) => {
    await page.goto('/portal/dashboard');

    // Wait for sidebar / nav to render
    const nav = page.locator('nav, aside, [data-testid="sidebar"]').first();
    await expect(nav).toBeVisible({ timeout: 15000 });

    // Expect typical company-admin nav links
    const bodyText = await page.locator('body').textContent();
    const hasCompanyNav =
      /dashboard/i.test(bodyText || '') ||
      /roles/i.test(bodyText || '') ||
      /applications/i.test(bodyText || '') ||
      /settings/i.test(bodyText || '');
    expect(hasCompanyNav).toBe(true);
  });
});
