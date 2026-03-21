import { test, expect } from '../../fixtures/auth';

test.describe('Candidate — Saved Jobs', () => {
  test('saved jobs page loads', async ({ candidatePage: page }) => {
    await page.goto('/portal/jobs/saved');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('saved jobs list or empty state is visible', async ({ candidatePage: page }) => {
    await page.goto('/portal/jobs/saved');

    // Wait for page content to render
    const heading = page.locator(':is(h1, h2, h3):visible').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });
});
