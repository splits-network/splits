import { test, expect } from '../../fixtures/auth';

test.describe('Platform Admin — Dashboard', () => {
  test('admin dashboard loads', async ({ platformAdminPage: page }) => {
    await page.goto('/portal/admin');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
    await expect(page.locator('body')).not.toContainText(/something went wrong/i);

    const heading = page.locator('h1, h2, [data-testid="page-title"]').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
  });

  test('admin-specific sidebar sections are visible', async ({
    platformAdminPage: page,
  }) => {
    await page.goto('/portal/admin');

    const sidebar = page.locator('nav, aside, [data-testid="sidebar"], .drawer-side');
    await expect(sidebar.first()).toBeVisible({ timeout: 10_000 });

    const expectedSections = [
      'Activity',
      'Applications',
      'Users',
      'Companies',
      'Payouts',
    ];

    for (const section of expectedSections) {
      const navLink = sidebar.getByText(section, { exact: false }).first();
      await expect(navLink).toBeVisible({ timeout: 10_000 });
    }
  });

  test('metrics/KPIs section is present', async ({
    platformAdminPage: page,
  }) => {
    await page.goto('/portal/admin');
    await page.waitForLoadState('networkidle');

    // Look for metrics, stats, or KPI indicators
    const metricsSection = page.locator(
      '[data-testid="metrics"], [data-testid="kpis"], ' +
      '[data-testid="stats"], .stats, .metrics, ' +
      '[class*="metric"], [class*="kpi"], [class*="stat"]'
    );

    const kpiText = page.getByText(
      /total|revenue|active|placements|users|applications|recruiters/i
    ).first();

    const hasMetrics = await metricsSection.first().isVisible().catch(() => false);
    const hasKpiText = await kpiText.isVisible().catch(() => false);

    expect(hasMetrics || hasKpiText).toBeTruthy();
  });
});
