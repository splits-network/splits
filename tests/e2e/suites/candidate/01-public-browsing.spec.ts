import { test, expect } from '@playwright/test';

test.describe('Candidate — Public Browsing', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('job listing page loads with grid view', async ({ page }) => {
    await page.goto('/jobs');
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);

    // Page should render with a heading
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
  });

  test('view switching between Grid and Table', async ({ page }) => {
    await page.goto('/jobs');

    const viewButtons = page.locator(
      'button:has-text("Grid"), button:has-text("Table"), ' +
      '[data-testid="view-toggle"], [aria-label*="view"]'
    );

    const count = await viewButtons.count();
    if (count > 1) {
      await viewButtons.nth(1).click();
      await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);

      await viewButtons.nth(0).click();
      await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
    }
  });

  test('filter by employment type if visible', async ({ page }) => {
    await page.goto('/jobs');

    const employmentFilter = page.locator(
      'select:has(option:text("Full")), [data-testid="employment-filter"], ' +
      'button:has-text("Employment"), button:has-text("Type"), ' +
      '[placeholder*="type" i]'
    );

    if (await employmentFilter.first().isVisible().catch(() => false)) {
      await employmentFilter.first().click();
      await page.waitForTimeout(300);
      await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
    }
  });

  test('click a job card to view detail page', async ({ page }) => {
    await page.goto('/jobs');

    const jobLink = page.locator(
      'a[href*="/jobs/"], [data-testid="job-card"] a, .card a'
    );

    if (await jobLink.first().isVisible().catch(() => false)) {
      await jobLink.first().click();
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
      // Should have navigated to a detail page
      await expect(page).toHaveURL(/\/jobs\/.+/);
    }
  });

  test('recruiter marketplace loads', async ({ page }) => {
    await page.goto('/marketplace');
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('firm directory loads', async ({ page }) => {
    await page.goto('/firms');
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('interview prep resource page loads', async ({ page }) => {
    await page.goto('/resources/interview-prep');
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('privacy policy page loads', async ({ page }) => {
    await page.goto('/privacy-policy');
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
    await expect(page.locator('body')).toContainText(/privacy/i);
  });
});
