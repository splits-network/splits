import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';

vi.mock('@supabase/supabase-js', () => ({
    createClient: () => ({}),
}));

import { FraudSignalServiceV2 } from '../../src/v2/fraud-signals/service';
import { registerFraudRoutes } from '../../src/v2/fraud-signals/routes';

describe('Fraud signals routes (integration)', () => {
    const config = {
        supabaseUrl: 'http://supabase',
        supabaseKey: 'key',
        eventPublisher: { publish: vi.fn() },
    };

    it('rejects list without user context', async () => {
        const app = Fastify();
        await registerFraudRoutes(app, config as any);

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/fraud-signals',
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).error.message).toBe('Missing x-clerk-user-id header');
    });

    it('lists signals with filters', async () => {
        const listSpy = vi.spyOn(FraudSignalServiceV2.prototype, 'listSignals')
            .mockResolvedValue({ data: [], pagination: { total: 0, page: 1, limit: 25, total_pages: 0 } } as any);
        const app = Fastify();
        await registerFraudRoutes(app, config as any);

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/fraud-signals?filters=%7B%22severity%22%3A%22high%22%7D',
            headers: { 'x-clerk-user-id': 'clerk-1' },
        });

        expect(response.statusCode).toBe(200);
        expect(listSpy).toHaveBeenCalledWith(
            'clerk-1',
            expect.objectContaining({ severity: 'high' })
        );
    });
});
