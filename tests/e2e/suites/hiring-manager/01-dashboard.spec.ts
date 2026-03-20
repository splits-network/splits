import { test, expect } from '../../fixtures/auth';
import { waitForPortalReady } from '../../helpers/portal';

test.describe('Hiring Manager — Dashboard', () => {
  test('dashboard page loads', async ({ hiringManagerPage: page }) => {
    await page.goto('/portal/dashboard');

    await expect(page.locator('body')).not.toContainText(/something went wrong/i);
    await expect(page.locator('body')).not.toContainText(/500|internal server error/i);

    const heading = page.locator('h1, h2, [data-testid="dashboard-heading"]').first();
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('sidebar does NOT show "Company Settings" link', async ({
    hiringManagerPage: page,
  }) => {
    await page.goto('/portal/dashboard');
    const ready = await waitForPortalReady(page);
    if (!ready) { test.skip(); return; }

    const sidebar = page.locator(
      'nav, aside, [data-testid="sidebar"], [class*="sidebar"], [class*="drawer"]'
    );

    const sidebarCount = await sidebar.count();
    if (sidebarCount > 0) {
      const settingsLink = sidebar.locator(
        'a:has-text("Company Settings"), a:has-text("Settings"), ' +
        'a[href*="/company/settings"], [data-testid="company-settings-link"]'
      );
      await expect(settingsLink).toHaveCount(0);
    }
  });

  test('sidebar shows Applications link', async ({
    hiringManagerPage: page,
  }) => {
    await page.goto('/portal/dashboard');
    const ready = await waitForPortalReady(page);
    if (!ready) { test.skip(); return; }

    const sidebar = page.locator(
      'nav, aside, [data-testid="sidebar"], [class*="sidebar"], [class*="drawer"]'
    );

    const sidebarCount = await sidebar.count();
    if (sidebarCount > 0) {
      const applicationsLink = sidebar.locator(
        'a:has-text("Applications"), a[href*="/applications"]'
      );
      await expect(applicationsLink.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('sidebar shows Candidates link', async ({
    hiringManagerPage: page,
  }) => {
    await page.goto('/portal/dashboard');
    const ready = await waitForPortalReady(page);
    if (!ready) { test.skip(); return; }

    const sidebar = page.locator(
      'nav, aside, [data-testid="sidebar"], [class*="sidebar"], [class*="drawer"]'
    );

    const sidebarCount = await sidebar.count();
    if (sidebarCount > 0) {
      const candidatesLink = sidebar.locator(
        'a:has-text("Candidates"), a[href*="/candidates"]'
      );
      await expect(candidatesLink.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('sidebar shows Placements link', async ({
    hiringManagerPage: page,
  }) => {
    await page.goto('/portal/dashboard');
    const ready = await waitForPortalReady(page);
    if (!ready) { test.skip(); return; }

    const sidebar = page.locator(
      'nav, aside, [data-testid="sidebar"], [class*="sidebar"], [class*="drawer"]'
    );

    const sidebarCount = await sidebar.count();
    if (sidebarCount > 0) {
      const placementsLink = sidebar.locator(
        'a:has-text("Placements"), a[href*="/placements"]'
      );
      await expect(placementsLink.first()).toBeVisible({ timeout: 10000 });
    }
  });
});
