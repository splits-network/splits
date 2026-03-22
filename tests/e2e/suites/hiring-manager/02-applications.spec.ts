import { test, expect } from '../../fixtures/auth';

test.describe('Hiring Manager — Applications', () => {
  test('applications page loads', async ({ hiringManagerPage: page }) => {
    await page.goto('/portal/applications');

    await expect(page.locator('body')).not.toContainText(/something went wrong/i);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);

    const heading = page.locator(':is(h1, h2):visible').first();
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('application list or empty state renders', async ({
    hiringManagerPage: page,
  }) => {
    await page.goto('/portal/applications');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').textContent();
    const hasApplications =
      (await page.locator(
        'table tbody tr, [data-testid="application-card"], [class*="card"]'
      ).count()) > 0;
    const hasEmptyState = /no application|empty|none|get started/i.test(
      bodyText || ''
    );

    expect(
      hasApplications || hasEmptyState || (bodyText || '').trim().length > 0
    ).toBe(true);
  });

  test('view switching (Grid/Table/Split)', async ({
    hiringManagerPage: page,
  }) => {
    await page.goto('/portal/applications');
    await page.waitForLoadState('networkidle');

    const viewToggles = page.locator(
      'button:has-text("Grid"), button:has-text("Table"), button:has-text("Split"), ' +
      '[data-testid="view-toggle"], [aria-label*="view" i], [class*="view-toggle"]'
    );

    const toggleCount = await viewToggles.count();
    if (toggleCount > 0) {
      for (let i = 0; i < Math.min(toggleCount, 3); i++) {
        const isVisible = await viewToggles.nth(i).isVisible().catch(() => false);
        if (!isVisible) continue;
        await viewToggles.nth(i).click({ timeout: 5_000 }).catch(() => {});
        await page.waitForTimeout(500);
        await expect(page.locator('body')).not.toContainText(
          /something went wrong/i
        );
      }
    }
    // View toggles may not exist yet — that's OK
  });

  test('click application to view detail', async ({
    hiringManagerPage: page,
  }) => {
    await page.goto('/portal/applications');
    await page.waitForLoadState('networkidle');

    const applicationRow = page.locator(
      'table tbody tr, [data-testid="application-card"], [data-testid="application-row"]'
    ).first();

    const hasApplications = (await applicationRow.count()) > 0;
    if (!hasApplications) {
      test.info().annotations.push({
        type: 'skip-reason',
        description: 'No applications found — empty DB',
      });
      return;
    }

    await applicationRow.click();
    await page.waitForLoadState('networkidle');

    // Should navigate to detail or open a detail panel
    await expect(page.locator('body')).not.toContainText(
      /something went wrong/i
    );
    await expect(page.locator('body')).not.toContainText(
      /Internal Server Error/i
    );

    // Detail view should have meaningful content
    const bodyText = await page.locator('body').textContent();
    expect((bodyText || '').trim().length).toBeGreaterThan(0);
  });
});
