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

    const conversations = page.locator(
      '[data-testid="conversation-list"], [data-testid="message-list"], ' +
      '.card, table, li'
    );
    const emptyState = page.getByText(
      /no messages|no conversations|start a conversation|inbox is empty/i
    );

    const hasConversations = await conversations.first().isVisible().catch(() => false);
    const isEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasConversations || isEmpty).toBeTruthy();
  });
});
