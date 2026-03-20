import { Page } from '@playwright/test';
import path from 'path';

const AUTH_DIR = path.join(__dirname, '..', '.auth');

/**
 * Signs in a user on the portal sign-in page.
 * The portal uses a custom Clerk-powered form with React controlled inputs.
 * Must wait for Clerk to load (submit button becomes enabled) before filling.
 */
export async function signInPortal(page: Page, email: string, password: string) {
  await page.goto('/sign-in', { waitUntil: 'domcontentloaded' });

  // Wait for the sign-in form to render and Clerk to load
  // The submit button is disabled until Clerk isLoaded=true
  const submitBtn = page.locator('button[type="submit"]:has-text("Sign In")');
  await submitBtn.waitFor({ timeout: 20_000 });

  // Wait until the button is enabled (Clerk loaded)
  await page.waitForFunction(() => {
    const btn = document.querySelector('button[type="submit"]');
    return btn && !btn.hasAttribute('disabled');
  }, { timeout: 15_000 });

  // Fill email field — scoped to main content area to avoid matching newsletter form in footer
  const emailInput = page.getByRole('main').locator('input[type="email"]');
  await emailInput.fill(email);

  // Fill password field
  const passwordInput = page.getByRole('main').locator('input[type="password"]');
  await passwordInput.fill(password);

  // Small delay for React state to sync
  await page.waitForTimeout(200);

  // Click submit
  await submitBtn.click();
}

/**
 * Signs in and waits for redirect to portal or onboarding.
 * Returns the URL after sign-in so the caller knows where they ended up.
 */
export async function signInAndWait(page: Page, email: string, password: string): Promise<string> {
  await signInPortal(page, email, password);

  // Wait for redirect — could go to /portal/** or /onboarding
  await page.waitForURL(url => {
    const p = url.pathname;
    return p.startsWith('/portal') || p.startsWith('/onboarding');
  }, { timeout: 60_000 });

  return page.url();
}

/**
 * Saves the current browser context's auth state (cookies + localStorage)
 * for a given role, so subsequent test suites can reuse it.
 */
export async function saveAuthState(page: Page, role: string) {
  const storagePath = path.join(AUTH_DIR, `${role}.json`);
  await page.context().storageState({ path: storagePath });
  console.log(`  Saved auth state for: ${role}`);
}
