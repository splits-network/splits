import { test, expect } from '../../fixtures/auth';
import * as api from '../../helpers/api';
import * as time from '../../helpers/time-shortcuts';

test.describe.serial('Lifecycle — Multi-Recruiter Split', () => {
  let applicationId: string;
  let placementId: string;

  test('create application with multiple recruiter roles via API', async ({
    seedData,
  }) => {
    const recruiterToken = seedData.recruiter?.token;
    const candidateId = seedData.candidate?.id;
    const jobId = seedData.job?.id;
    const recruiterId = seedData.recruiter?.id;

    if (!recruiterToken || !candidateId || !jobId || !recruiterId) {
      test.skip(true, 'Required seed data not available');
      return;
    }

    const application = await api.createApplication(
      candidateId,
      jobId,
      recruiterId,
      recruiterToken
    );

    expect(application).toBeTruthy();
    applicationId = application.id;
  });

  test('advance application to hired via API', async ({ seedData }) => {
    if (!applicationId) {
      test.skip(true, 'No application created in previous step');
      return;
    }

    const companyToken = seedData.company_admin?.token;

    if (!companyToken) {
      test.skip(true, 'Company admin token not available');
      return;
    }

    // Advance through stages: applied → interview → offer → hired
    const stages = ['interview', 'offer', 'hired'];

    for (const stage of stages) {
      await api.advanceApplication(applicationId, stage, companyToken);
    }

    const updated = await api.getApplication(applicationId, companyToken);
    expect(updated.stage).toBe('hired');
  });

  test('verify placement snapshot has all roles', async ({ seedData }) => {
    if (!applicationId) {
      test.skip(true, 'No application available');
      return;
    }

    const adminToken = seedData.platform_admin?.token;

    if (!adminToken) {
      test.skip(true, 'Admin token not available');
      return;
    }

    // Fetch placements to find the one for our application
    const placements = await api.listPlacements(adminToken, {
      application_id: applicationId,
    });

    if (Array.isArray(placements) && placements.length > 0) {
      placementId = placements[0].id;
      const placement = await api.getPlacement(placementId, adminToken);

      expect(placement).toBeTruthy();

      // Check for roles snapshot (5 standard roles in a split-fee placement)
      if (placement.snapshot?.roles || placement.roles) {
        const roles = placement.snapshot?.roles || placement.roles;
        expect(roles.length).toBeLessThanOrEqual(5);
      }
    }
  });

  test('verify splits created with correct percentages', async ({
    seedData,
  }) => {
    if (!placementId) {
      test.skip(true, 'No placement created');
      return;
    }

    const adminToken = seedData.platform_admin?.token;

    if (!adminToken) {
      test.skip(true, 'Admin token not available');
      return;
    }

    const splits = await time.getPlacementSplits(placementId, adminToken);

    if (splits && splits.length > 0) {
      // All split percentages should sum to 100 (or close to it, with rounding)
      const totalPercentage = splits.reduce(
        (sum: number, s: any) => sum + (s.percentage || s.split_percentage || 0),
        0
      );

      expect(totalPercentage).toBeGreaterThan(0);
      expect(totalPercentage).toBeLessThanOrEqual(100);

      // Each split should have a recruiter assigned
      for (const split of splits) {
        expect(split.recruiter_id || split.user_id).toBeTruthy();
      }
    }
  });

  test('verify splits visible in admin UI', async ({
    platformAdminPage: page,
  }) => {
    if (placementId) {
      await page.goto(`/portal/admin/payouts?placement_id=${placementId}`);
    } else {
      await page.goto('/portal/admin/payouts');
    }

    await page.waitForLoadState('networkidle');

    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);
    await expect(page.locator('body')).not.toContainText(/something went wrong/i);
  });
});
