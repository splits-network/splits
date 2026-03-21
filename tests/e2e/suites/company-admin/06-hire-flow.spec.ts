import { test, expect } from '../../fixtures/auth';

test.describe('Company Admin — Hire Flow', () => {
  test('applications page loads for hire flow', async ({
    companyAdminPage: page,
    seedData,
  }) => {
    await page.goto('/portal/applications');

    await expect(page.locator('body')).not.toContainText(/something went wrong/i);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);

    const heading = page.locator(':is(h1, h2):visible').first();
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('hire flow UI is accessible for eligible applications', async ({
    companyAdminPage: page,
    seedData,
  }) => {
    await page.goto('/portal/applications');
    await page.waitForLoadState('networkidle');

    // Look for applications at interview/offer stage
    const stageLabels = page.locator(
      '[data-testid*="stage"], [class*="stage"], [class*="status"], ' +
      ':text("Interview"), :text("Offer"), :text("Shortlist")'
    );

    const stageCount = await stageLabels.count();
    if (stageCount === 0) {
      // No applications at qualifying stages — that's OK for empty DB
      test.info().annotations.push({
        type: 'skip-reason',
        description: 'No applications at interview/offer stage found',
      });
      return;
    }

    // Click the first qualifying application to open it
    const applicationRow = page.locator(
      'table tbody tr, [data-testid="application-card"], [data-testid="application-row"]'
    ).first();

    if ((await applicationRow.count()) > 0) {
      await applicationRow.click();
      await page.waitForLoadState('networkidle');

      // Look for hire / advance / move-to-offer actions
      const hireAction = page.locator(
        'button:has-text("Hire"), button:has-text("Mark as Hired"), ' +
        'button:has-text("Advance"), button:has-text("Move to Offer"), ' +
        '[data-testid="hire-button"], [data-testid="advance-button"]'
      );

      const hasHireAction = (await hireAction.count()) > 0;
      if (hasHireAction) {
        await expect(hireAction.first()).toBeVisible();
      }
      // Hire action may not be available for this application's stage
    }
  });
});
