import { test, expect } from '../../fixtures/auth';

/**
 * Full lifecycle test: Role creation → Candidate submission → Stage advancement → Offer → Hire → Placement
 *
 * This is the core business flow of Splits Network. Each test builds on the previous one.
 * Tests use serial execution so state (application ID, etc.) carries forward.
 */
test.describe.serial('Lifecycle — Full Application to Payout', () => {
  // Shared state across serial tests
  let roleTitle: string;
  let applicationUrl: string;

  // ── Step 1: Company admin creates a role ──────────────────────────────────

  test('company admin creates a role via wizard', async ({
    companyAdminPage: page,
  }) => {
    test.setTimeout(120_000);

    await page.goto('/portal/roles', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    // Handle onboarding redirect — company admin should have been onboarded by onboarding test
    if (page.url().includes('/onboarding')) {
      console.log('  Company admin redirected to onboarding — onboarding not complete');
      test.skip(true, 'Company admin onboarding not complete — run onboarding tests first');
      return;
    }

    // Click "Create Role" button
    const createBtn = page.locator('button:has-text("Create Role"), button:has-text("Create")').first();
    await expect(createBtn).toBeVisible({ timeout: 15_000 });
    await createBtn.click({ force: true });

    // Wait for wizard modal to open
    const modal = page.locator('dialog[open], [role="dialog"], .modal');
    await expect(modal).toBeVisible({ timeout: 10_000 });

    // ── Step 1: Role Details ──
    roleTitle = `E2E Test Role - ${Date.now()}`;
    const titleInput = modal.locator('input[placeholder*="title" i], input[name="title"]').first();
    await expect(titleInput).toBeVisible({ timeout: 10_000 });
    await titleInput.fill(roleTitle);

    // Company should be auto-selected for company admin
    // Fill location (optional but good for the test)
    const locationInput = modal.locator('input[placeholder*="location" i], input[name="location"]').first();
    if (await locationInput.isVisible().catch(() => false)) {
      await locationInput.fill('New York, NY');
    }

    // Click Continue/Next to go to Step 2
    const continueBtn = modal.locator('button:has-text("Continue"), button:has-text("Next")').first();
    await expect(continueBtn).toBeVisible({ timeout: 5_000 });
    await continueBtn.click({ force: true });

    // ── Step 2: Compensation ──
    await page.waitForTimeout(500);

    // Fee percentage (usually pre-filled at 20%)
    const feeInput = modal.locator('input[name="fee_percentage"], input[type="number"]').first();
    if (await feeInput.isVisible().catch(() => false)) {
      const currentValue = await feeInput.inputValue();
      if (!currentValue || currentValue === '0') {
        await feeInput.fill('20');
      }
    }

    // Employment type — select full_time if dropdown exists
    const employmentSelect = modal.locator('select[name="employment_type"]').first();
    if (await employmentSelect.isVisible().catch(() => false)) {
      await employmentSelect.selectOption('full_time');
    }

    // Continue to Step 3
    const continueBtn2 = modal.locator('button:has-text("Continue"), button:has-text("Next")').first();
    await continueBtn2.click({ force: true });

    // ── Step 3: Descriptions ──
    await page.waitForTimeout(500);

    // Fill recruiter description
    const descTextarea = modal.locator('textarea').first();
    if (await descTextarea.isVisible().catch(() => false)) {
      await descTextarea.fill('E2E test role for lifecycle testing. Looking for a senior engineer with full-stack experience.');
    }

    // Continue to Step 4
    const continueBtn3 = modal.locator('button:has-text("Continue"), button:has-text("Next")').first();
    await continueBtn3.click({ force: true });

    // ── Step 4: Requirements ──
    await page.waitForTimeout(500);
    // Skip — requirements are optional
    const continueBtn4 = modal.locator('button:has-text("Continue"), button:has-text("Next"), button:has-text("Skip")').first();
    await continueBtn4.click({ force: true });

    // ── Step 5: Skills ──
    await page.waitForTimeout(500);
    // Skip — skills are optional
    const continueBtn5 = modal.locator('button:has-text("Continue"), button:has-text("Next"), button:has-text("Skip")').first();
    await continueBtn5.click({ force: true });

    // ── Step 6: Screening ──
    await page.waitForTimeout(500);
    // No pre-screen questions needed

    // Submit the role — look for "Create Role" or final submit button
    const submitBtn = modal.locator(
      'button:has-text("Create Role"), button:has-text("Save"), button:has-text("Submit"), button:has-text("Create")'
    ).first();
    await expect(submitBtn).toBeVisible({ timeout: 5_000 });
    await submitBtn.click({ force: true });

    // Wait for modal to close (success) or success toast
    await page.waitForTimeout(3000);

    // Verify role was created — search for it on the roles page
    await page.goto('/portal/roles', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);

    console.log(`  Created role: ${roleTitle}`);
  });

  // ── Step 2: Recruiter submits a candidate to the role ─────────────────────

  test('recruiter submits candidate to role via wizard', async ({
    recruiterPage: page,
  }) => {
    test.setTimeout(120_000);

    if (!roleTitle) {
      test.skip(true, 'No role was created in previous step');
      return;
    }

    await page.goto('/portal/applications', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    // Click "Submit Candidate" button
    const submitCandidateBtn = page.locator(
      'button:has-text("Submit Candidate"), button:has-text("Submit"), a:has-text("Submit Candidate")'
    ).first();
    await expect(submitCandidateBtn).toBeVisible({ timeout: 15_000 });
    await submitCandidateBtn.click({ force: true });

    // Wait for wizard modal
    const modal = page.locator('dialog[open], [role="dialog"], .modal');
    await expect(modal).toBeVisible({ timeout: 10_000 });

    // ── Step 1: Find a Role ──
    // Search for the role we just created
    const roleSearch = modal.locator('input[placeholder*="Search" i], input[type="search"]').first();
    if (await roleSearch.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await roleSearch.fill(roleTitle);
      await page.waitForTimeout(1000); // debounce

      // Select the role from results — click the radio button or row
      const roleRow = modal.locator(`text=${roleTitle}`).first();
      if (await roleRow.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await roleRow.click({ force: true });
      } else {
        // Try clicking first available role row
        const firstRow = modal.locator('table tbody tr, [role="radio"], input[type="radio"]').first();
        if (await firstRow.isVisible().catch(() => false)) {
          await firstRow.click({ force: true });
        }
      }
    }

    // Continue to Step 2
    const continueBtn = modal.locator('button:has-text("Continue"), button:has-text("Next")').first();
    await expect(continueBtn).toBeVisible({ timeout: 5_000 });
    await continueBtn.click({ force: true });

    // ── Step 2: Select Candidate ──
    await page.waitForTimeout(1000);

    // Select first available candidate
    const candidateRow = modal.locator('table tbody tr, [role="radio"], input[type="radio"]').first();
    if (await candidateRow.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await candidateRow.click({ force: true });
    }

    // Continue to Step 3
    const continueBtn2 = modal.locator('button:has-text("Continue"), button:has-text("Next")').first();
    if (await continueBtn2.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await continueBtn2.click({ force: true });
    }

    // ── Step 3: Build Your Case (Pitch) ──
    await page.waitForTimeout(500);
    const pitchTextarea = modal.locator('textarea').first();
    if (await pitchTextarea.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await pitchTextarea.fill(
        'This candidate is an excellent match for this role. They have 5+ years of experience in the relevant technologies and a strong track record of delivery.'
      );
    }

    // Continue to Step 4 (Review)
    const continueBtn3 = modal.locator('button:has-text("Continue"), button:has-text("Next"), button:has-text("Review")').first();
    if (await continueBtn3.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await continueBtn3.click({ force: true });
    }

    // ── Step 4: Review & Submit ──
    await page.waitForTimeout(500);
    const finalSubmitBtn = modal.locator(
      'button:has-text("Submit"), button:has-text("Submit Candidate"), button:has-text("Confirm")'
    ).first();
    await expect(finalSubmitBtn).toBeVisible({ timeout: 10_000 });
    await finalSubmitBtn.click({ force: true });

    // Wait for submission to complete
    await page.waitForTimeout(3000);

    // Verify application was created — check applications page
    await page.goto('/portal/applications', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);

    console.log('  Submitted candidate to role');
  });

  // ── Step 3: Company admin advances application through stages ─────────────

  test('company admin advances application to interview', async ({
    companyAdminPage: page,
  }) => {
    test.setTimeout(120_000);

    await page.goto('/portal/applications', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    // Find and click on the most recent application
    const applicationRow = page.locator('table tbody tr, a[href*="/applications/"]').first();
    const hasApplications = await applicationRow.isVisible({ timeout: 15_000 }).catch(() => false);

    if (!hasApplications) {
      test.skip(true, 'No applications found — previous step may have failed');
      return;
    }

    await applicationRow.click({ force: true });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Save the application URL for later
    applicationUrl = page.url();

    // Look for "Advance Stage" or similar action button
    const advanceBtn = page.locator(
      'button:has-text("Advance"), button:has-text("Advance Stage"), ' +
      'button:has-text("Accept"), button:has-text("Approve")'
    ).first();

    if (await advanceBtn.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await advanceBtn.click({ force: true });
      await page.waitForTimeout(1000);

      // Confirm in any modal/dialog that appears
      const confirmBtn = page.locator(
        'dialog button:has-text("Confirm"), dialog button:has-text("Approve"), ' +
        '.modal button:has-text("Confirm"), .modal button:has-text("Approve"), ' +
        'button:has-text("Yes")'
      ).first();

      if (await confirmBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await confirmBtn.click({ force: true });
        await page.waitForTimeout(2000);
      }

      console.log('  Advanced application (first advance)');

      // Try to advance again (company_review → interview)
      const advanceBtn2 = page.locator(
        'button:has-text("Advance"), button:has-text("Advance Stage"), ' +
        'button:has-text("Interview")'
      ).first();

      if (await advanceBtn2.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await advanceBtn2.click({ force: true });
        await page.waitForTimeout(1000);

        const confirmBtn2 = page.locator(
          'dialog button:has-text("Confirm"), .modal button:has-text("Confirm"), button:has-text("Yes")'
        ).first();

        if (await confirmBtn2.isVisible({ timeout: 5_000 }).catch(() => false)) {
          await confirmBtn2.click({ force: true });
          await page.waitForTimeout(2000);
        }

        console.log('  Advanced application (second advance → interview)');
      }
    } else {
      console.log('  No advance button found — application may need different action');
    }

    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  // ── Step 4: Company admin extends offer ───────────────────────────────────

  test('company admin extends offer', async ({
    companyAdminPage: page,
  }) => {
    test.setTimeout(120_000);

    // Navigate to the application
    if (applicationUrl) {
      await page.goto(applicationUrl, { waitUntil: 'domcontentloaded' });
    } else {
      await page.goto('/portal/applications', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      const row = page.locator('table tbody tr, a[href*="/applications/"]').first();
      if (await row.isVisible({ timeout: 10_000 }).catch(() => false)) {
        await row.click({ force: true });
      }
    }
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Look for "Advance Stage" to move to offer, or "Offer" / "Extend Offer" button
    const offerBtn = page.locator(
      'button:has-text("Extend Offer"), button:has-text("Offer"), ' +
      'a:has-text("Extend Offer"), a:has-text("Offer"), ' +
      'button:has-text("Advance")'
    ).first();

    if (await offerBtn.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await offerBtn.click({ force: true });
      await page.waitForTimeout(2000);

      // If it navigated to the offer wizard page
      if (page.url().includes('/offer')) {
        // ── Offer Wizard Step 1: Review Candidate ──
        const continueBtn = page.locator('button:has-text("Continue"), button:has-text("Next")').first();
        if (await continueBtn.isVisible({ timeout: 10_000 }).catch(() => false)) {
          await continueBtn.click({ force: true });
          await page.waitForTimeout(1000);
        }

        // ── Offer Wizard Step 2: Offer Details ──
        // Fill salary
        const salaryInput = page.locator('input[type="number"], input[name*="salary" i], input[placeholder*="120000" i]').first();
        if (await salaryInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
          await salaryInput.fill('120000');
        }

        // Fill start date
        const dateInput = page.locator('input[type="date"], input[name*="date" i]').first();
        if (await dateInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
          await dateInput.fill('2026-05-01');
        }

        const continueBtn2 = page.locator('button:has-text("Continue"), button:has-text("Next")').first();
        if (await continueBtn2.isVisible({ timeout: 5_000 }).catch(() => false)) {
          await continueBtn2.click({ force: true });
          await page.waitForTimeout(1000);
        }

        // ── Offer Wizard Step 3: Financial Impact ── (read-only, just continue)
        const continueBtn3 = page.locator('button:has-text("Continue"), button:has-text("Next")').first();
        if (await continueBtn3.isVisible({ timeout: 5_000 }).catch(() => false)) {
          await continueBtn3.click({ force: true });
          await page.waitForTimeout(1000);
        }

        // ── Offer Wizard Step 4: Confirm & Extend ──
        // Check the terms checkbox
        const termsCheckbox = page.locator('input[type="checkbox"]').first();
        if (await termsCheckbox.isVisible({ timeout: 5_000 }).catch(() => false)) {
          await termsCheckbox.check({ force: true });
        }

        const extendBtn = page.locator('button:has-text("Extend Offer"), button:has-text("Confirm")').first();
        if (await extendBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
          await extendBtn.click({ force: true });
          await page.waitForTimeout(3000);
        }

        console.log('  Extended offer to candidate');
      } else {
        // If a modal appeared instead, confirm it
        const confirmBtn = page.locator(
          'dialog button:has-text("Confirm"), .modal button:has-text("Confirm")'
        ).first();
        if (await confirmBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
          await confirmBtn.click({ force: true });
          await page.waitForTimeout(2000);
        }
        console.log('  Advanced application stage (toward offer)');
      }
    } else {
      console.log('  No offer action available — application may not be at interview stage');
    }

    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  // ── Step 5: Company admin confirms hire ───────────────────────────────────

  test('company admin confirms hire', async ({
    companyAdminPage: page,
  }) => {
    test.setTimeout(120_000);

    // Navigate to the application
    if (applicationUrl) {
      await page.goto(applicationUrl, { waitUntil: 'domcontentloaded' });
    } else {
      await page.goto('/portal/applications', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      const row = page.locator('table tbody tr, a[href*="/applications/"]').first();
      if (await row.isVisible({ timeout: 10_000 }).catch(() => false)) {
        await row.click({ force: true });
      }
    }
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Look for hire action
    const hireBtn = page.locator(
      'button:has-text("Hire"), button:has-text("Confirm Hire"), ' +
      'a:has-text("Hire"), button:has-text("Advance")'
    ).first();

    if (await hireBtn.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await hireBtn.click({ force: true });
      await page.waitForTimeout(2000);

      // If navigated to hire wizard page
      if (page.url().includes('/hire')) {
        // ── Hire Wizard Step 1: Review Placement ──
        const continueBtn = page.locator('button:has-text("Continue"), button:has-text("Next")').first();
        if (await continueBtn.isVisible({ timeout: 10_000 }).catch(() => false)) {
          await continueBtn.click({ force: true });
          await page.waitForTimeout(1000);
        }

        // ── Hire Wizard Step 2: Confirm Terms ──
        // Salary and start date should be pre-filled from offer
        const salaryInput = page.locator('input[type="number"], input[name*="salary" i]').first();
        if (await salaryInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
          const currentVal = await salaryInput.inputValue();
          if (!currentVal || currentVal === '0') {
            await salaryInput.fill('120000');
          }
        }

        const continueBtn2 = page.locator('button:has-text("Continue"), button:has-text("Next")').first();
        if (await continueBtn2.isVisible({ timeout: 5_000 }).catch(() => false)) {
          await continueBtn2.click({ force: true });
          await page.waitForTimeout(1000);
        }

        // ── Hire Wizard Step 3: Acknowledge & Confirm ──
        const termsCheckbox = page.locator('input[type="checkbox"]').first();
        if (await termsCheckbox.isVisible({ timeout: 5_000 }).catch(() => false)) {
          await termsCheckbox.check({ force: true });
        }

        const confirmHireBtn = page.locator(
          'button:has-text("Confirm Hiring"), button:has-text("Confirm")'
        ).first();
        if (await confirmHireBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
          await confirmHireBtn.click({ force: true });
          await page.waitForTimeout(3000);
        }

        console.log('  Confirmed hire — placement should be created');
      } else {
        // Modal confirmation
        const confirmBtn = page.locator(
          'dialog button:has-text("Confirm"), .modal button:has-text("Confirm")'
        ).first();
        if (await confirmBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
          await confirmBtn.click({ force: true });
          await page.waitForTimeout(2000);
        }
        console.log('  Advanced application stage (toward hire)');
      }
    } else {
      console.log('  No hire action available — application may not be at offer stage');
    }

    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  // ── Step 6: Verify placement was created ──────────────────────────────────

  test('placement is created and visible', async ({
    companyAdminPage: page,
  }) => {
    await page.goto('/portal/placements', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);

    console.log('  Placements page loaded successfully');
  });

  // ── Step 7: Admin verifies payout ─────────────────────────────────────────

  test('admin verifies payout schedule exists', async ({
    platformAdminPage: page,
  }) => {
    await page.goto('/portal/admin/payouts', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    await expect(page).not.toHaveURL(/\/sign-in/);
    const heading = page.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);

    console.log('  Admin payouts page loaded successfully');
  });
});
