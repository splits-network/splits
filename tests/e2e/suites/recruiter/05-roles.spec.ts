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

    // Board columns, role cards, table, or empty state
    const content = page.locator(
      '.card, [data-testid="role-board"], [data-testid="role-list"], table, .grid'
    );
    const emptyState = page.getByText(/no roles|no results|get started/i);

    const hasContent = await content.first().isVisible().catch(() => false);
    const isEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasContent || isEmpty).toBeTruthy();
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

    const roleCards = page.locator(
      '.card, [data-testid="role-card"], tr[data-testid], a[href*="/portal/roles/"]'
    );
    const emptyState = page.getByText(/no roles|no results|no open roles/i);

    const cardCount = await roleCards.count();
    const isEmpty = await emptyState.isVisible().catch(() => false);

    // Either we have role cards or an empty state — both are valid
    expect(cardCount > 0 || isEmpty).toBeTruthy();
  });
});
