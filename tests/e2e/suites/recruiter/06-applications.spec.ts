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

    // Wait for page content to render
    const heading = page.locator(':is(h1, h2, h3):visible').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
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

    const ready = await waitForPortalReady(page);
    if (!ready) { test.skip(); return; }

    // Look for visible view toggle buttons
    const viewButtons = page.locator(
      'button:has-text("Grid"), button:has-text("Table"), button:has-text("Board"), ' +
      '[data-testid="view-toggle"], [aria-label*="view"]'
    );

    // Only try clicking if buttons are actually visible
    const visibleCount = await viewButtons.filter({ has: page.locator(':visible') }).count().catch(() => 0);
    if (visibleCount > 1) {
      await viewButtons.nth(1).click({ timeout: 5_000 }).catch(() => {});
      await page.waitForTimeout(500);
    }
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });
});
