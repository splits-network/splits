import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';
import { registerRecruiterCandidateRoutes } from '../../src/v2/recruiter-candidates/routes';

describe('Recruiter-candidate routes (integration)', () => {
    const recruiterCandidateService = {
        getRecruiterCandidates: vi.fn(),
        getRecruiterCandidate: vi.fn(),
        createRecruiterCandidate: vi.fn(),
        updateRecruiterCandidate: vi.fn(),
        deleteRecruiterCandidate: vi.fn(),
        getInvitationByToken: vi.fn(),
        acceptInvitationByToken: vi.fn(),
        declineInvitationByToken: vi.fn(),
    };

    it('rejects list without user context', async () => {
        const app = Fastify();
        registerRecruiterCandidateRoutes(app, { recruiterCandidateService: recruiterCandidateService as any });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/recruiter-candidates',
        });

        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body).error).toBe('Missing x-clerk-user-id header');
    });

    it('lists recruiter-candidates with filters', async () => {
        recruiterCandidateService.getRecruiterCandidates.mockResolvedValue({
            data: [],
            pagination: { total: 0 },
        });
        const app = Fastify();
        registerRecruiterCandidateRoutes(app, { recruiterCandidateService: recruiterCandidateService as any });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/recruiter-candidates?filters=%7B%22status%22%3A%22active%22%7D&limit=10',
            headers: { 'x-clerk-user-id': 'clerk-1' },
        });

        expect(response.statusCode).toBe(200);
        expect(recruiterCandidateService.getRecruiterCandidates).toHaveBeenCalledWith(
            'clerk-1',
            expect.objectContaining({
                limit: '10',
                filters: { status: 'active' },
            })
        );
    });

    it('accepts invitation with metadata from headers', async () => {
        recruiterCandidateService.acceptInvitationByToken.mockResolvedValue({ success: true });
        const app = Fastify();
        registerRecruiterCandidateRoutes(app, { recruiterCandidateService: recruiterCandidateService as any });

        const response = await app.inject({
            method: 'POST',
            url: '/api/v2/recruiter-candidates/invitations/token-1/accept',
            headers: {
                'user-agent': 'agent',
                'x-forwarded-for': '1.1.1.1',
                'content-type': 'application/json',
            },
            payload: { userId: 'user-1' },
        });

        expect(response.statusCode).toBe(200);
        expect(recruiterCandidateService.acceptInvitationByToken).toHaveBeenCalledWith(
            'token-1',
            expect.objectContaining({
                userId: 'user-1',
                ip_address: '1.1.1.1',
                user_agent: 'agent',
            })
        );
    });

    it('declines invitation with metadata from headers', async () => {
        recruiterCandidateService.declineInvitationByToken.mockResolvedValue({ success: true });
        const app = Fastify();
        registerRecruiterCandidateRoutes(app, { recruiterCandidateService: recruiterCandidateService as any });

        const response = await app.inject({
            method: 'POST',
            url: '/api/v2/recruiter-candidates/invitations/token-1/decline',
            headers: {
                'user-agent': 'agent',
                'x-forwarded-for': '2.2.2.2',
                'content-type': 'application/json',
            },
            payload: { reason: 'no' },
        });

        expect(response.statusCode).toBe(200);
        expect(recruiterCandidateService.declineInvitationByToken).toHaveBeenCalledWith(
            'token-1',
            expect.objectContaining({
                reason: 'no',
                ip_address: '2.2.2.2',
                user_agent: 'agent',
            })
        );
    });
});
