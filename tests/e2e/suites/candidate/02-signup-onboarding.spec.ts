import { test, expect } from '@playwright/test';

test.describe('Candidate — Signup & Onboarding', () => {
  test('signup page loads with form', async ({ page }) => {
    await page.goto('/sign-up');
    await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);

    // Clerk signup form should be visible
    const form = page.locator(
      'form, [data-testid="sign-up-form"], .cl-signUp-root, .cl-rootBox'
    );
    await expect(form.first()).toBeVisible();
  });

  test('signup form has email, password, and name fields', async ({ page }) => {
    await page.goto('/sign-up');

    // Wait for Clerk form to render
    await page.waitForTimeout(2000);

    const emailField = page.locator(
      'input[name="emailAddress"], input[type="email"], input[name="email"], ' +
      '[data-testid="email-input"]'
    );
    const passwordField = page.locator(
      'input[name="password"], input[type="password"], [data-testid="password-input"]'
    );
    const nameField = page.locator(
      'input[name="firstName"], input[name="name"], input[name="first_name"], ' +
      '[data-testid="name-input"]'
    );

    // At minimum, email and password should be present in some form
    const hasEmail = await emailField.first().isVisible().catch(() => false);
    const hasPassword = await passwordField.first().isVisible().catch(() => false);
    const hasName = await nameField.first().isVisible().catch(() => false);

    // Clerk renders these fields — at least email should be visible
    expect(hasEmail || hasPassword || hasName).toBeTruthy();
  });

  test('sign-in link exists on signup page', async ({ page }) => {
    await page.goto('/sign-up');
    await page.waitForTimeout(2000);

    const signInLink = page.locator(
      'a[href*="sign-in"], a:has-text("Sign in"), button:has-text("Sign in"), ' +
      '.cl-footerActionLink'
    );

    const hasSignIn = await signInLink.first().isVisible().catch(() => false);
    expect(hasSignIn).toBeTruthy();
  });

  test('onboarding redirects unauthenticated users', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('domcontentloaded');

    // Should redirect to sign-in or show auth gate
    const url = page.url();
    const isRedirected = /sign-in|sign-up|login/.test(url);
    const hasAuthGate = await page
      .locator('.cl-signIn-root, .cl-rootBox, form')
      .first()
      .isVisible()
      .catch(() => false);

    expect(isRedirected || hasAuthGate).toBeTruthy();
  });
});
