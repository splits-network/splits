import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';
import { registerMembershipRoutes } from '../../src/v2/memberships/routes';

describe('Membership routes (integration)', () => {
    const membershipService = {
        findMemberships: vi.fn(),
        findMembershipById: vi.fn(),
        createMembership: vi.fn(),
        updateMembership: vi.fn(),
        deleteMembership: vi.fn(),
    };
    const logError = vi.fn();

    it('rejects list without user context', async () => {
        const app = Fastify();
        registerMembershipRoutes(app, { membershipService: membershipService as any, logError });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/memberships',
        });

        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body).error.message).toBe('Failed to list memberships');
    });

    it('lists memberships with pagination', async () => {
        membershipService.findMemberships.mockResolvedValue({ data: [], total: 0 });
        const app = Fastify();
        registerMembershipRoutes(app, { membershipService: membershipService as any, logError });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/memberships?page=1&limit=5',
            headers: { 'x-clerk-user-id': 'clerk-1' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.pagination.limit).toBe(5);
    });
});
