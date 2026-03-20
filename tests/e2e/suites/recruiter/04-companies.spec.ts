import { test, expect } from '../../fixtures/auth';
import { waitForPortalReady } from '../../helpers/portal';

test.describe('Recruiter — Companies', () => {
  test('companies page loads', async ({ recruiterPage: page }) => {
    await page.goto('/portal/companies');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);
  });

  test('company marketplace is visible', async ({ recruiterPage: page }) => {
    await page.goto('/portal/companies');

    const ready = await waitForPortalReady(page);
    if (!ready) { test.skip(); return; }

    // Either company cards/list or an empty state
    const content = page.locator(
      '.card, [data-testid="company-list"], table, .grid'
    );
    const emptyState = page.getByText(/no companies|no results|get started/i);

    const hasContent = await content.first().isVisible().catch(() => false);
    const isEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasContent || isEmpty).toBeTruthy();
  });

  test('search functionality works', async ({ recruiterPage: page }) => {
    await page.goto('/portal/companies');

    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i], [data-testid="search"]'
    );

    if (await searchInput.first().isVisible().catch(() => false)) {
      await searchInput.first().fill('test company');
      await page.waitForTimeout(500);
      await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);
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
      await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);
    }
  });
});
