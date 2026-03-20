import { test, expect } from '../../fixtures/auth';

test.describe('Platform Admin — Fraud, Metrics & Activity', () => {
  test('fraud page loads', async ({ platformAdminPage: page }) => {
    await page.goto('/portal/admin/fraud');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
    await expect(page.locator('body')).not.toContainText(/something went wrong/i);

    const heading = page.locator('h1, h2, [data-testid="page-title"]').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
  });

  test('metrics page loads', async ({ platformAdminPage: page }) => {
    await page.goto('/portal/admin/metrics');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
    await expect(page.locator('body')).not.toContainText(/something went wrong/i);

    const heading = page.locator('h1, h2, [data-testid="page-title"]').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
  });

  test('activity page loads', async ({ platformAdminPage: page }) => {
    await page.goto('/portal/admin/activity');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
    await expect(page.locator('body')).not.toContainText(/something went wrong/i);

    const content = page.locator(
      'table, .card, [data-testid="activity-log"], .grid, .timeline'
    );
    const emptyState = page.getByText(/no activity|no results|none/i);

    const hasContent = await content.first().isVisible().catch(() => false);
    const isEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasContent || isEmpty).toBeTruthy();
  });

  test('decision log loads', async ({ platformAdminPage: page }) => {
    await page.goto('/portal/admin/decision-log');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
    await expect(page.locator('body')).not.toContainText(/something went wrong/i);

    const content = page.locator(
      'table, .card, [data-testid="decision-log"], .grid, .timeline'
    );
    const emptyState = page.getByText(/no decisions|no entries|no results|none/i);

    const hasContent = await content.first().isVisible().catch(() => false);
    const isEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasContent || isEmpty).toBeTruthy();
  });
});
