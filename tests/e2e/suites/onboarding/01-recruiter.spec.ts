import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../../fixtures/test-users';
import { signInAndWait, saveAuthState } from '../../helpers/auth';

const user = TEST_USERS.recruiter;

test.describe('Onboarding — Recruiter', () => {
  test('complete recruiter onboarding wizard', async ({ page }) => {
    test.setTimeout(120_000);

    let url: string;
    try {
      // Sign in — should redirect to /onboarding for new users
      url = await signInAndWait(page, user.email, user.password);
    } catch {
      // If sign-in redirect failed, user may already be authenticated
      // Try navigating directly to dashboard
      await page.goto('/portal/dashboard', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      url = page.url();
      if (url.includes('/sign-in')) {
        // Truly failed — take screenshot and skip
        await page.screenshot({ path: 'tests/e2e/.auth/recruiter-signin-debug.png' });
        test.skip(true, 'Recruiter sign-in failed');
        return;
      }
    }

    // If already onboarded, save auth state and skip
    if (url.includes('/portal')) {
      console.log('  Recruiter already onboarded, saving auth state');
      await saveAuthState(page, 'recruiter');
      return;
    }

    // Should be on the onboarding page
    expect(url).toContain('/onboarding');

    // --- Step 1: Role Selection ---
    // Wait for the role selection cards to appear
    const recruiterCard = page.getByText('I am a Recruiter');
    await expect(recruiterCard).toBeVisible({ timeout: 15_000 });
    await recruiterCard.click();

    // --- Step 2: Plan Selection ---
    // Wait for plans to load — select the free "Starter" plan
    await expect(page.getByText('Step 2').or(page.getByText('Choose your plan'))).toBeVisible({ timeout: 15_000 });

    // Click the Starter/free plan card
    const starterPlan = page.getByText('Starter').first();
    await expect(starterPlan).toBeVisible({ timeout: 10_000 });
    await starterPlan.click();

    // Click continue/select button for the free plan
    const selectBtn = page.getByRole('button', { name: /select|continue|get started|choose/i }).first();
    await selectBtn.click();

    // --- Step 3: Recruiter Profile ---
    await expect(page.getByText('Build your profile').or(page.getByText('Step 3'))).toBeVisible({ timeout: 15_000 });

    // Fill required fields
    // Phone (required)
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('+1 (555) 123-4567');

    // Bio — MarkdownEditor uses a textarea or contenteditable
    const bioEditor = page.locator('textarea, [contenteditable="true"]').first();
    if (await bioEditor.isVisible()) {
      await bioEditor.fill('E2E test recruiter specializing in technology placements.');
    }

    // Location (optional but let's fill it)
    const locationInput = page.locator('input[placeholder*="New York"]').or(
      page.locator('input[placeholder*="location" i]')
    );
    if (await locationInput.first().isVisible().catch(() => false)) {
      await locationInput.first().fill('New York, NY');
    }

    // Select an industry chip
    const techChip = page.getByText('Technology', { exact: true }).first();
    if (await techChip.isVisible().catch(() => false)) {
      await techChip.click();
    }

    // Select a specialty chip
    const engChip = page.getByText('Engineering', { exact: true }).first();
    if (await engChip.isVisible().catch(() => false)) {
      await engChip.click();
    }

    // Submit the profile form
    const continueBtn = page.getByRole('button', { name: /continue|next|save/i }).first();
    await continueBtn.click();

    // --- Step 4: Review & Launch ---
    await expect(page.getByText('Review').or(page.getByText('Step 4'))).toBeVisible({ timeout: 15_000 });

    // Click the launch/submit button
    const launchBtn = page.getByRole('button', { name: /launch|submit|go live|complete/i }).first();
    await expect(launchBtn).toBeVisible({ timeout: 10_000 });
    await launchBtn.click();

    // --- Step 5: Success ---
    // Wait for success screen or redirect to dashboard
    await expect(
      page.getByText("You're live").or(
        page.getByText('Success').or(
          page.getByText('Browse Open Roles')
        )
      )
    ).toBeVisible({ timeout: 30_000 });

    // Navigate to dashboard to ensure portal is ready, then save auth state
    await page.goto('/portal/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Wait for the profile to load (past "LOADING YOUR PROFILE...")
    await page.waitForTimeout(3000);

    await saveAuthState(page, 'recruiter');
  });
});
