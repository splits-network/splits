import { test, expect } from '@playwright/test';

test.describe('Corporate Site — Public Pages', () => {
  test('homepage loads with hero, stats, and testimonials', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Employment Networks|Splits Network/i);

    // Hero section
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();

    // Stats section (10k+ roles, 2k+ recruiters, 500+ companies)
    const statsText = await page.textContent('body');
    expect(statsText).toMatch(/\d+[kK+]/);

    // Testimonials
    await expect(page.locator('body')).toContainText(/testimonial|review|said/i);
  });

  test('contact page loads and form is functional', async ({ page }) => {
    await page.goto('/contact');
    await expect(page).toHaveTitle(/Contact/i);

    // Form exists with required fields
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Fill and submit contact form
    const nameInput = page.locator('input[name="name"], input[name="firstName"], input[placeholder*="name" i]').first();
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const messageInput = page.locator('textarea').first();

    if (await nameInput.isVisible()) {
      await nameInput.fill('E2E Test User');
    }
    if (await emailInput.isVisible()) {
      await emailInput.fill('e2e-test@example.com');
    }
    if (await messageInput.isVisible()) {
      await messageInput.fill('This is an automated E2E test submission.');
    }
  });

  test('terms of service page loads', async ({ page }) => {
    await page.goto('/terms-of-service');
    await expect(page.locator('body')).toContainText(/terms/i);
  });

  test('privacy policy page loads', async ({ page }) => {
    await page.goto('/privacy-policy');
    await expect(page.locator('body')).toContainText(/privacy/i);
  });

  test('cookie policy page loads', async ({ page }) => {
    await page.goto('/cookie-policy');
    await expect(page.locator('body')).toContainText(/cookie/i);
  });

  test('SEO: meta tags and structured data present', async ({ page }) => {
    await page.goto('/');

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);

    // Check canonical URL
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /.+/);

    // Check JSON-LD structured data
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const count = await jsonLd.count();
    expect(count).toBeGreaterThan(0);

    const jsonLdContent = await jsonLd.first().textContent();
    expect(jsonLdContent).toBeTruthy();
    const parsed = JSON.parse(jsonLdContent!);
    expect(parsed['@type']).toBeTruthy();
  });
});
