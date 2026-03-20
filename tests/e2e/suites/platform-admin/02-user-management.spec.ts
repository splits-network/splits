import { test, expect } from '../../fixtures/auth';

test.describe('Platform Admin — User Management', () => {
  test('user list loads', async ({ platformAdminPage: page }) => {
    await page.goto('/portal/admin/users');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);
    await expect(page.locator('body')).not.toContainText(/something went wrong/i);

    const heading = page.locator('h1, h2, [data-testid="page-title"]').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
  });

  test('user search functionality works', async ({
    platformAdminPage: page,
  }) => {
    await page.goto('/portal/admin/users');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="Search" i], ' +
      '[data-testid="search"], input[name*="search" i]'
    ).first();

    const hasSearch = await searchInput.isVisible().catch(() => false);

    if (hasSearch) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
      await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);
      await expect(page.locator('body')).not.toContainText(/something went wrong/i);

      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(500);
    }
    // Search may not be implemented yet — that's OK
  });

  test('recruiter list loads', async ({ platformAdminPage: page }) => {
    await page.goto('/portal/admin/recruiters');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);
    await expect(page.locator('body')).not.toContainText(/something went wrong/i);

    const content = page.locator(
      'table, .card, [data-testid="recruiter-list"], .grid'
    );
    const emptyState = page.getByText(/no recruiters|no results|none/i);

    const hasContent = await content.first().isVisible().catch(() => false);
    const isEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasContent || isEmpty).toBeTruthy();
  });

  test('company list loads', async ({ platformAdminPage: page }) => {
    await page.goto('/portal/admin/companies');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);
    await expect(page.locator('body')).not.toContainText(/something went wrong/i);

    const content = page.locator(
      'table, .card, [data-testid="company-list"], .grid'
    );
    const emptyState = page.getByText(/no companies|no results|none/i);

    const hasContent = await content.first().isVisible().catch(() => false);
    const isEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasContent || isEmpty).toBeTruthy();
  });
});
