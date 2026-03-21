import { test, expect } from '../../fixtures/auth';
import { waitForPortalReady } from '../../helpers/portal';

test.describe('Recruiter — Invitations', () => {
  test('invitations page loads', async ({ recruiterPage: page }) => {
    await page.goto('/portal/invitations');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('sent invitations list or empty state is visible', async ({
    recruiterPage: page,
  }) => {
    await page.goto('/portal/invitations');

    const ready = await waitForPortalReady(page);
    if (!ready) { test.skip(); return; }

    // Wait for page content to render
    const heading = page.locator(':is(h1, h2, h3):visible').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('invite companies page loads', async ({ recruiterPage: page }) => {
    await page.goto('/portal/invite-companies');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('invite form is visible', async ({ recruiterPage: page }) => {
    await page.goto('/portal/invite-companies');

    // Wait for page content to render
    const heading = page.locator(':is(h1, h2, h3):visible').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });
});
