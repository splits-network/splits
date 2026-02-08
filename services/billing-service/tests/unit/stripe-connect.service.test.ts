import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StripeConnectService } from '../../src/v2/connect/service';
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

const recruiterAccess: AccessContext = {
    identityUserId: 'user-1',
    candidateId: null,
    recruiterId: 'rec-1',
    organizationIds: [],
    companyIds: [],
    roles: ['recruiter'],
    isPlatformAdmin: false,
    error: '',
};

describe('StripeConnectService (unit)', () => {
    const repository = {
        getRecruiterById: vi.fn(),
        setConnectAccount: vi.fn(),
        updateConnectStatus: vi.fn(),
    };
    const resolver = vi.fn();

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('requires recruiter access', async () => {
        resolver.mockResolvedValue({ ...recruiterAccess, recruiterId: null });
        const service = new StripeConnectService(repository as any, resolver);

        await expect(service.getAccountStatus('clerk-1'))
            .rejects.toThrow('Recruiter access required');
    });

    it('creates account when missing and returns status', async () => {
        resolver.mockResolvedValue(recruiterAccess);
        repository.getRecruiterById
            .mockResolvedValueOnce({ id: 'rec-1', stripe_connect_account_id: null })
            .mockResolvedValueOnce({ id: 'rec-1', stripe_connect_account_id: 'acct_1' });
        mockStripe.accounts.create.mockResolvedValue({ id: 'acct_1' });
        mockStripe.accounts.retrieve.mockResolvedValue({
            id: 'acct_1',
            charges_enabled: true,
            payouts_enabled: true,
            details_submitted: true,
            requirements: {},
        });

        const service = new StripeConnectService(repository as any, resolver);
        const status = await service.getOrCreateAccount('clerk-1');

        expect(repository.setConnectAccount).toHaveBeenCalledWith('rec-1', 'acct_1');
        expect(status.onboarded).toBe(true);
    });

    it('updates onboarded status when changed', async () => {
        resolver.mockResolvedValue(recruiterAccess);
        repository.getRecruiterById.mockResolvedValue({
            id: 'rec-1',
            stripe_connect_account_id: 'acct_1',
            stripe_connect_onboarded: false,
        });
        mockStripe.accounts.retrieve.mockResolvedValue({
            id: 'acct_1',
            charges_enabled: true,
            payouts_enabled: true,
            details_submitted: true,
            requirements: {},
        });

        const service = new StripeConnectService(repository as any, resolver);
        const status = await service.getAccountStatus('clerk-1');

        expect(status.onboarded).toBe(true);
        expect(repository.updateConnectStatus).toHaveBeenCalledWith(
            'rec-1',
            true,
            expect.any(String)
        );
    });

    it('creates onboarding link', async () => {
        resolver.mockResolvedValue(recruiterAccess);
        repository.getRecruiterById
            .mockResolvedValueOnce({ id: 'rec-1', stripe_connect_account_id: null })
            .mockResolvedValueOnce({ id: 'rec-1', stripe_connect_account_id: 'acct_1' });
        mockStripe.accounts.create.mockResolvedValue({ id: 'acct_1' });
        mockStripe.accounts.retrieve.mockResolvedValue({
            id: 'acct_1',
            charges_enabled: false,
            payouts_enabled: false,
            details_submitted: false,
            requirements: {},
        });
        mockStripe.accountLinks.create.mockResolvedValue({ url: 'https://onboard' });

        const service = new StripeConnectService(repository as any, resolver);
        const link = await service.createOnboardingLink('clerk-1', {
            return_url: 'https://return',
            refresh_url: 'https://refresh',
        });

        expect(link.url).toBe('https://onboard');
    });
});
