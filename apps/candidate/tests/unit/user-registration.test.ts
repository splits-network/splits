import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import {
    ensureUserAndCandidateInDatabase,
    checkUserExists,
    checkCandidateExists,
    type UserRegistrationData,
} from '@/lib/user-registration';
import { createAuthenticatedClient } from '@/lib/api-client';
import { getCachedCurrentUserProfile, setCachedCurrentUserProfile } from '@/lib/current-user-profile';

vi.mock('@/lib/api-client', () => ({
    createAuthenticatedClient: vi.fn(),
}));

vi.mock('@/lib/current-user-profile', () => ({
    getCachedCurrentUserProfile: vi.fn(),
    setCachedCurrentUserProfile: vi.fn(),
}));

const mockUser = {
    id: 'user-1',
    clerk_user_id: 'clerk_abc',
    email: 'test@example.com',
    name: 'Test User',
    onboarding_status: 'pending',
    onboarding_step: 0,
};

const mockCandidate = {
    id: 'candidate-1',
    user_id: 'user-1',
    email: 'test@example.com',
    full_name: 'Test User',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
};

const registrationData: UserRegistrationData = {
    clerk_user_id: 'clerk_abc',
    email: 'test@example.com',
    name: 'Test User',
    image_url: 'https://example.com/avatar.jpg',
};

