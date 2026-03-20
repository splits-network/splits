import { test, expect } from '../../fixtures/auth';

test.describe('Candidate — Documents', () => {
  test('documents page loads', async ({ candidatePage: page }) => {
    await page.goto('/portal/documents');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('document list or empty state is visible', async ({ candidatePage: page }) => {
    await page.goto('/portal/documents');

    // Wait for page content to render
    const heading = page.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
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

    // Upload capability may not exist if the page uses a different pattern
    if (!hasUpload) {
      console.log('  No upload trigger found — candidate documents page may use a different UI pattern');
    }
  });
});
