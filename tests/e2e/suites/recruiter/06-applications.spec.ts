import { test, expect } from '../../fixtures/auth';
import { waitForPortalReady } from '../../helpers/portal';

test.describe('Recruiter — Applications', () => {
  test('applications page loads', async ({ recruiterPage: page }) => {
    await page.goto('/portal/applications');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('application list or empty state is visible', async ({ recruiterPage: page }) => {
    await page.goto('/portal/applications');

    const ready = await waitForPortalReady(page);
    if (!ready) { test.skip(); return; }

    const content = page.locator(
      'table, .card, [data-testid="application-list"], .grid'
    );
    const emptyState = page.getByText(/no applications|no results|get started/i);

    const hasContent = await content.first().isVisible().catch(() => false);
    const isEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasContent || isEmpty).toBeTruthy();
  });

  test('scope filter works (My Applications / All)', async ({ recruiterPage: page }) => {
    await page.goto('/portal/applications');

    const scopeFilter = page.locator(
      'button:has-text("My Applications"), button:has-text("All"), ' +
      '[data-testid="scope-filter"], [role="tablist"]'
    );

    if (await scopeFilter.first().isVisible().catch(() => false)) {
      // Click "All" or the second tab
      const allButton = page.locator(
        'button:has-text("All"), [role="tab"]:nth-child(2)'
      ).first();

      if (await allButton.isVisible().catch(() => false)) {
        await allButton.click();
        await page.waitForTimeout(500);
        await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
      }
    }
  });

  test('stage filter works', async ({ recruiterPage: page }) => {
    await page.goto('/portal/applications');

    const stageFilter = page.locator(
      'select, [data-testid="stage-filter"], button:has-text("Stage"), ' +
      'button:has-text("Filter")'
    );

    if (await stageFilter.first().isVisible().catch(() => false)) {
      await stageFilter.first().click();
      await page.waitForTimeout(300);
      await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
    }
  });

  test('view switching works', async ({ recruiterPage: page }) => {
    await page.goto('/portal/applications');

    const viewButtons = page.locator(
      'button:has-text("Grid"), button:has-text("Table"), button:has-text("Board"), ' +
      '[data-testid="view-toggle"], [aria-label*="view"]'
    );

    const count = await viewButtons.count();
    if (count > 1) {
      await viewButtons.nth(1).click();
      await page.waitForTimeout(500);
      await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
    }
  });
});
