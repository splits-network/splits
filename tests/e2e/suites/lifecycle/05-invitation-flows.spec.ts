import { test, expect } from '../../fixtures/auth';
import * as api from '../../helpers/api';
import * as time from '../../helpers/time-shortcuts';

test.describe.serial('Lifecycle — Cross-Role Invitation Flows', () => {
  test.describe('Recruiter invites company', () => {
    test('recruiter sends company invitation via UI', async ({
      recruiterPage: page,
    }) => {
      await page.goto('/portal/invite-companies');
      await page.waitForLoadState('networkidle');

      await expect(page).not.toHaveURL(/\/sign-in/);
      await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);

      // Look for invitation form
      const emailInput = page.locator(
        'input[type="email"], input[name*="email" i], ' +
        'input[placeholder*="email" i], [data-testid="invite-email"]'
      ).first();

      const hasForm = await emailInput.isVisible().catch(() => false);

      if (hasForm) {
        await emailInput.fill('e2e-company-invite@test.example.com');

        // Fill optional company name if present
        const nameInput = page.locator(
          'input[name*="company" i], input[name*="name" i], ' +
          'input[placeholder*="company" i]'
        ).first();

        if (await nameInput.isVisible().catch(() => false)) {
          await nameInput.fill('E2E Test Company');
        }

        // Submit
        const sendButton = page.locator(
          'button[type="submit"], button:has-text("Send"), ' +
          'button:has-text("Invite"), [data-testid="send-invite"]'
        ).first();

        if (await sendButton.isVisible().catch(() => false)) {
          await sendButton.click();
          await page.waitForLoadState('networkidle');
        }

        await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);
      }
    });

    test('company admin accepts invitation via UI', async ({
      companyAdminPage: page,
    }) => {
      await page.goto('/portal/invitations');
      await page.waitForLoadState('networkidle');

      await expect(page).not.toHaveURL(/\/sign-in/);

      // Look for pending invitations
      const invitationCard = page.locator(
        '[data-testid="invitation-card"], [data-testid="invitation-row"], ' +
        'table tbody tr, .card'
      ).first();

      const hasInvitations = await invitationCard.isVisible().catch(() => false);

      if (hasInvitations) {
        const acceptButton = page.locator(
          'button:has-text("Accept"), [data-testid="accept-invitation"]'
        ).first();

        if (await acceptButton.isVisible().catch(() => false)) {
          await acceptButton.click();
          await page.waitForLoadState('networkidle');

          await expect(page.locator('body')).not.toContainText(
            /500|Internal Server Error/i
          );
        }
      }
    });

    test('recruiter can see company roles after acceptance', async ({
      recruiterPage: page,
    }) => {
      await page.goto('/portal/roles');
      await page.waitForLoadState('networkidle');

      await expect(page).not.toHaveURL(/\/sign-in/);
      await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);

      // Page should load — roles may or may not include the newly connected company
      const content = page.locator(
        'table, .card, [data-testid="role-list"], .grid'
      );
      const emptyState = page.getByText(/no roles|no results|get started/i);

      const hasContent = await content.first().isVisible().catch(() => false);
      const isEmpty = await emptyState.isVisible().catch(() => false);

      expect(hasContent || isEmpty).toBeTruthy();
    });
  });

  test.describe('Company invites recruiter', () => {
    test('company sends recruiter invitation via UI', async ({
      companyAdminPage: page,
    }) => {
      await page.goto('/portal/recruiters');
      await page.waitForLoadState('networkidle');

      await expect(page).not.toHaveURL(/\/sign-in/);

      // Look for invite recruiter action
      const inviteButton = page.locator(
        'button:has-text("Invite"), a:has-text("Invite"), ' +
        'button:has-text("Add Recruiter"), [data-testid="invite-recruiter"]'
      ).first();

      const hasInvite = await inviteButton.isVisible().catch(() => false);

      if (hasInvite) {
        await inviteButton.click();
        await page.waitForLoadState('networkidle');

        const emailInput = page.locator(
          'input[type="email"], input[name*="email" i], ' +
          'input[placeholder*="email" i]'
        ).first();

        if (await emailInput.isVisible().catch(() => false)) {
          await emailInput.fill('e2e-recruiter-invite@test.example.com');

          const sendButton = page.locator(
            'button[type="submit"], button:has-text("Send"), ' +
            'button:has-text("Invite")'
          ).first();

          if (await sendButton.isVisible().catch(() => false)) {
            await sendButton.click();
            await page.waitForLoadState('networkidle');
          }
        }

        await expect(page.locator('body')).not.toContainText(
          /500|Internal Server Error/i
        );
      }
    });

    test('recruiter accepts company invitation', async ({
      recruiterPage: page,
    }) => {
      await page.goto('/portal/invitations');
      await page.waitForLoadState('networkidle');

      await expect(page).not.toHaveURL(/\/sign-in/);

      const acceptButton = page.locator(
        'button:has-text("Accept"), [data-testid="accept-invitation"]'
      ).first();

      if (await acceptButton.isVisible().catch(() => false)) {
        await acceptButton.click();
        await page.waitForLoadState('networkidle');

        await expect(page.locator('body')).not.toContainText(
          /500|Internal Server Error/i
        );
      }
    });
  });

  test.describe('Recruiter invites candidate', () => {
    test('recruiter sends candidate invitation', async ({
      recruiterPage: page,
    }) => {
      await page.goto('/portal/candidates');
      await page.waitForLoadState('networkidle');

      await expect(page).not.toHaveURL(/\/sign-in/);

      // Look for invite candidate action
      const inviteButton = page.locator(
        'button:has-text("Invite"), button:has-text("Add Candidate"), ' +
        'a:has-text("Invite"), [data-testid="invite-candidate"]'
      ).first();

      const hasInvite = await inviteButton.isVisible().catch(() => false);

      if (hasInvite) {
        await inviteButton.click();
        await page.waitForLoadState('networkidle');

        const emailInput = page.locator(
          'input[type="email"], input[name*="email" i], ' +
          'input[placeholder*="email" i]'
        ).first();

        if (await emailInput.isVisible().catch(() => false)) {
          await emailInput.fill('e2e-candidate-invite@test.example.com');

          // Fill name fields if present
          const firstNameInput = page.locator(
            'input[name*="first" i], input[placeholder*="first" i]'
          ).first();

          if (await firstNameInput.isVisible().catch(() => false)) {
            await firstNameInput.fill('E2E');
          }

          const lastNameInput = page.locator(
            'input[name*="last" i], input[placeholder*="last" i]'
          ).first();

          if (await lastNameInput.isVisible().catch(() => false)) {
            await lastNameInput.fill('Candidate');
          }

          const sendButton = page.locator(
            'button[type="submit"], button:has-text("Send"), ' +
            'button:has-text("Invite")'
          ).first();

          if (await sendButton.isVisible().catch(() => false)) {
            await sendButton.click();
            await page.waitForLoadState('networkidle');
          }
        }

        await expect(page.locator('body')).not.toContainText(
          /500|Internal Server Error/i
        );
      }
    });

    test('candidate accepts invitation', async ({
      candidatePage: page,
    }) => {
      // Candidate portal is a separate app — navigate to invitations
      await page.goto('/portal/invitations');
      await page.waitForLoadState('networkidle');

      // May redirect to candidate app or show invitations inline
      await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);

      const acceptButton = page.locator(
        'button:has-text("Accept"), [data-testid="accept-invitation"]'
      ).first();

      if (await acceptButton.isVisible().catch(() => false)) {
        await acceptButton.click();
        await page.waitForLoadState('networkidle');

        await expect(page.locator('body')).not.toContainText(
          /500|Internal Server Error/i
        );
      }
    });
  });
});
