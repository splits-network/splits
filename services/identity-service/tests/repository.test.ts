import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IdentityRepository } from '../src/repository';

// Mock Supabase client
const mockSupabaseClient = {
  schema: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  eq: vi.fn(),
  single: vi.fn(),
};

// Mock the createClient function
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

describe('IdentityRepository - Unit Tests', () => {
  let repository: IdentityRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock chain for each test
    mockSupabaseClient.schema.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.insert.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.update.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.delete.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.single.mockReturnValue({ data: null, error: null });
    
    repository = new IdentityRepository('http://test-url', 'test-key');
  });

  describe('constructor', () => {
    it('should initialize with Supabase client', () => {
      expect(repository).toBeDefined();
      expect(repository).toBeInstanceOf(IdentityRepository);
    });

    it('should store URL and key for Supabase connection', () => {
      const repo = new IdentityRepository('http://custom-url', 'custom-key');
      expect(repo).toBeDefined();
    });
  });

  describe('query building logic', () => {
    it('should build correct schema queries', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: { id: 'user_123', name: 'Test User' },
        error: null
      });

      await repository.findUserById('user_123');

      // Verify it uses the identity schema
      expect(mockSupabaseClient.schema).toHaveBeenCalledWith('identity');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'user_123');
    });

    it('should handle data transformation correctly', async () => {
      const mockUserData = {
        id: 'user_123',
        clerk_user_id: 'clerk_abc123',
        email: 'test@example.com',
        name: 'Test User'
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockUserData,
        error: null
      });

      const result = await repository.findUserById('user_123');

      expect(result).toEqual(mockUserData);
    });

    it('should return null when data not found', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Row not found' }
      });

      const result = await repository.findUserById('nonexistent_user');

      expect(result).toBeNull();
    });

    it('should handle database errors appropriately', async () => {
      const dbError = { code: 'CONNECTION_ERROR', message: 'Database connection failed' };
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: dbError
      });

      await expect(repository.findUserById('user_123')).rejects.toThrow('Database connection failed');
    });
  });

  describe('user operations', () => {
    it('should build correct user creation query', async () => {
      const userData = {
        clerk_user_id: 'clerk_123',
        email: 'new@example.com', 
        name: 'New User'
      };

      const createdUser = {
        id: 'user_456',
        ...userData,
        created_at: new Date().toISOString()
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: createdUser,
        error: null
      });

      const result = await repository.createUser(userData);

      expect(mockSupabaseClient.schema).toHaveBeenCalledWith('identity');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(userData);
      expect(result).toEqual(createdUser);
    });

    it('should build correct user update query', async () => {
      const updates = { name: 'Updated Name' };
      const updatedUser = {
        id: 'user_123',
        name: 'Updated Name',
        email: 'test@example.com'
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: updatedUser,
        error: null
      });

      const result = await repository.updateUser('user_123', updates);

      expect(mockSupabaseClient.schema).toHaveBeenCalledWith('identity');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(updates);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'user_123');
      expect(result).toEqual(updatedUser);
    });
  });

  describe('organization operations', () => {
    it('should query organizations correctly', async () => {
      const orgData = {
        id: 'org_123',
        name: 'Test Organization',
        clerk_organization_id: 'clerk_org_123'
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: orgData,
        error: null
      });

      const result = await repository.findOrganizationById('org_123');

      expect(mockSupabaseClient.schema).toHaveBeenCalledWith('identity');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('organizations');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'org_123');
      expect(result).toEqual(orgData);
    });
  });

  describe('membership operations', () => {
    it('should find memberships by user ID', async () => {
      const memberships = [
        {
          id: 'mem_1',
          user_id: 'user_123',
          organization_id: 'org_1',
          role: 'admin'
        },
        {
          id: 'mem_2', 
          user_id: 'user_123',
          organization_id: 'org_2',
          role: 'member'
        }
      ];

      // Create separate mock for non-single queries
      const mockQueryChain = {
        schema: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: memberships, error: null })
      };

      // Mock the client's schema method for this test
      mockSupabaseClient.schema.mockReturnValue(mockQueryChain);

      const result = await repository.findMembershipsByUserId('user_123');

      expect(mockSupabaseClient.schema).toHaveBeenCalledWith('identity');
      expect(mockQueryChain.from).toHaveBeenCalledWith('memberships');
      expect(mockQueryChain.eq).toHaveBeenCalledWith('user_id', 'user_123');
      expect(result).toEqual(memberships);
    });
  });

  describe('error handling patterns', () => {
    it('should distinguish between not found and other errors', async () => {
      // Not found error should return null
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      });

      const result1 = await repository.findUserById('missing_user');
      expect(result1).toBeNull();

      // Other errors should throw
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { code: 'PERMISSION_DENIED', message: 'Access denied' }
      });

      await expect(repository.findUserById('user_123')).rejects.toThrow('Access denied');
    });

    it('should handle validation errors in creates/updates', async () => {
      const validationError = {
        code: '23505',
        message: 'Unique constraint violation'
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: validationError
      });

      await expect(
        repository.createUser({
          clerk_user_id: 'clerk_123',
          email: 'duplicate@example.com',
          name: 'User'
        })
      ).rejects.toThrow('Unique constraint violation');
    });
  });
});