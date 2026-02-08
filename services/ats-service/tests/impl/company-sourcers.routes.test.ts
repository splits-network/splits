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
            create: vi.fn().mockResolvedValue({ id: 'cs-1' }),
            update: vi.fn().mockResolvedValue({ id: 'cs-1' }),
            delete: vi.fn().mockResolvedValue(undefined),
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

    it('creates company sourcer with auth', async () => {
        const app = Fastify();
        await companySourcerRoutes(app, service);

        const response = await app.inject({
            method: 'POST',
            url: '/company-sourcers',
            headers: { 'x-clerk-user-id': 'clerk-1' },
            payload: {
                company_id: '33333333-3333-3333-3333-333333333333',
                sourcer_recruiter_id: '22222222-2222-2222-2222-222222222222',
                sourcer_type: 'recruiter',
                protection_expires_at: new Date().toISOString(),
            },
        });

        expect(response.statusCode).toBe(201);
    });
});
