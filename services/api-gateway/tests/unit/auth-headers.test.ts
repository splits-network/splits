import { describe, it, expect } from 'vitest';
import { buildAuthHeaders } from '../../src/helpers/auth-headers';

describe('buildAuthHeaders (unit)', () => {
    it('returns internal service key header when present', () => {
        const headers = buildAuthHeaders({
            headers: {
                'x-internal-service-key': 'internal',
            },
        } as any);

        expect(headers).toEqual({ 'x-internal-service-key': 'internal' });
    });

    it('returns empty headers when no auth is present', () => {
        const headers = buildAuthHeaders({ headers: {} } as any);
        expect(headers).toEqual({});
    });

    it('adds clerk user id and organization id when auth exists', () => {
        const headers = buildAuthHeaders({
            headers: {},
            auth: {
                clerkUserId: 'clerk-1',
                memberships: [{ organization_id: 'org-1' }],
            },
        } as any);

        expect(headers).toEqual({
            'x-clerk-user-id': 'clerk-1',
            'x-organization-id': 'org-1',
        });
    });
});
