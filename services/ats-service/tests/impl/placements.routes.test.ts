import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import { registerPlacementRoutes } from '../../src/v2/placements/routes';

describe('Placement routes (integration)', () => {
    let service: any;

    beforeEach(() => {
        vi.restoreAllMocks();
        service = {
            getPlacements: vi.fn().mockResolvedValue({ data: [], pagination: { total: 0, page: 1, limit: 25, total_pages: 0 } }),
            getPlacement: vi.fn().mockResolvedValue({ id: 'pl-1' }),
            createPlacement: vi.fn().mockResolvedValue({ id: 'pl-1' }),
            updatePlacement: vi.fn().mockResolvedValue({ id: 'pl-1' }),
            deletePlacement: vi.fn().mockResolvedValue(undefined),
        };
    });

    it('rejects list without user context', async () => {
        const app = Fastify();
        registerPlacementRoutes(app, { placementService: service });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/placements',
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).error.message).toBe('Missing x-clerk-user-id header');
    });

    it('creates placement requires auth', async () => {
        const app = Fastify();
        registerPlacementRoutes(app, { placementService: service });

        const response = await app.inject({
            method: 'POST',
            url: '/api/v2/placements',
            payload: { job_id: 'job-1', candidate_id: 'cand-1' },
        });

        expect(response.statusCode).toBe(400);
    });
});
