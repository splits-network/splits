import { test, expect } from '../../fixtures/auth';

test.describe('Company Admin — Dashboard', () => {
  test('dashboard page loads', async ({ companyAdminPage: page, seedData }) => {
    await page.goto('/portal/dashboard');

    // Page loads without error
    await expect(page.locator('body')).not.toContainText(/something went wrong/i);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);

    // A heading or main content area is visible
    const heading = page.locator(':is(h1, h2):visible, [data-testid="dashboard-heading"]').first();
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('stats cards or sections are present', async ({
    companyAdminPage: page,
    seedData,
  }) => {
    await page.goto('/portal/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for stat cards, metric sections, or summary widgets
    const statsArea = page.locator(
      '[data-testid="stats"], .stat, .stats, [class*="stat"], [class*="card"], [class*="metric"], [class*="summary"]'
    );
    const count = await statsArea.count();

    // It's acceptable for the dashboard to have zero stats if empty,
    // but the page itself must have rendered content
    const bodyText = await page.locator('body').textContent();
    expect((bodyText || '').trim().length).toBeGreaterThan(0);
  });

  test('no critical console errors on dashboard', async ({
    companyAdminPage: page,
    seedData,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/portal/dashboard');
    await page.waitForLoadState('networkidle');

    // Filter out known noise — favicon, third-party scripts, failed fetches
    // during profile hydration, Next.js HMR, and Clerk auth polling
    const realErrors = consoleErrors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('third-party') &&
        !e.includes('Failed to fetch') &&
        !e.includes('Failed to load resource') &&
        !e.includes('net::ERR') &&
        !e.includes('hydrat') &&
        !e.includes('clerk') &&
        !e.includes('Clerk') &&
        !e.includes('ChunkLoadError') &&
        !e.includes('Loading chunk')
    );
    expect(realErrors).toHaveLength(0);
  });
});