describe('ensureUserAndCandidateInDatabase', () => {
    let mockClient: { get: Mock; post: Mock; patch: Mock; delete: Mock };

    beforeEach(() => {
        mockClient = {
            get: vi.fn(),
            post: vi.fn(),
            patch: vi.fn(),
            delete: vi.fn(),
        };
        vi.mocked(createAuthenticatedClient).mockReturnValue(mockClient as any);
        vi.mocked(getCachedCurrentUserProfile).mockReset();
        vi.mocked(setCachedCurrentUserProfile).mockReset();
    });

    // ===== Happy Paths =====

    it('creates both user and candidate when neither exists', async () => {
        // User doesn't exist
        vi.mocked(getCachedCurrentUserProfile).mockRejectedValue({ response: { status: 404 } });
        // Create user
        mockClient.post.mockResolvedValueOnce({ data: mockUser });
        // Candidate doesn't exist
        mockClient.get.mockRejectedValueOnce({ response: { status: 404 } });
        // Create candidate
        mockClient.post.mockResolvedValueOnce({ data: mockCandidate });

        const result = await ensureUserAndCandidateInDatabase('token-123', registrationData);

        expect(result.success).toBe(true);
        expect(result.user).toEqual(mockUser);
        expect(result.candidate).toEqual(mockCandidate);
        expect(result.userWasExisting).toBe(false);
        expect(result.candidateWasExisting).toBe(false);
        expect(setCachedCurrentUserProfile).toHaveBeenCalledWith(mockUser);
    });

    it('returns existing user and candidate when both already exist', async () => {
        vi.mocked(getCachedCurrentUserProfile).mockResolvedValue(mockUser);
        mockClient.get.mockResolvedValueOnce({ data: mockCandidate });

        const result = await ensureUserAndCandidateInDatabase('token-123', registrationData);

        expect(result.success).toBe(true);
        expect(result.userWasExisting).toBe(true);
        expect(result.candidateWasExisting).toBe(true);
        // Should never call POST
        expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('uses existing user but creates new candidate', async () => {
        vi.mocked(getCachedCurrentUserProfile).mockResolvedValue(mockUser);
        // Candidate doesn't exist
        mockClient.get.mockRejectedValueOnce({ response: { status: 404 } });
        // Create candidate
        mockClient.post.mockResolvedValueOnce({ data: mockCandidate });

        const result = await ensureUserAndCandidateInDatabase('token-123', registrationData);

        expect(result.success).toBe(true);
        expect(result.userWasExisting).toBe(true);
        expect(result.candidateWasExisting).toBe(false);
    });

    it('creates user then finds existing candidate', async () => {
        // User doesn't exist
        vi.mocked(getCachedCurrentUserProfile).mockRejectedValue({ response: { status: 404 } });
        // Create user
        mockClient.post.mockResolvedValueOnce({ data: mockUser });
        // Candidate exists
        mockClient.get.mockResolvedValueOnce({ data: mockCandidate });

        const result = await ensureUserAndCandidateInDatabase('token-123', registrationData);

        expect(result.success).toBe(true);
        expect(result.userWasExisting).toBe(false);
        expect(result.candidateWasExisting).toBe(true);
    });

    // ===== Race Condition: User Creation 409 =====

    it('handles 409 duplicate on user creation by retrying GET', async () => {
        // First check: user doesn't exist
        vi.mocked(getCachedCurrentUserProfile)
            .mockRejectedValueOnce({ response: { status: 404 } })
            // Retry after 409: user exists now
            .mockResolvedValueOnce(mockUser);

        // Create user fails with 409
        mockClient.post.mockRejectedValueOnce({ response: { status: 409 }, message: '' });
        // Candidate exists
        mockClient.get.mockResolvedValueOnce({ data: mockCandidate });

        const result = await ensureUserAndCandidateInDatabase('token-123', registrationData);

        expect(result.success).toBe(true);
        expect(result.userWasExisting).toBe(true);
        expect(setCachedCurrentUserProfile).toHaveBeenCalledWith(mockUser);
    });

    it('handles "already registered" message on user creation by retrying GET', async () => {
        vi.mocked(getCachedCurrentUserProfile)
            .mockRejectedValueOnce({ response: { status: 404 } })
            .mockResolvedValueOnce(mockUser);

        mockClient.post.mockRejectedValueOnce({ message: 'User already registered' });
        mockClient.get.mockResolvedValueOnce({ data: mockCandidate });

        const result = await ensureUserAndCandidateInDatabase('token-123', registrationData);

        expect(result.success).toBe(true);
        expect(result.userWasExisting).toBe(true);
    });

    it('handles "already exists" message on user creation by retrying GET', async () => {
        vi.mocked(getCachedCurrentUserProfile)
            .mockRejectedValueOnce({ response: { status: 404 } })
            .mockResolvedValueOnce(mockUser);

        mockClient.post.mockRejectedValueOnce({ message: 'User already exists in the system' });
        mockClient.get.mockResolvedValueOnce({ data: mockCandidate });

        const result = await ensureUserAndCandidateInDatabase('token-123', registrationData);

        expect(result.success).toBe(true);
        expect(result.userWasExisting).toBe(true);
    });

    it('handles "duplicate" message in nested error response', async () => {
        vi.mocked(getCachedCurrentUserProfile)
            .mockRejectedValueOnce({ response: { status: 404 } })
            .mockResolvedValueOnce(mockUser);

        mockClient.post.mockRejectedValueOnce({
            message: '',
            response: { data: { error: { message: 'duplicate key value violates unique constraint' } } },
        });
        mockClient.get.mockResolvedValueOnce({ data: mockCandidate });

        const result = await ensureUserAndCandidateInDatabase('token-123', registrationData);

        expect(result.success).toBe(true);
        expect(result.userWasExisting).toBe(true);
    });

    // ===== Race Condition: Candidate Creation 409 =====

    it('handles 409 duplicate on candidate creation by retrying GET', async () => {
        vi.mocked(getCachedCurrentUserProfile).mockResolvedValue(mockUser);
        // First GET /candidates/me: not found
        mockClient.get.mockRejectedValueOnce({ response: { status: 404 } });
        // POST /candidates: 409 duplicate
        mockClient.post.mockRejectedValueOnce({ response: { status: 409 }, message: '' });
        // Retry GET /candidates/me: found
        mockClient.get.mockResolvedValueOnce({ data: mockCandidate });

        const result = await ensureUserAndCandidateInDatabase('token-123', registrationData);

        expect(result.success).toBe(true);
        expect(result.candidateWasExisting).toBe(true);
    });

    it('handles "unique constraint" message on candidate creation by retrying GET', async () => {
        vi.mocked(getCachedCurrentUserProfile).mockResolvedValue(mockUser);
        mockClient.get.mockRejectedValueOnce({ response: { status: 404 } });
        mockClient.post.mockRejectedValueOnce({ message: 'unique constraint violation' });
        mockClient.get.mockResolvedValueOnce({ data: mockCandidate });

        const result = await ensureUserAndCandidateInDatabase('token-123', registrationData);

        expect(result.success).toBe(true);
        expect(result.candidateWasExisting).toBe(true);
    });

    // ===== Error Paths =====

    it('returns success: false when user creation fails with non-duplicate error', async () => {
        vi.mocked(getCachedCurrentUserProfile).mockRejectedValue({ response: { status: 404 } });
        mockClient.post.mockRejectedValueOnce(new Error('Internal server error'));

        const result = await ensureUserAndCandidateInDatabase('token-123', registrationData);

        expect(result.success).toBe(false);
        expect(result.error).toBe('Internal server error');
        expect(result.user).toBeNull();
    });

    it('returns success: false when user retry after 409 returns null', async () => {
        vi.mocked(getCachedCurrentUserProfile)
            .mockRejectedValueOnce({ response: { status: 404 } })
            // Retry also returns null
            .mockResolvedValueOnce(null);

        mockClient.post.mockRejectedValueOnce({ response: { status: 409 }, message: '' });

        const result = await ensureUserAndCandidateInDatabase('token-123', registrationData);

        expect(result.success).toBe(false);
        expect(result.error).toBe('Failed to create or find user account');
    });

    it('succeeds with null candidate when candidate creation fails with non-duplicate error', async () => {
        vi.mocked(getCachedCurrentUserProfile).mockResolvedValue(mockUser);
        mockClient.get.mockRejectedValueOnce({ response: { status: 404 } });
        mockClient.post.mockRejectedValueOnce(new Error('Database connection failed'));

        const result = await ensureUserAndCandidateInDatabase('token-123', registrationData);

        // Candidate creation errors are logged but don't fail the whole operation
        expect(result.success).toBe(true);
        expect(result.user).toEqual(mockUser);
        expect(result.candidate).toBeNull();
    });

    it('succeeds with null candidate when candidate retry after 409 also fails', async () => {
        vi.mocked(getCachedCurrentUserProfile).mockResolvedValue(mockUser);
        mockClient.get
            .mockRejectedValueOnce({ response: { status: 404 } })  // First check
            .mockRejectedValueOnce(new Error('Network error'));      // Retry after 409
        mockClient.post.mockRejectedValueOnce({ response: { status: 409 }, message: '' });

        const result = await ensureUserAndCandidateInDatabase('token-123', registrationData);

        expect(result.success).toBe(true);
        expect(result.candidate).toBeNull();
    });

    // ===== Payload Verification =====

    it('sends correct payload to POST /users/register', async () => {
        vi.mocked(getCachedCurrentUserProfile).mockRejectedValue({ response: { status: 404 } });
        mockClient.post.mockResolvedValueOnce({ data: mockUser });
        mockClient.get.mockResolvedValueOnce({ data: mockCandidate });

        await ensureUserAndCandidateInDatabase('token-123', registrationData);

        expect(mockClient.post).toHaveBeenCalledWith('/users/register', {
            clerk_user_id: 'clerk_abc',
            email: 'test@example.com',
            name: 'Test User',
            image_url: 'https://example.com/avatar.jpg',
        });
    });

    it('sends correct payload to POST /candidates', async () => {
        vi.mocked(getCachedCurrentUserProfile).mockRejectedValue({ response: { status: 404 } });
        mockClient.post
            .mockResolvedValueOnce({ data: mockUser })     // /users/register
            .mockResolvedValueOnce({ data: mockCandidate }); // /candidates
        mockClient.get.mockRejectedValueOnce({ response: { status: 404 } });

        await ensureUserAndCandidateInDatabase('token-123', registrationData);

        expect(mockClient.post).toHaveBeenCalledWith('/candidates', {
            user_id: 'user-1',
            full_name: 'Test User',
            email: 'test@example.com',
        });
    });

    it('uses email prefix as full_name when name is not provided', async () => {
        vi.mocked(getCachedCurrentUserProfile).mockRejectedValue({ response: { status: 404 } });
        mockClient.post
            .mockResolvedValueOnce({ data: mockUser })
            .mockResolvedValueOnce({ data: mockCandidate });
        mockClient.get.mockRejectedValueOnce({ response: { status: 404 } });

        const dataWithoutName: UserRegistrationData = {
            clerk_user_id: 'clerk_abc',
            email: 'john.doe@example.com',
        };

        await ensureUserAndCandidateInDatabase('token-123', dataWithoutName);

        expect(mockClient.post).toHaveBeenCalledWith('/candidates', expect.objectContaining({
            full_name: 'john.doe',
        }));
    });

    it('creates authenticated client with provided token', async () => {
        vi.mocked(getCachedCurrentUserProfile).mockResolvedValue(mockUser);
        mockClient.get.mockResolvedValueOnce({ data: mockCandidate });

        await ensureUserAndCandidateInDatabase('my-jwt-token', registrationData);

        expect(createAuthenticatedClient).toHaveBeenCalledWith('my-jwt-token');
    });

    it('suppresses 404 and 500 errors on initial user check without logging warning', async () => {
        vi.mocked(getCachedCurrentUserProfile).mockRejectedValue({ response: { status: 500 } });
        mockClient.post.mockResolvedValueOnce({ data: mockUser });
        mockClient.get.mockResolvedValueOnce({ data: mockCandidate });

        const result = await ensureUserAndCandidateInDatabase('token-123', registrationData);

        expect(result.success).toBe(true);
        // console.warn should NOT be called for 404/500
        expect(console.warn).not.toHaveBeenCalled();
    });
});

describe('checkUserExists', () => {
    it('returns user data when user exists', async () => {
        vi.mocked(getCachedCurrentUserProfile).mockResolvedValue(mockUser);

        const result = await checkUserExists('token-123');

        expect(result).toEqual(mockUser);
    });

    it('returns null when user does not exist', async () => {
        vi.mocked(getCachedCurrentUserProfile).mockRejectedValue({ response: { status: 404 } });

        const result = await checkUserExists('token-123');

        expect(result).toBeNull();
    });

    it('returns null on error', async () => {
        vi.mocked(getCachedCurrentUserProfile).mockRejectedValue(new Error('Network error'));

        const result = await checkUserExists('token-123');

        expect(result).toBeNull();
    });
});

describe('checkCandidateExists', () => {
    let mockClient: { get: Mock; post: Mock; patch: Mock; delete: Mock };

    beforeEach(() => {
        mockClient = {
            get: vi.fn(),
            post: vi.fn(),
            patch: vi.fn(),
            delete: vi.fn(),
        };
        vi.mocked(createAuthenticatedClient).mockReturnValue(mockClient as any);
    });

    it('returns candidate data when candidate exists', async () => {
        mockClient.get.mockResolvedValue({ data: mockCandidate });

        const result = await checkCandidateExists('token-123');

        expect(result).toEqual(mockCandidate);
    });

    it('returns null when candidate does not exist', async () => {
        mockClient.get.mockRejectedValue({ response: { status: 404 } });

        const result = await checkCandidateExists('token-123');

        expect(result).toBeNull();
    });

    it('returns null on error', async () => {
        mockClient.get.mockRejectedValue(new Error('Server error'));

        const result = await checkCandidateExists('token-123');

        expect(result).toBeNull();
    });
});
