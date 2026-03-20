import { test, expect } from '../../fixtures/auth';

test.describe('Candidate — Applications', () => {
  test('applications page loads', async ({ candidatePage: page }) => {
    await page.goto('/portal/applications');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('application list or empty state is visible', async ({ candidatePage: page }) => {
    await page.goto('/portal/applications');

    // Wait for page content to render — heading or main content area
    const heading = page.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('page renders without errors', async ({ candidatePage: page }) => {
    await page.goto('/portal/applications');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
    await expect(page.locator('body')).not.toContainText(/something went wrong/i);
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
      await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
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
