import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import {
    getCachedCurrentUserProfile,
    setCachedCurrentUserProfile,
    clearCachedCurrentUserProfile,
    getCachedCurrentUserId,
} from '@/lib/current-user-profile';
import { createAuthenticatedClient } from '@/lib/api-client';

vi.mock('@/lib/api-client', () => ({
    createAuthenticatedClient: vi.fn(),
}));

const mockUser = {
    id: 'user-1',
    clerk_user_id: 'clerk_123',
    email: 'test@example.com',
    name: 'Test User',
    onboarding_status: 'pending',
    onboarding_step: 0,
};

describe('getCachedCurrentUserProfile', () => {
    let mockGet: Mock;

    beforeEach(() => {
        clearCachedCurrentUserProfile();
        mockGet = vi.fn().mockResolvedValue({ data: mockUser });
        vi.mocked(createAuthenticatedClient).mockReturnValue({
            get: mockGet,
        } as any);
    });

    it('fetches user profile from /users/me on first call', async () => {
        const getToken = vi.fn().mockResolvedValue('token-123');

        const result = await getCachedCurrentUserProfile(getToken);

        expect(getToken).toHaveBeenCalled();
        expect(createAuthenticatedClient).toHaveBeenCalledWith('token-123');
        expect(mockGet).toHaveBeenCalledWith('/users/me');
        expect(result).toEqual(mockUser);
    });

    it('returns cached profile on second call without hitting API', async () => {
        const getToken = vi.fn().mockResolvedValue('token-123');

        await getCachedCurrentUserProfile(getToken);

        // Reset call counts
        vi.mocked(createAuthenticatedClient).mockClear();
        mockGet.mockClear();

        const result = await getCachedCurrentUserProfile(getToken);

        expect(createAuthenticatedClient).not.toHaveBeenCalled();
        expect(mockGet).not.toHaveBeenCalled();
        expect(result).toEqual(mockUser);
    });

    it('bypasses cache when force: true is passed', async () => {
        const getToken = vi.fn().mockResolvedValue('token-123');

        await getCachedCurrentUserProfile(getToken);
        mockGet.mockClear();
        vi.mocked(createAuthenticatedClient).mockClear();

        // Re-setup mock since we cleared
        vi.mocked(createAuthenticatedClient).mockReturnValue({
            get: mockGet,
        } as any);

        const result = await getCachedCurrentUserProfile(getToken, { force: true });

        expect(mockGet).toHaveBeenCalledWith('/users/me');
        expect(result).toEqual(mockUser);
    });

    it('returns null when getToken returns null', async () => {
        const getToken = vi.fn().mockResolvedValue(null);

        const result = await getCachedCurrentUserProfile(getToken);

        expect(result).toBeNull();
        expect(createAuthenticatedClient).not.toHaveBeenCalled();
    });

    it('deduplicates concurrent calls', async () => {
        const getToken = vi.fn().mockResolvedValue('token-123');

        const [result1, result2] = await Promise.all([
            getCachedCurrentUserProfile(getToken),
            getCachedCurrentUserProfile(getToken),
        ]);

        expect(createAuthenticatedClient).toHaveBeenCalledTimes(1);
        expect(mockGet).toHaveBeenCalledTimes(1);
        expect(result1).toEqual(result2);
    });

    it('clears pending state after resolution so next forced call fetches fresh', async () => {
        const getToken = vi.fn().mockResolvedValue('token-123');

        await getCachedCurrentUserProfile(getToken);

        // Force a fresh fetch
        vi.mocked(createAuthenticatedClient).mockClear();
        mockGet.mockClear();
        vi.mocked(createAuthenticatedClient).mockReturnValue({
            get: mockGet,
        } as any);

        const updatedUser = { ...mockUser, name: 'Updated Name' };
        mockGet.mockResolvedValue({ data: updatedUser });

        const result = await getCachedCurrentUserProfile(getToken, { force: true });

        expect(mockGet).toHaveBeenCalledTimes(1);
        expect(result).toEqual(updatedUser);
    });

    it('clears pending state even on error', async () => {
        const getToken = vi.fn().mockResolvedValue('token-123');
        mockGet.mockRejectedValueOnce(new Error('Network error'));

        await expect(getCachedCurrentUserProfile(getToken)).rejects.toThrow('Network error');

        // Next call should attempt a fresh fetch, not return stale pending
        mockGet.mockResolvedValueOnce({ data: mockUser });

        const result = await getCachedCurrentUserProfile(getToken);
        expect(result).toEqual(mockUser);
    });

    it('returns profile data from response.data', async () => {
        const getToken = vi.fn().mockResolvedValue('token-123');
        mockGet.mockResolvedValue({ data: { id: 'user-x', email: 'x@y.com' } });

        const result = await getCachedCurrentUserProfile(getToken);

        expect(result).toEqual({ id: 'user-x', email: 'x@y.com' });
    });

    it('returns null when response has no data', async () => {
        const getToken = vi.fn().mockResolvedValue('token-123');
        mockGet.mockResolvedValue({});

        const result = await getCachedCurrentUserProfile(getToken);

        expect(result).toBeNull();
    });
});

