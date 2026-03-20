import { test, expect } from '../../fixtures/auth';

test.describe('Platform Admin — Payout Administration', () => {
  test('payout overview loads', async ({ platformAdminPage: page }) => {
    await page.goto('/portal/admin/payouts');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
    await expect(page.locator('body')).not.toContainText(/something went wrong/i);

    const heading = page.locator('h1, h2, [data-testid="page-title"]').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
  });

  test('payout schedules listed', async ({ platformAdminPage: page }) => {
    await page.goto('/portal/admin/payouts/schedules');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
    await expect(page.locator('body')).not.toContainText(/something went wrong/i);

    const content = page.locator(
      'table, .card, [data-testid="schedule-list"], .grid'
    );
    const emptyState = page.getByText(/no schedules|no results|no payouts|none/i);

    const hasContent = await content.first().isVisible().catch(() => false);
    const isEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasContent || isEmpty).toBeTruthy();
  });

  test('escrow holds listed', async ({ platformAdminPage: page }) => {
    await page.goto('/portal/admin/payouts/escrow');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
    await expect(page.locator('body')).not.toContainText(/something went wrong/i);

    const content = page.locator(
      'table, .card, [data-testid="escrow-list"], .grid'
    );
    const emptyState = page.getByText(/no escrow|no holds|no results|none/i);

    const hasContent = await content.first().isVisible().catch(() => false);
    const isEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasContent || isEmpty).toBeTruthy();
  });

  test('audit log loads', async ({ platformAdminPage: page }) => {
    await page.goto('/portal/admin/payouts/audit');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
    await expect(page.locator('body')).not.toContainText(/something went wrong/i);

    const content = page.locator(
      'table, .card, [data-testid="audit-log"], .grid, .timeline'
    );
    const emptyState = page.getByText(/no entries|no results|no audit|none/i);

    const hasContent = await content.first().isVisible().catch(() => false);
    const isEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasContent || isEmpty).toBeTruthy();
  });
});
