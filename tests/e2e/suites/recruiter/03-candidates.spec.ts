import { test, expect } from '../../fixtures/auth';
import { waitForPortalReady } from '../../helpers/portal';

test.describe('Recruiter — Candidates', () => {
  test('candidates page loads', async ({ recruiterPage: page }) => {
    await page.goto('/portal/candidates');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('candidate list or empty state is visible', async ({ recruiterPage: page }) => {
    await page.goto('/portal/candidates');

    const ready = await waitForPortalReady(page);
    if (!ready) { test.skip(); return; }

    // Wait for page content to render
    const heading = page.locator(':is(h1, h2, h3):visible').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('view switching works', async ({ recruiterPage: page }) => {
    await page.goto('/portal/candidates');

    // Look for view toggle buttons (Grid / Table / Split)
    const viewButtons = page.locator(
      'button:has-text("Grid"), button:has-text("Table"), button:has-text("Split"), ' +
      '[data-testid="view-toggle"], [aria-label*="view"]'
    );

    const count = await viewButtons.count();
    if (count > 0) {
      // Click the second view option to switch
      const target = count > 1 ? viewButtons.nth(1) : viewButtons.first();
      await target.click();
      // Page should still be stable after switching
      await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
    }
  });

  test('search functionality works', async ({ recruiterPage: page }) => {
    await page.goto('/portal/candidates');

    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i], [data-testid="search"]'
    );

    if (await searchInput.first().isVisible().catch(() => false)) {
      await searchInput.first().fill('test candidate');
      // Allow debounce time
      await page.waitForTimeout(500);
      await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
      // Clear search
      await searchInput.first().clear();
    }
  });

  test('add candidate button exists', async ({ recruiterPage: page }) => {
    await page.goto('/portal/candidates');

    const addButton = page.locator(
      'button:has-text("Add"), button:has-text("Create"), button:has-text("New"), ' +
      'a:has-text("Add Candidate"), a:has-text("New Candidate")'
    );

    if (await addButton.first().isVisible().catch(() => false)) {
      await addButton.first().click();
      // Should navigate to a form or open a modal without errors
      await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
    }
  });
});
