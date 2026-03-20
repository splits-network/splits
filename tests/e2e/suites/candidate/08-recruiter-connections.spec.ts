import { test, expect } from '../../fixtures/auth';

test.describe('Candidate — Recruiter Connections', () => {
  test('recruiters page loads', async ({ candidatePage: page }) => {
    await page.goto('/portal/recruiters');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('connected recruiters list or empty state is visible', async ({
    candidatePage: page,
  }) => {
    await page.goto('/portal/recruiters');

    // Wait for page content to render
    const heading = page.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });
});
