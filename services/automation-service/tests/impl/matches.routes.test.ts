import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';

vi.mock('@supabase/supabase-js', () => ({
    createClient: () => ({}),
}));

import { CandidateMatchServiceV2 } from '../../src/v2/matches/service';
import { registerMatchRoutes } from '../../src/v2/matches/routes';

describe('Matches routes (integration)', () => {
    const config = {
        supabaseUrl: 'http://supabase',
        supabaseKey: 'key',
        eventPublisher: { publish: vi.fn() },
    };

    it('rejects list without user context', async () => {
        const app = Fastify();
        await registerMatchRoutes(app, config as any);

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/matches',
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).error.message).toBe('Missing x-clerk-user-id header');
    });

    it('lists matches with filters', async () => {
        const listSpy = vi.spyOn(CandidateMatchServiceV2.prototype, 'listMatches')
            .mockResolvedValue({ data: [], pagination: { total: 0, page: 1, limit: 25, total_pages: 0 } } as any);
        const app = Fastify();
        await registerMatchRoutes(app, config as any);

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/matches?filters=%7B%22status%22%3A%22pending%22%7D',
            headers: { 'x-clerk-user-id': 'clerk-1' },
        });

        expect(response.statusCode).toBe(200);
        expect(listSpy).toHaveBeenCalledWith(
            'clerk-1',
            expect.objectContaining({ filters: { status: 'pending' } })
        );
    });
});
