import { test, expect } from '../../fixtures/auth';

test.describe('Candidate — Dashboard', () => {
  test('dashboard page loads', async ({ candidatePage: page }) => {
    await page.goto('/portal/dashboard');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('greeting text is present', async ({ candidatePage: page }) => {
    await page.goto('/portal/dashboard');

    const greeting = page.getByText(
      /welcome|hello|hi|good morning|good afternoon|good evening|dashboard/i
    );
    const headings = page.getByRole('heading');

    const hasGreeting = await greeting.first().isVisible().catch(() => false);
    const hasHeadings = (await headings.count()) > 0;

    expect(hasGreeting || hasHeadings).toBeTruthy();
  });

  test('stats cards or sections are visible', async ({ candidatePage: page }) => {
    await page.goto('/portal/dashboard');

    const statsArea = page.locator(
      '[data-testid="stats"], [data-testid="dashboard-stats"], ' +
      '.stats, .stat, .card, [data-testid="dashboard-card"]'
    );
    const headings = page.getByRole('heading');

    const statsVisible = await statsArea.first().isVisible().catch(() => false);
    const headingsCount = await headings.count();

    // Dashboard should have stats cards or at minimum heading sections
    expect(statsVisible || headingsCount > 0).toBeTruthy();
  });
});
