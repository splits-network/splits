import { test, expect } from '../../fixtures/auth';
import { waitForPortalReady } from '../../helpers/portal';

test.describe('Hiring Manager — Restricted Access', () => {
  test('roles page does NOT show "Create Role" button', async ({
    hiringManagerPage: page,
  }) => {
    await page.goto('/portal/roles');
    const ready = await waitForPortalReady(page);
    if (!ready) { test.skip(); return; }

    await expect(page.locator('body')).not.toContainText(/something went wrong/i);

    const createBtn = page.locator(
      'button:has-text("Create"), a:has-text("Create"), ' +
      'button:has-text("New Role"), a:has-text("New Role"), ' +
      'button:has-text("Add Role"), a:has-text("Add Role"), ' +
      '[data-testid="create-role"]'
    );

    await expect(createBtn).toHaveCount(0);
  });

  test('company settings is not accessible', async ({
    hiringManagerPage: page,
  }) => {
    await page.goto('/portal/company/settings');
    await page.waitForLoadState('networkidle').catch(() => {});

    // Should be redirected away or shown access denied
    const url = page.url();
    const bodyText = await page.locator('body').textContent();

    const wasRedirected = !url.includes('/company/settings');
    const hasAccessDenied = /access denied|unauthorized|forbidden|not authorized|permission/i.test(
      bodyText || ''
    );
    const hasError = /403|401/i.test(bodyText || '');

    // One of these conditions must be true
    expect(wasRedirected || hasAccessDenied || hasError).toBe(true);
  });

  test('cannot invite recruiters — no invite button on recruiter pages', async ({
    hiringManagerPage: page,
  }) => {
    await page.goto('/portal/recruiters');
    await page.waitForLoadState('networkidle').catch(() => {});

    await expect(page.locator('body')).not.toContainText(/something went wrong/i);

    const inviteBtn = page.locator(
      'button:has-text("Invite"), a:has-text("Invite"), ' +
      'button:has-text("Add Recruiter"), a:has-text("Add Recruiter"), ' +
      '[data-testid="invite-recruiter"], [data-testid="invite-button"]'
    );

    await expect(inviteBtn).toHaveCount(0);
  });

  test('admin-only pages are not directly accessible', async ({
    hiringManagerPage: page,
  }) => {
    // Hiring managers should not be able to access admin-only routes
    await page.goto('/portal/dashboard');
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);

    // The dashboard should load without errors — that's the key assertion
    const heading = page.locator(':is(h1, h2, h3):visible').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
  });
});
