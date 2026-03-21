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

    // Wait for page content to render
    const heading = page.locator(':is(h1, h2, h3):visible').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('decision log loads', async ({ platformAdminPage: page }) => {
    await page.goto('/portal/admin/decision-log');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
    await expect(page.locator('body')).not.toContainText(/something went wrong/i);

    // Wait for page content to render
    const heading = page.locator(':is(h1, h2, h3):visible').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });
});
