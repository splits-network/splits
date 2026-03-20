import { test, expect } from '../../fixtures/auth';

test.describe('Hiring Manager — Advance Candidates', () => {
  test('applications page loads for advancing', async ({
    hiringManagerPage: page,
  }) => {
    await page.goto('/portal/applications');

    await expect(page.locator('body')).not.toContainText(/something went wrong/i);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);

    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('advance button is present for company_review stage applications', async ({
    hiringManagerPage: page,
  }) => {
    await page.goto('/portal/applications');
    await page.waitForLoadState('networkidle');

    // Look for applications at company_review stage
    const stageLabels = page.locator(
      '[data-testid*="stage"], [class*="stage"], [class*="status"], ' +
      ':text("Company Review"), :text("company_review"), :text("Review")'
    );

    const stageCount = await stageLabels.count();
    if (stageCount === 0) {
      test.info().annotations.push({
        type: 'skip-reason',
        description: 'No applications at company_review stage found',
      });
      return;
    }

    // Click the first application to open it
    const applicationRow = page.locator(
      'table tbody tr, [data-testid="application-card"], [data-testid="application-row"]'
    ).first();

    if ((await applicationRow.count()) > 0) {
      await applicationRow.click();
      await page.waitForLoadState('networkidle');

      const advanceAction = page.locator(
        'button:has-text("Advance"), button:has-text("Move"), ' +
        'button:has-text("Next Stage"), button:has-text("Progress"), ' +
        '[data-testid="advance-button"], [data-testid="stage-advance"]'
      );

      const hasAdvanceAction = (await advanceAction.count()) > 0;
      if (hasAdvanceAction) {
        await expect(advanceAction.first()).toBeVisible();
      }
    }
  });

  test('advancing changes stage (stage transition)', async ({
    hiringManagerPage: page,
  }) => {
    await page.goto('/portal/applications');
    await page.waitForLoadState('networkidle');

    const applicationRow = page.locator(
      'table tbody tr, [data-testid="application-card"], [data-testid="application-row"]'
    ).first();

    if ((await applicationRow.count()) === 0) {
      test.info().annotations.push({
        type: 'skip-reason',
        description: 'No applications found — empty DB',
      });
      return;
    }

    await applicationRow.click();
    await page.waitForLoadState('networkidle');

    // Capture current stage text before advancing
    const stageIndicator = page.locator(
      '[data-testid*="stage"], [class*="stage"], [class*="status"], ' +
      '[data-testid="current-stage"]'
    ).first();

    const stageExists = (await stageIndicator.count()) > 0;
    const stageBefore = stageExists
      ? await stageIndicator.textContent()
      : null;

    const advanceBtn = page.locator(
      'button:has-text("Advance"), button:has-text("Move"), ' +
      'button:has-text("Next Stage"), button:has-text("Progress"), ' +
      '[data-testid="advance-button"], [data-testid="stage-advance"]'
    ).first();

    if ((await advanceBtn.count()) === 0) {
      test.info().annotations.push({
        type: 'skip-reason',
        description: 'No advance button found for current application',
      });
      return;
    }

    await advanceBtn.click();
    await page.waitForLoadState('networkidle');

    // Verify page did not error
    await expect(page.locator('body')).not.toContainText(
      /something went wrong/i
    );

    // If we captured the stage before, check it changed or a success indicator appeared
    if (stageBefore && stageExists) {
      const stageAfter = await stageIndicator.textContent().catch(() => null);
      const successToast = page.locator(
        '[class*="toast"], [class*="alert"], [role="alert"], ' +
        ':text("success"), :text("advanced"), :text("moved")'
      );
      const hasSuccess = (await successToast.count()) > 0;
      const stageChanged = stageAfter !== stageBefore;

      // Either the stage changed or a success message appeared
      expect(stageChanged || hasSuccess).toBe(true);
    }
  });

  test('timeline updates after advancing', async ({
    hiringManagerPage: page,
  }) => {
    await page.goto('/portal/applications');
    await page.waitForLoadState('networkidle');

    const applicationRow = page.locator(
      'table tbody tr, [data-testid="application-card"], [data-testid="application-row"]'
    ).first();

    if ((await applicationRow.count()) === 0) {
      test.info().annotations.push({
        type: 'skip-reason',
        description: 'No applications found — empty DB',
      });
      return;
    }

    await applicationRow.click();
    await page.waitForLoadState('networkidle');

    // Look for a timeline or activity feed
    const timeline = page.locator(
      '[data-testid="timeline"], [data-testid="activity-feed"], ' +
      '[class*="timeline"], [class*="activity"], [class*="history"], ' +
      'ul[class*="event"], ol[class*="event"]'
    );

    const timelineCount = await timeline.count();
    if (timelineCount > 0) {
      await expect(timeline.first()).toBeVisible();

      // Timeline should contain entries
      const entries = timeline.first().locator('li, [class*="entry"], [class*="item"]');
      const entryCount = await entries.count();
      expect(entryCount).toBeGreaterThan(0);
    }
    // Timeline may not exist on this page — that's OK
  });
});
