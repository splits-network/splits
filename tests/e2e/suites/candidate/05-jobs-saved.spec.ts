import { test, expect } from '../../fixtures/auth';

test.describe('Candidate — Saved Jobs', () => {
  test('saved jobs page loads', async ({ candidatePage: page }) => {
    await page.goto('/portal/jobs/saved');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);
  });

  test('saved jobs list or empty state is visible', async ({ candidatePage: page }) => {
    await page.goto('/portal/jobs/saved');

    const list = page.locator(
      'table, [data-testid="saved-jobs"], .grid, .card, ' +
      '[data-testid="job-list"]'
    );
    const emptyState = page.getByText(
      /no saved jobs|no results|save jobs|you haven't saved|no bookmarks/i
    );

    const hasItems = await list.first().isVisible().catch(() => false);
    const isEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasItems || isEmpty).toBeTruthy();
  });
});
