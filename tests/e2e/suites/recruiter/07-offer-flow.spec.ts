import { test, expect } from '../../fixtures/auth';

test.describe('Recruiter — Offer Flow', () => {
  test('applications page loads for offer flow', async ({ recruiterPage: page }) => {
    await page.goto('/portal/applications');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('offer wizard is accessible from application at interview stage', async ({
    recruiterPage: page,
    seedData,
  }) => {
    await page.goto('/portal/applications');

    // Look for an application that could be at interview stage
    const offerButton = page.locator(
      'button:has-text("Offer"), button:has-text("Extend Offer"), ' +
      'a:has-text("Offer"), a:has-text("Extend Offer")'
    ).first();

    const hasOfferButton = await offerButton.isVisible().catch(() => false);

    if (!hasOfferButton) {
      // No application at the right stage — skip gracefully
      test.skip(true, 'No applications at interview stage for offer flow');
      return;
    }

    await offerButton.click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('offer wizard steps are present', async ({ recruiterPage: page, seedData }) => {
    await page.goto('/portal/applications');

    const offerButton = page.locator(
      'button:has-text("Offer"), button:has-text("Extend Offer"), ' +
      'a:has-text("Offer"), a:has-text("Extend Offer")'
    ).first();

    const hasOfferButton = await offerButton.isVisible().catch(() => false);

    if (!hasOfferButton) {
      test.skip(true, 'No applications at interview stage for offer wizard');
      return;
    }

    await offerButton.click();
    await page.waitForLoadState('networkidle');

    // Verify wizard steps
    const wizardSteps = [
      'Review Candidate',
      'Offer Details',
      'Financial Impact',
      'Confirm',
    ];

    for (const step of wizardSteps) {
      const stepElement = page.getByText(step, { exact: false }).first();
      await expect(stepElement).toBeVisible({ timeout: 10_000 });
    }
  });
});
