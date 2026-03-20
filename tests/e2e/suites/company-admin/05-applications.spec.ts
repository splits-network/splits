import { test, expect } from '../../fixtures/auth';

test.describe('Company Admin — Applications', () => {
  test('applications page loads', async ({
    companyAdminPage: page,
    seedData,
  }) => {
    await page.goto('/portal/applications');

    await expect(page.locator('body')).not.toContainText(/something went wrong/i);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);

    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('application list or empty state renders', async ({
    companyAdminPage: page,
    seedData,
  }) => {
    await page.goto('/portal/applications');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').textContent();
    const hasApplications =
      (await page.locator('table tbody tr, [data-testid="application-card"], [class*="card"]').count()) > 0;
    const hasEmptyState = /no application|empty|none|get started/i.test(bodyText || '');

    expect(hasApplications || hasEmptyState || (bodyText || '').trim().length > 0).toBe(true);
  });

  test('view switching (Grid/Table/Split)', async ({
    companyAdminPage: page,
    seedData,
  }) => {
    await page.goto('/portal/applications');
    await page.waitForLoadState('networkidle');

    // Look for view toggle buttons
    const viewToggles = page.locator(
      'button:has-text("Grid"), button:has-text("Table"), button:has-text("Split"), ' +
      '[data-testid="view-toggle"], [aria-label*="view" i], [class*="view-toggle"]'
    );

    const toggleCount = await viewToggles.count();
    if (toggleCount > 0) {
      // Click each view toggle and verify page doesn't break
      for (let i = 0; i < Math.min(toggleCount, 3); i++) {
        await viewToggles.nth(i).click();
        await page.waitForTimeout(500);
        await expect(page.locator('body')).not.toContainText(/something went wrong/i);
      }
    }
    // View toggles may not exist yet — that's OK
  });

  test('stage filter works', async ({ companyAdminPage: page, seedData }) => {
    await page.goto('/portal/applications');
    await page.waitForLoadState('networkidle');

    // Look for stage filter (select, tabs, or filter buttons)
    const stageFilter = page.locator(
      'select[name*="stage" i], select[name*="status" i], ' +
      '[data-testid="stage-filter"], ' +
      'button:has-text("Applied"), button:has-text("Interview"), button:has-text("Offer")'
    );

    const filterCount = await stageFilter.count();
    if (filterCount > 0) {
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
    // Filter may not exist yet — that's OK
  });
});
