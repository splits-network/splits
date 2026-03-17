import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import { companySourcerRoutes } from '../../src/v2/company-sourcers/routes';

describe('Company sourcer routes (integration)', () => {
    let service: any;

    beforeEach(() => {
        vi.restoreAllMocks();
        service = {
            list: vi.fn().mockResolvedValue({ data: [], pagination: { total: 0, page: 1, limit: 25, total_pages: 0 } }),
            get: vi.fn().mockResolvedValue({ id: 'cs-1' }),
            update: vi.fn().mockResolvedValue({ id: 'cs-1' }),
            checkProtection: vi.fn().mockResolvedValue({ has_protection: false }),
        };
    });

    it('rejects list without user context', async () => {
        const app = Fastify();
        await companySourcerRoutes(app, service);

        const response = await app.inject({
            method: 'GET',
            url: '/company-sourcers',
        });

        expect(response.statusCode).toBe(500);
    });

    it('does not expose create route (sourcer attribution is immutable)', async () => {
        const app = Fastify();
        await companySourcerRoutes(app, service);

        const response = await app.inject({
            method: 'POST',
            url: '/company-sourcers',
            headers: { 'x-clerk-user-id': 'clerk-1' },
            payload: {
                company_id: '33333333-3333-3333-3333-333333333333',
                recruiter_id: '22222222-2222-2222-2222-222222222222',
            },
        });

        // POST should 404 — route no longer exists
        expect(response.statusCode).toBe(404);
    });

    it('does not expose delete route (sourcer attribution is immutable)', async () => {
        const app = Fastify();
        await companySourcerRoutes(app, service);

        const response = await app.inject({
            method: 'DELETE',
            url: '/company-sourcers/11111111-1111-1111-1111-111111111111',
            headers: { 'x-clerk-user-id': 'clerk-1' },
        });

        // DELETE should 404 — route no longer exists
        expect(response.statusCode).toBe(404);
    });
});
