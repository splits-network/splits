import { test, expect } from '../../fixtures/auth';

test.describe('Candidate — Documents', () => {
  test('documents page loads', async ({ candidatePage: page }) => {
    await page.goto('/portal/documents');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);
  });

  test('document list or empty state is visible', async ({ candidatePage: page }) => {
    await page.goto('/portal/documents');

    const list = page.locator(
      'table, [data-testid="document-list"], .grid, .card, ' +
      '[data-testid="documents"]'
    );
    const emptyState = page.getByText(
      /no documents|no files|upload your|get started|no results/i
    );

    const hasItems = await list.first().isVisible().catch(() => false);
    const isEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasItems || isEmpty).toBeTruthy();
  });

  test('upload button or area exists', async ({ candidatePage: page }) => {
    await page.goto('/portal/documents');

    const uploadTrigger = page.locator(
      'button:has-text("Upload"), button:has-text("Add"), ' +
      'input[type="file"], [data-testid="upload-button"], ' +
      '[data-testid="upload-area"], .dropzone, ' +
      'label:has-text("Upload"), a:has-text("Upload")'
    );

    const hasUpload = await uploadTrigger.first().isVisible().catch(() => false);

    // Upload capability should exist on the documents page
    expect(hasUpload).toBeTruthy();
  });
});
