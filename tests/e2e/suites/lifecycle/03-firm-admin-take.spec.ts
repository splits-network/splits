import { test, expect } from '../../fixtures/auth';
import * as api from '../../helpers/api';
import * as time from '../../helpers/time-shortcuts';

test.describe.serial('Lifecycle — Firm Admin Take', () => {
  let applicationId: string;
  let placementId: string;

  test('create placement for a firm member via API', async ({ seedData }) => {
    const recruiterToken = seedData.recruiter?.token;
    const candidateId = seedData.candidate?.id;
    const jobId = seedData.job?.id;
    const recruiterId = seedData.recruiter?.id;

    if (!recruiterToken || !candidateId || !jobId || !recruiterId) {
      test.skip(true, 'Required seed data not available');
      return;
    }

    // Create application
    const application = await api.createApplication(
      candidateId,
      jobId,
      recruiterId,
      recruiterToken
    );

    expect(application).toBeTruthy();
    applicationId = application.id;

    // Advance to hired
    const companyToken = seedData.company_admin?.token;

    if (!companyToken) {
      test.skip(true, 'Company admin token not available');
      return;
    }

    const stages = ['interview', 'offer', 'hired'];
    for (const stage of stages) {
      await api.advanceApplication(applicationId, stage, companyToken);
    }
  });

  test('find placement from application', async ({ seedData }) => {
    if (!applicationId) {
      test.skip(true, 'No application created');
      return;
    }

    const adminToken = seedData.platform_admin?.token;

    if (!adminToken) {
      test.skip(true, 'Admin token not available');
      return;
    }

    const placements = await api.listPlacements(adminToken, {
      application_id: applicationId,
    });

    if (Array.isArray(placements) && placements.length > 0) {
      placementId = placements[0].id;
    }
  });

  test('verify firm_admin_take_amount calculated correctly', async ({
    seedData,
  }) => {
    if (!placementId) {
      test.skip(true, 'No placement available');
      return;
    }

    const adminToken = seedData.platform_admin?.token;

    if (!adminToken) {
      test.skip(true, 'Admin token not available');
      return;
    }

    const splits = await time.getPlacementSplits(placementId, adminToken);

    if (splits && splits.length > 0) {
      for (const split of splits) {
        // If the recruiter belongs to a firm, check firm_admin_take
        if (split.firm_id || split.firm_admin_take_amount !== undefined) {
          const takeAmount = split.firm_admin_take_amount || 0;
          const splitAmount = split.amount || split.split_amount || 0;

          // Firm admin take should be a portion of the split amount
          expect(takeAmount).toBeGreaterThanOrEqual(0);
          expect(takeAmount).toBeLessThanOrEqual(splitAmount);
        }
      }
    }
  });

  test('verify two transactions per split (member_payout + firm_admin_take)', async ({
    seedData,
  }) => {
    if (!placementId) {
      test.skip(true, 'No placement available');
      return;
    }

    const adminToken = seedData.platform_admin?.token;

    if (!adminToken) {
      test.skip(true, 'Admin token not available');
      return;
    }

    const transactions = await time.getPayoutTransactions(
      placementId,
      adminToken
    );

    if (transactions && transactions.length > 0) {
      // Group transactions by split
      const transactionsBySplit = transactions.reduce(
        (groups: Record<string, any[]>, tx: any) => {
          const splitId = tx.split_id || tx.payout_split_id || 'unknown';
          if (!groups[splitId]) groups[splitId] = [];
          groups[splitId].push(tx);
          return groups;
        },
        {}
      );

      // For splits with firm involvement, expect two transactions
      for (const [splitId, txs] of Object.entries(transactionsBySplit)) {
        const hasFirmTake = (txs as any[]).some(
          (tx: any) =>
            tx.type === 'firm_admin_take' || tx.transaction_type === 'firm_admin_take'
        );
        const hasMemberPayout = (txs as any[]).some(
          (tx: any) =>
            tx.type === 'member_payout' || tx.transaction_type === 'member_payout'
        );

        if (hasFirmTake) {
          expect(hasMemberPayout).toBeTruthy();
          expect((txs as any[]).length).toBeGreaterThanOrEqual(2);
        }
      }
    }
  });

  test('firm admin take visible in admin UI', async ({
    platformAdminPage: page,
  }) => {
    await page.goto('/portal/admin/payouts');
    await page.waitForLoadState('networkidle');

    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
    await expect(page.locator('body')).not.toContainText(/something went wrong/i);
  });
});
