import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';

vi.mock('@supabase/supabase-js', () => ({
    createClient: () => ({}),
}));

import { AutomationRuleServiceV2 } from '../../src/v2/rules/service';
import { registerRuleRoutes } from '../../src/v2/rules/routes';

describe('Automation rules routes (integration)', () => {
    const config = {
        supabaseUrl: 'http://supabase',
        supabaseKey: 'key',
        eventPublisher: { publish: vi.fn() },
    };

    it('rejects list without user context', async () => {
        const app = Fastify();
        await registerRuleRoutes(app, config as any);

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/automation-rules',
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).error.message).toBe('Missing x-clerk-user-id header');
    });

    it('lists rules with filters', async () => {
        const listSpy = vi.spyOn(AutomationRuleServiceV2.prototype, 'listRules')
            .mockResolvedValue({ data: [], pagination: { total: 0, page: 1, limit: 25, total_pages: 0 } } as any);
        const app = Fastify();
        await registerRuleRoutes(app, config as any);

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/automation-rules?filters=%7B%22status%22%3A%22active%22%7D',
            headers: { 'x-clerk-user-id': 'clerk-1' },
        });

        expect(response.statusCode).toBe(200);
        expect(listSpy).toHaveBeenCalledWith(
            'clerk-1',
            expect.objectContaining({ status: 'active' })
        );
    });
});
