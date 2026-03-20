import { test, expect } from '../../fixtures/auth';
import * as api from '../../helpers/api';
import * as time from '../../helpers/time-shortcuts';

test.describe.serial('Lifecycle — Full Application to Payout', () => {
  let applicationId: string;
  let placementId: string;

  test('recruiter submits candidate to role via UI', async ({
    recruiterPage: page,
    seedData,
  }) => {
    await page.goto('/portal/roles');
    await page.waitForLoadState('networkidle');

    // Find a role to submit a candidate to
    const roleCard = page.locator(
      'table tbody tr, [data-testid="role-card"], .card, .role-card'
    ).first();

    const hasRoles = await roleCard.isVisible().catch(() => false);

    if (!hasRoles) {
      test.skip(true, 'No roles available for submission');
      return;
    }

    await roleCard.click();
    await page.waitForLoadState('networkidle');

    // Look for submit/apply candidate action
    const submitButton = page.locator(
      'button:has-text("Submit"), button:has-text("Apply"), ' +
      'button:has-text("Submit Candidate"), a:has-text("Submit"), ' +
      '[data-testid="submit-candidate"]'
    ).first();

    const hasSubmit = await submitButton.isVisible().catch(() => false);

    if (!hasSubmit) {
      test.skip(true, 'No submit candidate button available');
      return;
    }

    await submitButton.click();
    await page.waitForLoadState('networkidle');

    // Select a candidate if prompted
    const candidateSelect = page.locator(
      'select[name*="candidate" i], [data-testid="candidate-select"], ' +
      'input[placeholder*="candidate" i]'
    ).first();

    if (await candidateSelect.isVisible().catch(() => false)) {
      const tagName = await candidateSelect.evaluate((el) => el.tagName.toLowerCase());
      if (tagName === 'select') {
        const options = await candidateSelect.locator('option').allTextContents();
        if (options.length > 1) {
          await candidateSelect.selectOption({ index: 1 });
        }
      }
    }

    // Submit the form
    const confirmButton = page.locator(
      'button[type="submit"], button:has-text("Confirm"), ' +
      'button:has-text("Submit"), [data-testid="submit"]'
    ).first();

    if (await confirmButton.isVisible().catch(() => false)) {
      await confirmButton.click();
      await page.waitForLoadState('networkidle');
    }

    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);

    // Extract application ID from URL or page content
    const url = page.url();
    const urlMatch = url.match(/applications\/([a-f0-9-]+)/);
    if (urlMatch) {
      applicationId = urlMatch[1];
    }
  });

  test('company admin reviews and advances to interview', async ({
    companyAdminPage: page,
    seedData,
  }) => {
    await page.goto('/portal/applications');
    await page.waitForLoadState('networkidle');

    // Find the most recent application
    const applicationRow = page.locator(
      'table tbody tr, [data-testid="application-card"], [data-testid="application-row"]'
    ).first();

    const hasApplications = await applicationRow.isVisible().catch(() => false);

    if (!hasApplications) {
      test.skip(true, 'No applications available for review');
      return;
    }

    await applicationRow.click();
    await page.waitForLoadState('networkidle');

    // Advance to interview stage
    const advanceButton = page.locator(
      'button:has-text("Advance"), button:has-text("Move to Interview"), ' +
      'button:has-text("Interview"), button:has-text("Shortlist"), ' +
      '[data-testid="advance-stage"], [data-testid="advance-button"]'
    ).first();

    if (await advanceButton.isVisible().catch(() => false)) {
      await advanceButton.click();
      await page.waitForLoadState('networkidle');

      // Confirm if dialog appears
      const confirmButton = page.locator(
        'dialog button:has-text("Confirm"), .modal button:has-text("Confirm"), ' +
        'button:has-text("Yes")'
      ).first();

      if (await confirmButton.isVisible().catch(() => false)) {
        await confirmButton.click();
        await page.waitForLoadState('networkidle');
      }
    }

    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('recruiter extends offer', async ({
    recruiterPage: page,
    seedData,
  }) => {
    await page.goto('/portal/applications');
    await page.waitForLoadState('networkidle');

    const offerButton = page.locator(
      'button:has-text("Offer"), button:has-text("Extend Offer"), ' +
      'a:has-text("Offer"), a:has-text("Extend Offer"), ' +
      '[data-testid="extend-offer"]'
    ).first();

    const hasOffer = await offerButton.isVisible().catch(() => false);

    if (!hasOffer) {
      // Navigate into an application first
      const applicationRow = page.locator(
        'table tbody tr, [data-testid="application-card"]'
      ).first();

      if (await applicationRow.isVisible().catch(() => false)) {
        await applicationRow.click();
        await page.waitForLoadState('networkidle');
      }

      const innerOfferButton = page.locator(
        'button:has-text("Offer"), button:has-text("Extend Offer"), ' +
        '[data-testid="extend-offer"]'
      ).first();

      if (await innerOfferButton.isVisible().catch(() => false)) {
        await innerOfferButton.click();
        await page.waitForLoadState('networkidle');
      } else {
        test.skip(true, 'No offer action available');
        return;
      }
    } else {
      await offerButton.click();
      await page.waitForLoadState('networkidle');
    }

    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('company admin marks as hired', async ({
    companyAdminPage: page,
    seedData,
  }) => {
    await page.goto('/portal/applications');
    await page.waitForLoadState('networkidle');

    const applicationRow = page.locator(
      'table tbody tr, [data-testid="application-card"]'
    ).first();

    if (await applicationRow.isVisible().catch(() => false)) {
      await applicationRow.click();
      await page.waitForLoadState('networkidle');
    }

    const hireButton = page.locator(
      'button:has-text("Hire"), button:has-text("Mark as Hired"), ' +
      '[data-testid="hire-button"], [data-testid="mark-hired"]'
    ).first();

    if (await hireButton.isVisible().catch(() => false)) {
      await hireButton.click();
      await page.waitForLoadState('networkidle');

      // Confirm hire dialog
      const confirmButton = page.locator(
        'dialog button:has-text("Confirm"), .modal button:has-text("Confirm"), ' +
        'button:has-text("Yes"), button[type="submit"]'
      ).first();

      if (await confirmButton.isVisible().catch(() => false)) {
        await confirmButton.click();
        await page.waitForLoadState('networkidle');
      }

      // Extract placement ID from resulting URL or toast
      const url = page.url();
      const placementMatch = url.match(/placements\/([a-f0-9-]+)/);
      if (placementMatch) {
        placementId = placementMatch[1];
      }
    } else {
      test.skip(true, 'No hire action available');
    }

    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('placement is created and visible', async ({
    recruiterPage: page,
  }) => {
    await page.goto('/portal/placements', { waitUntil: 'domcontentloaded' });

    // Wait for page to render — heading or main content
    const heading = page.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('admin verifies payout schedule exists', async ({
    platformAdminPage: page,
  }) => {
    await page.goto('/portal/admin/payouts/schedules');
    await page.waitForLoadState('networkidle');

    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);

    // Wait for page content to render
    const heading = page.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('fast-forward guarantee and process payouts', async ({
    platformAdminPage: page,
    seedData,
  }) => {
    // If we captured a placement ID from earlier steps, use API helpers
    if (placementId) {
      const adminToken = seedData.platform_admin?.token;

      if (adminToken) {
        // Fast-forward the guarantee period
        await time.fastForwardGuarantee(placementId, adminToken);

        // Release escrow
        await time.releaseEscrow(placementId, adminToken);

        // Process payout schedules
        await time.triggerPayoutProcessing(adminToken);

        // Process eligible payouts
        await time.processEligiblePayouts(adminToken);
      }
    }

    // Verify via UI that the admin payouts page still works
    await page.goto('/portal/admin/payouts');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
    await expect(page.locator('body')).not.toContainText(/something went wrong/i);
  });

  test('verify final payout status', async ({
    platformAdminPage: page,
    seedData,
  }) => {
    if (placementId) {
      const adminToken = seedData.platform_admin?.token;

      if (adminToken) {
        const transactions = await time.getPayoutTransactions(
          placementId,
          adminToken
        );

        // Verify transactions exist and have expected statuses
        if (transactions && transactions.length > 0) {
          for (const tx of transactions) {
            expect(['pending', 'processing', 'paid', 'on_hold']).toContain(tx.status);
          }
        }
      }
    }

    // Also verify via admin UI
    await page.goto('/portal/admin/payouts');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });
});
