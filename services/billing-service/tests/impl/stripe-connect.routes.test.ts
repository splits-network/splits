import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';
import { stripeConnectRoutes } from '../../src/v2/connect/routes';

describe('Stripe connect routes (integration)', () => {
    const service = {
        getAccountStatus: vi.fn(),
        getOrCreateAccount: vi.fn(),
        createAccountSession: vi.fn(),
        createDashboardLink: vi.fn(),
        createOnboardingLink: vi.fn(),
    };

    it('rejects account status without user context', async () => {
        const app = Fastify();
        stripeConnectRoutes(app, service as any);

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/stripe/connect/account',
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).error.message).toBe('Missing x-clerk-user-id header');
    });

    it('creates onboarding link', async () => {
        service.createOnboardingLink.mockResolvedValue({ url: 'https://onboard' });
        const app = Fastify();
        stripeConnectRoutes(app, service as any);

        const response = await app.inject({
            method: 'POST',
            url: '/api/v2/stripe/connect/onboarding-link',
            headers: {
                'x-clerk-user-id': 'clerk-1',
                'content-type': 'application/json',
            },
            payload: { return_url: 'https://return', refresh_url: 'https://refresh' },
        });

        expect(response.statusCode).toBe(200);
        expect(service.createOnboardingLink).toHaveBeenCalledWith('clerk-1', {
            return_url: 'https://return',
            refresh_url: 'https://refresh',
        });
    });
});
