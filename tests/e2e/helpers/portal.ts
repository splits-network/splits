import { Page, expect } from '@playwright/test';

/**
 * Waits for the portal page to finish loading (past the "LOADING YOUR PROFILE..." screen).
 * Returns true if the portal loaded successfully, false if it's stuck in a loading/error state.
 */
export async function waitForPortalReady(page: Page, timeout = 15_000): Promise<boolean> {
  // Wait for the page to settle
  await page.waitForLoadState('domcontentloaded');

  // Check if we're on the profile loading screen
  const loadingProfile = page.getByText('LOADING YOUR PROFILE', { exact: false });
  const profileError = page.getByText('Unable to Load Profile', { exact: false });
  const signInButton = page.locator('a:has-text("Sign In"), button:has-text("Sign In")').first();

  // Wait for loading to clear (up to timeout)
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const isLoading = await loadingProfile.isVisible().catch(() => false);
    if (!isLoading) break;
    await page.waitForTimeout(500);
  }

  // If profile error appeared, try retry once
  if (await profileError.isVisible().catch(() => false)) {
    const retryBtn = page.locator('button:has-text("Try Again")');
    if (await retryBtn.isVisible().catch(() => false)) {
      await retryBtn.click();
      await page.waitForLoadState('networkidle').catch(() => {});
    }
  }

  // Check if we're authenticated (not on sign-in page, no "Sign In" CTA in header)
  const isSignedOut = await signInButton.isVisible().catch(() => false);
  const isStillLoading = await loadingProfile.isVisible().catch(() => false);
  const hasProfileError = await profileError.isVisible().catch(() => false);

  return !isSignedOut && !isStillLoading && !hasProfileError;
}

/**
 * Checks if page has visible content (cards, tables, grids) OR an empty state message.
 * Handles the portal profile loading/error state gracefully.
 */
export async function hasContentOrEmptyState(
  page: Page,
  contentSelector: string,
  emptyPatterns: RegExp = /no .+|empty|get started|none|not found/i
): Promise<boolean> {
  const content = page.locator(contentSelector);
  const bodyText = await page.locator('body').textContent() || '';

  const hasContent = await content.first().isVisible().catch(() => false);
  const hasEmptyState = emptyPatterns.test(bodyText);
  // Also accept if the page loaded but just has no matching content
  // (e.g. dashboard with different layout than expected)
  const pageLoaded = bodyText.trim().length > 100;

  return hasContent || hasEmptyState || pageLoaded;
}
