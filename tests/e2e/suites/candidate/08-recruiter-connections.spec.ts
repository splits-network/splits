import { test, expect } from '../../fixtures/auth';

test.describe('Candidate — Recruiter Connections', () => {
  test('recruiters page loads', async ({ candidatePage: page }) => {
    await page.goto('/portal/recruiters');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);
  });

  test('connected recruiters list or empty state is visible', async ({
    candidatePage: page,
  }) => {
    await page.goto('/portal/recruiters');

    const list = page.locator(
      'table, [data-testid="recruiter-list"], .grid, .card, ' +
      '[data-testid="connections"]'
    );
    const emptyState = page.getByText(
      /no recruiters|no connections|no results|get started|connect with/i
    );

    const hasItems = await list.first().isVisible().catch(() => false);
    const isEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasItems || isEmpty).toBeTruthy();
  });
});
