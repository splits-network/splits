import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../../fixtures/test-users';
import { signInAndWait, saveAuthState } from '../../helpers/auth';

const user = TEST_USERS.second_recruiter;

test.describe('Onboarding — Second Recruiter', () => {
  test('complete second recruiter onboarding wizard', async ({ page }) => {
    const url = await signInAndWait(page, user.email, user.password);

    if (url.includes('/portal')) {
      console.log('  Second recruiter already onboarded, saving auth state');
      await saveAuthState(page, 'second_recruiter');
      return;
    }

    expect(url).toContain('/onboarding');

    // --- Step 1: Role Selection ---
    const recruiterCard = page.getByText('I am a Recruiter');
    await expect(recruiterCard).toBeVisible({ timeout: 15_000 });
    await recruiterCard.click();

    // --- Step 2: Plan Selection --- select free Starter plan
    await expect(page.getByText('Step 2').or(page.getByText('Choose your plan'))).toBeVisible({ timeout: 15_000 });
    const starterPlan = page.getByText('Starter').first();
    await expect(starterPlan).toBeVisible({ timeout: 10_000 });
    await starterPlan.click();

    const selectBtn = page.getByRole('button', { name: /select|continue|get started|choose/i }).first();
    await selectBtn.click();

    // --- Step 3: Recruiter Profile ---
    await expect(page.getByText('Build your profile').or(page.getByText('Step 3'))).toBeVisible({ timeout: 15_000 });

    await page.locator('input[type="tel"]').fill('+1 (555) 222-3333');

    const bioEditor = page.locator('textarea, [contenteditable="true"]').first();
    if (await bioEditor.isVisible()) {
      await bioEditor.fill('Second E2E test recruiter for multi-recruiter tests.');
    }

    const continueBtn = page.getByRole('button', { name: /continue|next|save/i }).first();
    await continueBtn.click();

    // --- Step 4: Review & Launch ---
    await expect(page.getByText('Review').or(page.getByText('Step 4'))).toBeVisible({ timeout: 15_000 });

    const launchBtn = page.getByRole('button', { name: /launch|submit|go live|complete/i }).first();
    await expect(launchBtn).toBeVisible({ timeout: 10_000 });
    await launchBtn.click();

    // --- Step 5: Success ---
    await expect(
      page.getByText("You're live").or(
        page.getByText('Success').or(page.getByText('Browse Open Roles'))
      )
    ).toBeVisible({ timeout: 30_000 });

    await page.goto('/portal/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    await saveAuthState(page, 'second_recruiter');
  });
});
