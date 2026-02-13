import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompanyBillingProfileService } from '../../src/v2/company-billing/service';
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
    roles: ['company_admin'],
    isPlatformAdmin: false,
    error: '',
};

describe('CompanyBillingProfileService (unit)', () => {
    const repository = {
        getByCompanyId: vi.fn(),
        list: vi.fn(),
        upsert: vi.fn(),
        update: vi.fn(),
    };
    const resolver = vi.fn();
    const publisher = { publish: vi.fn() };

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('rejects access without billing admin role', async () => {
        resolver.mockResolvedValue({ ...billingAdminAccess, roles: [], isPlatformAdmin: false });
        const service = new CompanyBillingProfileService(repository as any, resolver);

        await expect(service.list('clerk-1')).rejects.toThrow('Insufficient permissions');
    });

    it('requires billing_email on upsert', async () => {
        resolver.mockResolvedValue(billingAdminAccess);
        const service = new CompanyBillingProfileService(repository as any, resolver);

        await expect(
            service.upsert('company-1', { billing_email: '' } as any, 'clerk-1')
        ).rejects.toThrow('billing_email is required');
    });

    it('returns existing profile if stripe customer already present', async () => {
        resolver.mockResolvedValue(billingAdminAccess);
        const profile = {
            company_id: 'company-1',
            billing_email: 'billing@example.com',
            stripe_customer_id: 'cus_123',
        };
        const service = new CompanyBillingProfileService(repository as any, resolver);

        const result = await service.ensureStripeCustomer(profile as any);

        expect(result).toBe(profile);
        expect(mockStripe.customers.create).not.toHaveBeenCalled();
    });

    it('creates setup intent after ensuring stripe customer', async () => {
        resolver.mockResolvedValue(billingAdminAccess);
        repository.getByCompanyId.mockResolvedValue({
            company_id: 'company-1',
            billing_email: 'billing@example.com',
        });
        repository.update.mockResolvedValue({
            company_id: 'company-1',
            billing_email: 'billing@example.com',
            stripe_customer_id: 'cus_123',
        });
        mockStripe.customers.create.mockResolvedValue({ id: 'cus_123' });
        mockStripe.setupIntents.create.mockResolvedValue({ client_secret: 'secret' });

        const service = new CompanyBillingProfileService(repository as any, resolver);

        const result = await service.createSetupIntent('company-1', 'clerk-1');

        expect(result).toEqual({ client_secret: 'secret', customer_id: 'cus_123' });
    });

    it('updates payment method and publishes completion event', async () => {
        resolver.mockResolvedValue(billingAdminAccess);
        repository.getByCompanyId
            .mockResolvedValueOnce({
                company_id: 'company-1',
                billing_email: 'billing@example.com',
                stripe_customer_id: 'cus_123',
            })
            .mockResolvedValueOnce({
                company_id: 'company-1',
                billing_email: 'billing@example.com',
                stripe_customer_id: 'cus_123',
                billing_terms: 'immediate',
            });
        repository.update.mockResolvedValue({
            company_id: 'company-1',
            stripe_default_payment_method_id: 'pm_1',
        });
        mockStripe.paymentMethods.attach.mockResolvedValue({});
        mockStripe.customers.update.mockResolvedValue({});
        mockStripe.paymentMethods.retrieve.mockResolvedValue({
            id: 'pm_1',
            type: 'card',
            card: { brand: 'visa', last4: '4242', exp_month: 1, exp_year: 2030 },
        });

        const service = new CompanyBillingProfileService(
            repository as any,
            resolver,
            publisher as any
        );

        const result = await service.updatePaymentMethod('company-1', 'pm_1', 'clerk-1');

        expect(result.success).toBe(true);
        expect(result.payment_method.display_label).toContain('Visa');
        expect(publisher.publish).toHaveBeenCalledWith(
            'company.billing_profile_completed',
            expect.objectContaining({
                company_id: 'company-1',
                stripe_customer_id: 'cus_123',
                billing_email: 'billing@example.com',
                has_payment_method: true,
            })
        );
    });
});
