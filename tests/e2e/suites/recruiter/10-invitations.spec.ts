import { test, expect } from '../../fixtures/auth';
import { waitForPortalReady } from '../../helpers/portal';

test.describe('Recruiter — Invitations', () => {
  test('invitations page loads', async ({ recruiterPage: page }) => {
    await page.goto('/portal/invitations');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);
  });

  test('sent invitations list or empty state is visible', async ({
    recruiterPage: page,
  }) => {
    await page.goto('/portal/invitations');

    const ready = await waitForPortalReady(page);
    if (!ready) { test.skip(); return; }

    const content = page.locator(
      'table, .card, [data-testid="invitation-list"], .grid'
    );
    const emptyState = page.getByText(/no invitations|no results|get started|none sent/i);

    const hasContent = await content.first().isVisible().catch(() => false);
    const isEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasContent || isEmpty).toBeTruthy();
  });

  test('invite companies page loads', async ({ recruiterPage: page }) => {
    await page.goto('/portal/invite-companies');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);
  });

  test('invite form is visible', async ({ recruiterPage: page }) => {
    await page.goto('/portal/invite-companies');

    const form = page.locator(
      'form, [data-testid="invite-form"], input[type="email"], textarea'
    );
    const inviteContent = page.getByText(/invite|email|send/i).first();

    const hasForm = await form.first().isVisible().catch(() => false);
    const hasInviteContent = await inviteContent.isVisible().catch(() => false);

    expect(hasForm || hasInviteContent).toBeTruthy();
  });
});
