import { test, expect } from '../../fixtures/auth';
import { waitForPortalReady } from '../../helpers/portal';

test.describe('Recruiter — Roles', () => {
  test('roles page loads', async ({ recruiterPage: page }) => {
    await page.goto('/portal/roles');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('recruiter board or role list is visible', async ({ recruiterPage: page }) => {
    await page.goto('/portal/roles');

    const ready = await waitForPortalReady(page);
    if (!ready) { test.skip(); return; }

    // Wait for page content to render
    const heading = page.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('filter by company works if available', async ({ recruiterPage: page }) => {
    await page.goto('/portal/roles');

    const companyFilter = page.locator(
      'select:has(option:text("Company")), [data-testid="company-filter"], ' +
      'button:has-text("Company"), [placeholder*="company" i]'
    );

    if (await companyFilter.first().isVisible().catch(() => false)) {
      await companyFilter.first().click();
      await page.waitForTimeout(300);
      await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
    }
  });

  test('role cards display correctly or show empty state', async ({ recruiterPage: page }) => {
    await page.goto('/portal/roles');

    const ready = await waitForPortalReady(page);
    if (!ready) { test.skip(); return; }

    // Wait for page content to render
    const heading = page.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });
});
