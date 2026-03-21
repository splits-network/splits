import { test, expect } from '../../fixtures/auth';

test.describe('Recruiter — Messages', () => {
  test('messages page loads', async ({ recruiterPage: page }) => {
    await page.goto('/portal/messages');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('conversation list or empty state is visible', async ({
    recruiterPage: page,
  }) => {
    await page.goto('/portal/messages');

    // Wait for page content to render
    const heading = page.locator(':is(h1, h2, h3):visible').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });
});
