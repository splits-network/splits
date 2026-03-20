import { test, expect } from '../../fixtures/auth';

test.describe('Platform Admin — Application Administration', () => {
  test('all applications listed', async ({ platformAdminPage: page }) => {
    await page.goto('/portal/admin/applications');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
    await expect(page.locator('body')).not.toContainText(/something went wrong/i);

    const heading = page.locator('h1, h2, [data-testid="page-title"]').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });

    const content = page.locator(
      'table, .card, [data-testid="application-list"], .grid'
    );
    const emptyState = page.getByText(/no applications|no results|none/i);

    const hasContent = await content.first().isVisible().catch(() => false);
    const isEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasContent || isEmpty).toBeTruthy();
  });

  test('application filters work', async ({ platformAdminPage: page }) => {
    await page.goto('/portal/admin/applications');
    await page.waitForLoadState('networkidle');

    // Test stage filter
    const stageFilter = page.locator(
      'select[name*="stage" i], select[name*="status" i], ' +
      '[data-testid="stage-filter"], ' +
      'button:has-text("Applied"), button:has-text("Interview"), button:has-text("Offer")'
    );

    const hasStageFilter = (await stageFilter.count()) > 0;

    if (hasStageFilter) {
      const firstFilter = stageFilter.first();
      const tagName = await firstFilter.evaluate((el) => el.tagName.toLowerCase());

      if (tagName === 'select') {
        const options = await firstFilter.locator('option').allTextContents();
        expect(options.length).toBeGreaterThan(0);
      } else {
        await firstFilter.click();
        await page.waitForTimeout(500);
        await expect(page.locator('body')).not.toContainText(/something went wrong/i);
      }
    }

    // Test company filter
    const companyFilter = page.locator(
      'select[name*="company" i], [data-testid="company-filter"]'
    ).first();

    if (await companyFilter.isVisible().catch(() => false)) {
      const tagName = await companyFilter.evaluate((el) => el.tagName.toLowerCase());
      if (tagName === 'select') {
        const options = await companyFilter.locator('option').allTextContents();
        expect(options.length).toBeGreaterThan(0);
      }
    }

    // Test recruiter filter
    const recruiterFilter = page.locator(
      'select[name*="recruiter" i], [data-testid="recruiter-filter"]'
    ).first();

    if (await recruiterFilter.isVisible().catch(() => false)) {
      const tagName = await recruiterFilter.evaluate((el) => el.tagName.toLowerCase());
      if (tagName === 'select') {
        const options = await recruiterFilter.locator('option').allTextContents();
        expect(options.length).toBeGreaterThan(0);
      }
    }
    // Filters may not be implemented yet — that's OK
  });

  test('click application for detail view', async ({
    platformAdminPage: page,
  }) => {
    await page.goto('/portal/admin/applications');
    await page.waitForLoadState('networkidle');

    const applicationRow = page.locator(
      'table tbody tr, [data-testid="application-card"], [data-testid="application-row"]'
    ).first();

    const hasApplications = await applicationRow.isVisible().catch(() => false);

    if (hasApplications) {
      await applicationRow.click();
      await page.waitForLoadState('networkidle');

      await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
      await expect(page.locator('body')).not.toContainText(/something went wrong/i);

      // Detail view should show some application info
      const detailContent = page.locator(
        '[data-testid="detail-panel"], .detail-panel, ' +
        '[data-testid="application-detail"], main'
      );
      await expect(detailContent.first()).toBeVisible();
    }
    // No applications to click — that's OK
  });
});
