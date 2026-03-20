import { test, expect } from '@playwright/test';

test.describe('Corporate Site — Contact Form', () => {
  test('submitting contact form with valid data succeeds', async ({ page }) => {
    await page.goto('/contact');

    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Select a topic
    await page.getByRole('button', { name: 'General Question' }).click();

    // Fill form fields by their IDs
    await page.locator('#name').fill('E2E Test Company');
    await page.locator('#email').fill('e2e-contact@test.splits.network');
    await page.locator('#subject').fill('E2E Automated Test');
    await page.locator('#message').fill('Automated E2E test — please ignore this submission.');

    // Submit the form
    await page.getByRole('button', { name: 'Send Message' }).click();

    // Wait for success indication (toast, redirect, or success message)
    await expect(
      page.locator('text=/thank|success|submitted|sent|received/i')
    ).toBeVisible({ timeout: 10_000 });
  });

  test('contact form validates required fields', async ({ page }) => {
    await page.goto('/contact');

    // Try submitting without filling required fields
    await page.getByRole('button', { name: 'Send Message' }).click();

    // Browser validation or custom error should prevent submission
    const invalidInputs = page.locator('input:invalid, textarea:invalid');
    const count = await invalidInputs.count();
    expect(count).toBeGreaterThan(0);
  });
});