describe('setCachedCurrentUserProfile', () => {
    beforeEach(() => {
        clearCachedCurrentUserProfile();
    });

    it('sets the cached profile so next getCachedCurrentUserProfile returns it', async () => {
        setCachedCurrentUserProfile(mockUser);

        const getToken = vi.fn().mockResolvedValue('token-123');
        const result = await getCachedCurrentUserProfile(getToken);

        expect(result).toEqual(mockUser);
        expect(createAuthenticatedClient).not.toHaveBeenCalled();
    });

    it('does not set cache when passed null', async () => {
        setCachedCurrentUserProfile(null);

        const mockGet = vi.fn().mockResolvedValue({ data: mockUser });
        vi.mocked(createAuthenticatedClient).mockReturnValue({ get: mockGet } as any);

        const getToken = vi.fn().mockResolvedValue('token-123');
        const result = await getCachedCurrentUserProfile(getToken);

        // Should have fetched from API since cache was not set
        expect(mockGet).toHaveBeenCalledWith('/users/me');
        expect(result).toEqual(mockUser);
    });
});

describe('clearCachedCurrentUserProfile', () => {
    it('clears cache so next call fetches from API', async () => {
        const mockGet = vi.fn().mockResolvedValue({ data: mockUser });
        vi.mocked(createAuthenticatedClient).mockReturnValue({ get: mockGet } as any);

        const getToken = vi.fn().mockResolvedValue('token-123');

        // Populate cache
        await getCachedCurrentUserProfile(getToken);
        mockGet.mockClear();
        vi.mocked(createAuthenticatedClient).mockClear();
        vi.mocked(createAuthenticatedClient).mockReturnValue({ get: mockGet } as any);

        // Clear cache
        clearCachedCurrentUserProfile();

        // Next call should fetch from API
        await getCachedCurrentUserProfile(getToken);
        expect(mockGet).toHaveBeenCalledWith('/users/me');
    });
});

describe('getCachedCurrentUserId', () => {
    beforeEach(() => {
        clearCachedCurrentUserProfile();
    });

    it('returns user id from cached profile', async () => {
        setCachedCurrentUserProfile(mockUser);

        const getToken = vi.fn().mockResolvedValue('token-123');
        const id = await getCachedCurrentUserId(getToken);

        expect(id).toBe('user-1');
    });

    it('returns null when no profile exists', async () => {
        const mockGet = vi.fn().mockResolvedValue({});
        vi.mocked(createAuthenticatedClient).mockReturnValue({ get: mockGet } as any);

        const getToken = vi.fn().mockResolvedValue('token-123');
        const id = await getCachedCurrentUserId(getToken);

        expect(id).toBeNull();
    });
});
