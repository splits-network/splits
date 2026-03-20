import { test, expect } from '../../fixtures/auth';

test.describe('Candidate — Applications', () => {
  test('applications page loads', async ({ candidatePage: page }) => {
    await page.goto('/portal/applications');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);
  });

  test('application list or empty state is visible', async ({ candidatePage: page }) => {
    await page.goto('/portal/applications');

    const list = page.locator(
      'table, [data-testid="application-list"], .grid, .card, ' +
      '[data-testid="applications"]'
    );
    const emptyState = page.getByText(
      /no applications|no results|get started|you haven't applied/i
    );

    const hasItems = await list.first().isVisible().catch(() => false);
    const isEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasItems || isEmpty).toBeTruthy();
  });

  test('view switching works', async ({ candidatePage: page }) => {
    await page.goto('/portal/applications');

    const viewButtons = page.locator(
      'button:has-text("Grid"), button:has-text("Table"), button:has-text("Split"), ' +
      '[data-testid="view-toggle"], [aria-label*="view"]'
    );

    const count = await viewButtons.count();
    if (count > 1) {
      await viewButtons.nth(1).click();
      await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);

      await viewButtons.nth(0).click();
      await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);
    }
  });

  test('clicking an application shows detail view', async ({ candidatePage: page }) => {
    await page.goto('/portal/applications');

    const applicationLink = page.locator(
      'a[href*="/portal/applications/"], [data-testid="application-card"] a, ' +
      'tr[data-testid] a, .card a[href*="application"]'
    );

    if (await applicationLink.first().isVisible().catch(() => false)) {
      await applicationLink.first().click();
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);
    }
  });

  test('timeline or status display is present on detail page', async ({
    candidatePage: page,
  }) => {
    await page.goto('/portal/applications');

    const applicationLink = page.locator(
      'a[href*="/portal/applications/"], [data-testid="application-card"] a, ' +
      'tr[data-testid] a, .card a[href*="application"]'
    );

    if (await applicationLink.first().isVisible().catch(() => false)) {
      await applicationLink.first().click();
      await page.waitForLoadState('domcontentloaded');

      const timeline = page.locator(
        '[data-testid="timeline"], [data-testid="status"], ' +
        '.timeline, .steps, ul.steps'
      );
      const statusBadge = page.getByText(
        /applied|in review|interviewing|offered|rejected|pending|status/i
      );

      const hasTimeline = await timeline.first().isVisible().catch(() => false);
      const hasStatus = await statusBadge.first().isVisible().catch(() => false);

      // If we got to a detail page, it should show status info
      expect(hasTimeline || hasStatus).toBeTruthy();
    }
  });
});
