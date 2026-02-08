import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';
import { registerInvitationRoutes } from '../../src/v2/invitations/routes';

describe('Invitation routes (integration)', () => {
    const invitationService = {
        findInvitations: vi.fn(),
        findInvitationById: vi.fn(),
        createInvitation: vi.fn(),
        updateInvitation: vi.fn(),
        deleteInvitation: vi.fn(),
        acceptInvitation: vi.fn(),
        resendInvitation: vi.fn(),
    };
    const logError = vi.fn();

    it('rejects list without user context', async () => {
        const app = Fastify();
        registerInvitationRoutes(app, { invitationService: invitationService as any, logError });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/invitations',
        });

        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body).error.message).toBe('Failed to list invitations');
    });

    it('creates invitation', async () => {
        invitationService.createInvitation.mockResolvedValue({ id: 'inv-1' });
        const app = Fastify();
        registerInvitationRoutes(app, { invitationService: invitationService as any, logError });

        const response = await app.inject({
            method: 'POST',
            url: '/api/v2/invitations',
            headers: {
                'x-clerk-user-id': 'clerk-1',
                'content-type': 'application/json',
            },
            payload: { email: 'test@example.com', organization_id: 'org-1', role: 'company_admin' },
        });

        expect(response.statusCode).toBe(201);
        expect(invitationService.createInvitation).toHaveBeenCalledWith(
            'clerk-1',
            expect.objectContaining({ email: 'test@example.com' })
        );
    });
});
