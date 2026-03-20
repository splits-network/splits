import { test, expect } from '../../fixtures/auth';

test.describe('Recruiter — Firms', () => {
  test('firms page loads', async ({ recruiterPage: page }) => {
    await page.goto('/portal/firms');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);
  });

  test('firms list or empty state is visible', async ({ recruiterPage: page }) => {
    await page.goto('/portal/firms');

    const content = page.locator(
      'table, .card, [data-testid="firm-list"], .grid'
    );
    const emptyState = page.getByText(/no firms|create.*firm|get started/i);

    const hasContent = await content.first().isVisible().catch(() => false);
    const isEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasContent || isEmpty).toBeTruthy();
  });

  test('create firm flow is accessible if applicable', async ({
    recruiterPage: page,
  }) => {
    await page.goto('/portal/firms');

    const createButton = page.locator(
      'button:has-text("Create"), button:has-text("New Firm"), ' +
      'a:has-text("Create"), a:has-text("New Firm")'
    ).first();

    if (await createButton.isVisible().catch(() => false)) {
      await createButton.click();
      await page.waitForTimeout(500);
      // Should open a modal or navigate to a creation form
      await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);
    }
  });
});
