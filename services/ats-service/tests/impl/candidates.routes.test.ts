import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import { registerCandidateRoutes } from '../../src/v2/candidates/routes';

describe('Candidate routes (integration)', () => {
    let service: any;

    beforeEach(() => {
        vi.restoreAllMocks();
        service = {
            getCandidates: vi.fn().mockResolvedValue({ data: [], pagination: { total: 0, page: 1, limit: 25, total_pages: 0 } }),
            getCandidate: vi.fn().mockResolvedValue({ id: 'cand-1' }),
            getCandidateByClerkId: vi.fn().mockResolvedValue({ id: 'cand-1' }),
            createCandidate: vi.fn().mockResolvedValue({ id: 'cand-1' }),
            updateCandidate: vi.fn().mockResolvedValue({ id: 'cand-1' }),
            deleteCandidate: vi.fn().mockResolvedValue(undefined),
            getCandidateRecentApplications: vi.fn().mockResolvedValue([]),
            getCandidatePrimaryResume: vi.fn().mockResolvedValue({ id: 'doc-1' }),
        };
    });

    it('rejects list without user context', async () => {
        const app = Fastify();
        registerCandidateRoutes(app, { candidateService: service });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/candidates',
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).error.message).toBe('Missing x-clerk-user-id header');
    });

    it('allows get candidate without user context', async () => {
        const app = Fastify();
        registerCandidateRoutes(app, { candidateService: service });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/candidates/cand-1',
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body).data.id).toBe('cand-1');
    });

    it('creates candidate requires auth', async () => {
        const app = Fastify();
        registerCandidateRoutes(app, { candidateService: service });

        const response = await app.inject({
            method: 'POST',
            url: '/api/v2/candidates',
            payload: { full_name: 'Test', email: 'test@example.com' },
        });

        expect(response.statusCode).toBe(400);
    });
});
