import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import { registerCompanyRoutes } from '../../src/v2/companies/routes';

describe('Company routes (integration)', () => {
    let service: any;

    beforeEach(() => {
        vi.restoreAllMocks();
        service = {
            getCompanies: vi.fn().mockResolvedValue({ data: [], pagination: { total: 0, page: 1, limit: 25, total_pages: 0 } }),
            getCompany: vi.fn().mockResolvedValue({ id: 'comp-1' }),
            createCompany: vi.fn().mockResolvedValue({ id: 'comp-1' }),
            updateCompany: vi.fn().mockResolvedValue({ id: 'comp-1' }),
            deleteCompany: vi.fn().mockResolvedValue(undefined),
        };
    });

    it('rejects list without user context', async () => {
        const app = Fastify();
        registerCompanyRoutes(app, { companyService: service });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/companies',
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).error.message).toBe('Missing x-clerk-user-id header');
    });

    it('parses filters and returns data', async () => {
        const app = Fastify();
        registerCompanyRoutes(app, { companyService: service });

        const filters = encodeURIComponent(JSON.stringify({ status: 'active' }));
        const response = await app.inject({
            method: 'GET',
            url: `/api/v2/companies?filters=${filters}`,
            headers: { 'x-clerk-user-id': 'clerk-1' },
        });

        expect(response.statusCode).toBe(200);
        expect(service.getCompanies).toHaveBeenCalledWith('clerk-1', expect.objectContaining({ status: 'active' }));
    });
});
