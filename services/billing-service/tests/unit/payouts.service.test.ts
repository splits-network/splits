import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PayoutServiceV2 } from '../../src/v2/payouts/service';
import type { AccessContext } from '../../src/v2/shared/access';

const mockStripe = vi.hoisted(() => ({
    customers: {
        create: vi.fn(),
        retrieve: vi.fn(),
        update: vi.fn(),
    },
    setupIntents: {
        create: vi.fn(),
    },
    paymentMethods: {
        attach: vi.fn(),
        retrieve: vi.fn(),
    },
    accounts: {
        create: vi.fn(),
        retrieve: vi.fn(),
        createLoginLink: vi.fn(),
    },
    accountSessions: {
        create: vi.fn(),
    },
    accountLinks: {
        create: vi.fn(),
    },
    transfers: {
        create: vi.fn(),
    },
}));

vi.mock('stripe', () => {
    return {
        default: class Stripe {
            customers = mockStripe.customers;
            setupIntents = mockStripe.setupIntents;
            paymentMethods = mockStripe.paymentMethods;
            accounts = mockStripe.accounts;
            accountSessions = mockStripe.accountSessions;
            accountLinks = mockStripe.accountLinks;
            transfers = mockStripe.transfers;
            constructor() {}
        },
    };
});

const billingAdminAccess: AccessContext = {
    identityUserId: 'user-1',
    candidateId: null,
    recruiterId: null,
    organizationIds: [],
    orgWideOrganizationIds: [],
    companyIds: [],
    roles: ['platform_admin'],
    isPlatformAdmin: true,
    error: '',
};

describe('PayoutServiceV2 (unit)', () => {
    const repository = {
        listPayouts: vi.fn(),
        findPayout: vi.fn(),
        createPayout: vi.fn(),
        updatePayout: vi.fn(),
    };
    const snapshotRepository = {
        getByPlacementId: vi.fn(),
    };
    const splitRepository = {
        getByPlacementId: vi.fn(),
        createBatch: vi.fn(),
    };
    const transactionRepository = {
        getByPlacementId: vi.fn(),
        createBatch: vi.fn(),
        getById: vi.fn(),
        updateStatus: vi.fn(),
    };
    const recruiterConnectRepository = {
        getStatus: vi.fn(),
    };
    const resolver = vi.fn();
    const publisher = { publish: vi.fn() };

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('rejects create payout without recruiter id', async () => {
        resolver.mockResolvedValue(billingAdminAccess);
        const service = new PayoutServiceV2(
            repository as any,
            snapshotRepository as any,
            splitRepository as any,
            transactionRepository as any,
            recruiterConnectRepository as any,
            resolver,
            publisher as any
        );

        await expect(service.createPayout({ recruiter_id: '', payout_amount: 100 } as any, 'clerk-1'))
            .rejects.toThrow('recruiter_id is required');
    });

    it('rejects create payout with non-positive amount', async () => {
        resolver.mockResolvedValue(billingAdminAccess);
        const service = new PayoutServiceV2(
            repository as any,
            snapshotRepository as any,
            splitRepository as any,
            transactionRepository as any,
            recruiterConnectRepository as any,
            resolver,
            publisher as any
        );

        await expect(service.createPayout({ recruiter_id: 'rec-1', payout_amount: 0 } as any, 'clerk-1'))
            .rejects.toThrow('payout_amount must be positive');
    });

    it('calculates platform remainder correctly', async () => {
        resolver.mockResolvedValue(billingAdminAccess);
        const service = new PayoutServiceV2(
            repository as any,
            snapshotRepository as any,
            splitRepository as any,
            transactionRepository as any,
            recruiterConnectRepository as any,
            resolver,
            publisher as any
        );

        const remainder = service.calculatePlatformRemainder({
            total_placement_fee: 10000,
            candidate_recruiter_rate: 30,
            company_recruiter_rate: 20,
            job_owner_rate: 10,
            candidate_sourcer_rate: 10,
            company_sourcer_rate: 10,
        } as any);

        expect(remainder).toBe(2000);
    });
});
