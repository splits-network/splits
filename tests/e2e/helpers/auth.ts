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

/**
 * Hide dev tool overlays (TanStack Query devtools, Next.js dev tools)
 * that intercept pointer events on the page.
 */
export async function hideDevOverlays(page: Page) {
  await page.evaluate(() => {
    // Hide TanStack Query devtools
    document.querySelectorAll('.tsqd-parent-container').forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });
    // Hide Next.js dev tools
    document.querySelectorAll('[data-nextjs-dialog-overlay]').forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });
    // Hide any floating dev buttons
    document.querySelectorAll('button:has(> svg[viewBox="0 0 633 633"])').forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });
  });
}

/**
 * Dismiss the cookie consent banner if it appears.
 * Must be called before interacting with the page to prevent click interception.
 */
export async function dismissCookieBanner(page: Page) {
  // First hide dev overlays that can intercept clicks
  await hideDevOverlays(page);

  const acceptBtn = page.locator('button:has-text("Accept All")');
  if (await acceptBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await acceptBtn.click({ force: true });
    console.log('  Dismissed cookie consent banner');
    await page.waitForTimeout(500);
  }
}

/**
 * Set up console error capturing for debugging.
 * Returns a function that retrieves captured errors.
 */
export function captureConsoleErrors(page: Page): () => string[] {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    errors.push(`PAGE ERROR: ${err.message}`);
  });
  return () => errors;
}
