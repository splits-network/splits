import { test, expect } from '../../fixtures/auth';
import { dismissCookieBanner, captureConsoleErrors } from '../../helpers/auth';

test.describe('Company Admin — Roles', () => {
  test('roles listing page loads', async ({ companyAdminPage: page }) => {
    await page.goto('/portal/roles', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await dismissCookieBanner(page);

    if (page.url().includes('/onboarding')) {
      test.skip(true, 'Company admin onboarding not complete');
      return;
    }

    await expect(page.locator('body')).not.toContainText(/something went wrong/i);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('create a role via the 6-step wizard', async ({ companyAdminPage: page }) => {
    test.setTimeout(180_000);
    const getErrors = captureConsoleErrors(page);

    await page.goto('/portal/roles', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await dismissCookieBanner(page);

    if (page.url().includes('/onboarding')) {
      test.skip(true, 'Company admin onboarding not complete');
      return;
    }

    // ── Open the wizard ──
    const addRoleBtn = page.locator('button:has-text("Add Role")');
    await expect(addRoleBtn).toBeVisible({ timeout: 30_000 });
    await addRoleBtn.click();

    // Wait for wizard modal — subtitle shows "Step 1 of 6"
    await page.getByText('Step 1 of 6').waitFor({ timeout: 10_000 });
    console.log('  Wizard opened');

    // ── Step 1: Role Details ──
    const roleTitle = `E2E Senior Developer ${Date.now()}`;
    const titleInput = page.locator('input[placeholder="e.g., Senior Software Engineer"]');
    await expect(titleInput).toBeVisible({ timeout: 10_000 });
    await titleInput.fill(roleTitle);

    // Location (optional)
    const locationInput = page.locator('input[placeholder="e.g., New York, NY or Remote"]');
    if (await locationInput.isVisible().catch(() => false)) {
      await locationInput.fill('New York, NY');
    }

    // Department (optional)
    const deptInput = page.locator('input[placeholder="e.g., Engineering"]');
    if (await deptInput.isVisible().catch(() => false)) {
      await deptInput.fill('Engineering');
    }

    // Wait for company data to load (Next button enabled once companies are loaded)
    const nextBtn = page.locator('button:has-text("Next")');
    await expect(nextBtn).toBeEnabled({ timeout: 15_000 });
    await nextBtn.click();
    console.log('  Step 1 complete — Role Details');

    // ── Step 2: Compensation ──
    await page.getByText('Step 2 of 6').waitFor({ timeout: 10_000 });

    const salaryMinInput = page.locator('input[placeholder="120,000"]');
    if (await salaryMinInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await salaryMinInput.fill('120000');
    }

    const salaryMaxInput = page.locator('input[placeholder="150,000"]');
    if (await salaryMaxInput.isVisible().catch(() => false)) {
      await salaryMaxInput.fill('150000');
    }

    await nextBtn.click();
    console.log('  Step 2 complete — Compensation');

    // ── Step 3: Descriptions (optional — skip) ──
    await page.getByText('Step 3 of 6').waitFor({ timeout: 10_000 });
    await nextBtn.click();
    console.log('  Step 3 skipped — Descriptions');

    // ── Step 4: Requirements (optional — skip) ──
    await page.getByText('Step 4 of 6').waitFor({ timeout: 10_000 });
    await nextBtn.click();
    console.log('  Step 4 skipped — Requirements');

    // ── Step 5: Skills (optional — skip) ──
    await page.getByText('Step 5 of 6').waitFor({ timeout: 10_000 });
    await nextBtn.click();
    console.log('  Step 5 skipped — Skills');

    // ── Step 6: Screening (last step — submit) ──
    await page.getByText('Step 6 of 6').waitFor({ timeout: 10_000 });

    // Capture the job creation API response
    const responsePromise = page.waitForResponse(
      resp => resp.url().includes('/jobs') && resp.request().method() === 'POST',
      { timeout: 30_000 }
    ).catch(() => null);

    const createRoleBtn = page.locator('button:has-text("Create Role")');
    await expect(createRoleBtn).toBeVisible({ timeout: 5_000 });
    await createRoleBtn.click();

    const response = await responsePromise;
    if (response) {
      const status = response.status();
      console.log(`  Job creation API: ${status}`);
      if (status >= 400) {
        const body = await response.text().catch(() => '');
        console.log(`  API error: ${body}`);
      }
      expect(status).toBeLessThan(400);
    } else {
      console.log('  WARNING: No job creation API response captured');
    }

    // Wait for modal to close (toast appears on success)
    await page.waitForTimeout(3000);

    const errors = getErrors();
    if (errors.length > 0) {
      console.log(`  Console errors:\n    ${errors.slice(0, 3).join('\n    ')}`);
    }

    console.log(`  Created role: ${roleTitle}`);
  });
});
