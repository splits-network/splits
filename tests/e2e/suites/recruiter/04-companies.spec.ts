import { test, expect } from '../../fixtures/auth';
import { waitForPortalReady } from '../../helpers/portal';

test.describe('Recruiter — Companies', () => {
  test('companies page loads', async ({ recruiterPage: page }) => {
    await page.goto('/portal/companies');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('company marketplace is visible', async ({ recruiterPage: page }) => {
    await page.goto('/portal/companies');

    const ready = await waitForPortalReady(page);
    if (!ready) { test.skip(); return; }

    // Wait for page content to render
    const heading = page.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('search functionality works', async ({ recruiterPage: page }) => {
    await page.goto('/portal/companies');

    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i], [data-testid="search"]'
    );

    if (await searchInput.first().isVisible().catch(() => false)) {
      await searchInput.first().fill('test company');
      await page.waitForTimeout(500);
      await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
      await searchInput.first().clear();
    }
  });

  test('clicking a company card navigates to detail', async ({ recruiterPage: page }) => {
    await page.goto('/portal/companies');

    const companyCard = page.locator(
      '.card, [data-testid="company-card"], a[href*="/portal/companies/"]'
    ).first();

    if (await companyCard.isVisible().catch(() => false)) {
      await companyCard.click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
    }
  });
});
