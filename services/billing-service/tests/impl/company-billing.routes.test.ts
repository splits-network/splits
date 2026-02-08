import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';
import { companyBillingProfileRoutes } from '../../src/v2/company-billing/routes';

describe('Company billing routes (integration)', () => {
    const service = {
        list: vi.fn(),
        getByCompanyId: vi.fn(),
        upsert: vi.fn(),
        update: vi.fn(),
        createSetupIntent: vi.fn(),
        getPaymentMethod: vi.fn(),
        updatePaymentMethod: vi.fn(),
        getBillingReadiness: vi.fn(),
    };

    it('rejects list without user context', async () => {
        const app = Fastify();
        companyBillingProfileRoutes(app, service as any);

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/company-billing-profiles',
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).error.message).toBe('Missing x-clerk-user-id header');
    });

    it('lists billing profiles with pagination', async () => {
        service.list.mockResolvedValue({ data: [], pagination: { total: 0 } });
        const app = Fastify();
        companyBillingProfileRoutes(app, service as any);

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/company-billing-profiles?page=2&limit=10',
            headers: { 'x-clerk-user-id': 'clerk-1' },
        });

        expect(response.statusCode).toBe(200);
        expect(service.list).toHaveBeenCalledWith('clerk-1', 2, 10);
    });

    it('updates payment method', async () => {
        service.updatePaymentMethod.mockResolvedValue({ success: true });
        const app = Fastify();
        companyBillingProfileRoutes(app, service as any);

        const response = await app.inject({
            method: 'POST',
            url: '/api/v2/company-billing-profiles/company-1/payment-method',
            headers: {
                'x-clerk-user-id': 'clerk-1',
                'content-type': 'application/json',
            },
            payload: { payment_method_id: 'pm_1' },
        });

        expect(response.statusCode).toBe(200);
        expect(service.updatePaymentMethod).toHaveBeenCalledWith('company-1', 'pm_1', 'clerk-1');
    });
});
