import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UsersService } from '../../src/services/users/service';
import { IdentityRepository } from '../../src/repository';
import { createClerkClient } from '@clerk/backend';
import { User, Membership, Organization } from '@splits-network/shared-types';

// Mock dependencies
vi.mock('../../src/repository');
vi.mock('@clerk/backend');

describe('UsersService', () => {
  let usersService: UsersService;
  let mockRepository: vi.Mocked<IdentityRepository>;
  let mockClerkClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup repository mock with all needed methods
    mockRepository = {
      findUserByClerkUserId: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      findUserById: vi.fn(),
      findAllUsers: vi.fn(),
      findMembershipsByUserId: vi.fn(),
      findOrganizationsByUserId: vi.fn(),
      getUserWithMemberships: vi.fn(),
      findOrganizationById: vi.fn(),
      findOrganizationByClerkId: vi.fn(),
      createOrganization: vi.fn(),
      createMembership: vi.fn(),
    } as any;
    
    // Setup Clerk client mock
    mockClerkClient = {
      users: {
        updateUser: vi.fn(),
      },
    };
    vi.mocked(createClerkClient).mockReturnValue(mockClerkClient);
    
    // Set environment variable
    process.env.CLERK_SECRET_KEY = 'test_clerk_secret';
    
    usersService = new UsersService(mockRepository);
  });

  describe('constructor', () => {
    it('should initialize with repository', () => {
      expect(usersService).toBeDefined();
    });

    it('should initialize Clerk client when secret key is present', () => {
      expect(createClerkClient).toHaveBeenCalledWith({ 
        secretKey: 'test_clerk_secret' 
      });
    });

    it('should work without Clerk client when no secret key', () => {
      delete process.env.CLERK_SECRET_KEY;
      const service = new UsersService(mockRepository);
      expect(service).toBeDefined();
    });
  });

  describe('syncClerkUser', () => {
    const clerkUserId = 'clerk_123';
    const email = 'test@example.com';
    const name = 'Test User';

    it('should update existing user when found', async () => {
      const existingUser: User = {
        id: '123',
        clerk_user_id: clerkUserId,
        email: 'old@example.com',
        name: 'Old Name',
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      const updatedUser: User = {
        ...existingUser,
        email,
        name,
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      mockRepository.findUserByClerkUserId.mockResolvedValue(existingUser);
      mockRepository.updateUser.mockResolvedValue(updatedUser);

      const result = await usersService.syncClerkUser(clerkUserId, email, name);

      expect(mockRepository.findUserByClerkUserId).toHaveBeenCalledWith(clerkUserId);
      expect(mockRepository.updateUser).toHaveBeenCalledWith('123', { email, name });
      expect(result).toEqual(updatedUser);
    });

    it('should return existing user when no changes needed', async () => {
      const existingUser: User = {
        id: '123',
        clerk_user_id: clerkUserId,
        email,
        name,
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      mockRepository.findUserByClerkUserId.mockResolvedValue(existingUser);

      const result = await usersService.syncClerkUser(clerkUserId, email, name);

      expect(mockRepository.findUserByClerkUserId).toHaveBeenCalledWith(clerkUserId);
      expect(mockRepository.updateUser).not.toHaveBeenCalled();
      expect(result).toEqual(existingUser);
    });

    it('should create new user when not found', async () => {
      const newUser: User = {
        id: '456',
        clerk_user_id: clerkUserId,
        email,
        name,
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      mockRepository.findUserByClerkUserId.mockResolvedValue(null);
      mockRepository.createUser.mockResolvedValue(newUser);

      const result = await usersService.syncClerkUser(clerkUserId, email, name);

      expect(mockRepository.findUserByClerkUserId).toHaveBeenCalledWith(clerkUserId);
      expect(mockRepository.createUser).toHaveBeenCalledWith({
        clerk_user_id: clerkUserId,
        email,
        name,
      });
      expect(result).toEqual(newUser);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      mockRepository.findUserByClerkUserId.mockRejectedValue(error);

      await expect(usersService.syncClerkUser(clerkUserId, email, name)).rejects.toThrow('Database error');
    });
  });

  describe('updateUserProfile', () => {
    const userId = '123';
    const updates = { name: 'New Name' };

    it('should update user profile and sync to Clerk', async () => {
      const existingUser: User = {
        id: userId,
        clerk_user_id: 'clerk_123',
        email: 'test@example.com',
        name: 'Old Name',
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      const updatedUser: User = {
        ...existingUser,
        name: 'New Name',
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      mockRepository.findUserById.mockResolvedValue(existingUser);
      mockRepository.updateUser.mockResolvedValue(updatedUser);
      mockClerkClient.users.updateUser.mockResolvedValue({});

      const result = await usersService.updateUserProfile(userId, updates);

      expect(mockRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(mockRepository.updateUser).toHaveBeenCalledWith(userId, updates);
      expect(mockClerkClient.users.updateUser).toHaveBeenCalledWith('clerk_123', {
        firstName: 'New',
        lastName: 'Name',
      });
      expect(result).toEqual(updatedUser);
    });

    it('should handle multi-word names correctly', async () => {
      const user: User = {
        id: userId,
        clerk_user_id: 'clerk_123',
        email: 'test@example.com',
        name: 'Old Name',
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      mockRepository.findUserById.mockResolvedValue(user);
      mockRepository.updateUser.mockResolvedValue(user);

      await usersService.updateUserProfile(userId, { name: 'John Michael Smith Jr.' });

      expect(mockClerkClient.users.updateUser).toHaveBeenCalledWith('clerk_123', {
        firstName: 'John',
        lastName: 'Michael Smith Jr.',
      });
    });

    it('should handle single name correctly', async () => {
      const user: User = {
        id: userId,
        clerk_user_id: 'clerk_123',
        email: 'test@example.com',
        name: 'Old Name',
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      mockRepository.findUserById.mockResolvedValue(user);
      mockRepository.updateUser.mockResolvedValue(user);

      await usersService.updateUserProfile(userId, { name: 'Madonna' });

      expect(mockClerkClient.users.updateUser).toHaveBeenCalledWith('clerk_123', {
        firstName: 'Madonna',
        lastName: '',
      });
    });

    it('should continue when Clerk sync fails', async () => {
      const user: User = {
        id: userId,
        clerk_user_id: 'clerk_123',
        email: 'test@example.com',
        name: 'Old Name',
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      const updatedUser = { ...user, name: 'New Name' };

      mockRepository.findUserById.mockResolvedValue(user);
      mockRepository.updateUser.mockResolvedValue(updatedUser);
      mockClerkClient.users.updateUser.mockRejectedValue(new Error('Clerk error'));

      // Should not throw despite Clerk error
      const result = await usersService.updateUserProfile(userId, updates);
      expect(result).toEqual(updatedUser);
    });

    it('should work without Clerk client', async () => {
      // Create service without Clerk client
      delete process.env.CLERK_SECRET_KEY;
      const serviceWithoutClerk = new UsersService(mockRepository);

      const user: User = {
        id: userId,
        clerk_user_id: 'clerk_123',
        email: 'test@example.com',
        name: 'Old Name',
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      const updatedUser = { ...user, name: 'New Name' };

      mockRepository.findUserById.mockResolvedValue(user);
      mockRepository.updateUser.mockResolvedValue(updatedUser);

      const result = await serviceWithoutClerk.updateUserProfile(userId, updates);
      expect(result).toEqual(updatedUser);
    });

    it('should throw error when user not found', async () => {
      mockRepository.findUserById.mockResolvedValue(null);

      await expect(usersService.updateUserProfile(userId, updates))
        .rejects.toThrow('User 123 not found');
    });
  });

  describe('changeUserPassword', () => {
    const userId = '123';
    const currentPassword = 'oldpass123';
    const newPassword = 'newpass456';

    it('should change password successfully', async () => {
      const user: User = {
        id: userId,
        clerk_user_id: 'clerk_123',
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      mockRepository.findUserById.mockResolvedValue(user);
      mockClerkClient.users.updateUser.mockResolvedValue({});

      await usersService.changeUserPassword(userId, currentPassword, newPassword);

      expect(mockRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(mockClerkClient.users.updateUser).toHaveBeenCalledWith('clerk_123', {
        password: newPassword,
      });
    });

    it('should throw error when user not found', async () => {
      mockRepository.findUserById.mockResolvedValue(null);

      await expect(usersService.changeUserPassword(userId, currentPassword, newPassword))
        .rejects.toThrow('User 123 not found');
    });

    it('should throw error when user has no clerk_user_id', async () => {
      const user: User = {
        id: userId,
        clerk_user_id: '',
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      mockRepository.findUserById.mockResolvedValue(user);

      await expect(usersService.changeUserPassword(userId, currentPassword, newPassword))
        .rejects.toThrow('User 123 not found');
    });

    it('should throw error when Clerk client not configured', async () => {
      delete process.env.CLERK_SECRET_KEY;
      const serviceWithoutClerk = new UsersService(mockRepository);

      const user: User = {
        id: userId,
        clerk_user_id: 'clerk_123',
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      mockRepository.findUserById.mockResolvedValue(user);

      await expect(serviceWithoutClerk.changeUserPassword(userId, currentPassword, newPassword))
        .rejects.toThrow('Authentication service is not configured');
    });

    it('should handle password validation errors from Clerk', async () => {
      const user: User = {
        id: userId,
        clerk_user_id: 'clerk_123',
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      mockRepository.findUserById.mockResolvedValue(user);
      mockClerkClient.users.updateUser.mockRejectedValue({ status: 422 });

      await expect(usersService.changeUserPassword(userId, currentPassword, newPassword))
        .rejects.toThrow('Password does not meet requirements. Must be at least 8 characters.');
    });

    it('should handle user not found errors from Clerk', async () => {
      const user: User = {
        id: userId,
        clerk_user_id: 'clerk_123',
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      mockRepository.findUserById.mockResolvedValue(user);
      mockClerkClient.users.updateUser.mockRejectedValue({ status: 404 });

      await expect(usersService.changeUserPassword(userId, currentPassword, newPassword))
        .rejects.toThrow('User not found');
    });

    it('should handle generic Clerk errors', async () => {
      const user: User = {
        id: userId,
        clerk_user_id: 'clerk_123',
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      mockRepository.findUserById.mockResolvedValue(user);
      mockClerkClient.users.updateUser.mockRejectedValue({ status: 500 });

      await expect(usersService.changeUserPassword(userId, currentPassword, newPassword))
        .rejects.toThrow('Failed to change password. Please try again.');
    });
  });

  describe('getUserProfile', () => {
    const userId = '123';

    it('should return complete user profile with memberships', async () => {
      const user: User = {
        id: userId,
        clerk_user_id: 'clerk_123',
        email: 'test@example.com',
        name: 'Test User',
        onboarding_status: 'completed',
        onboarding_step: 'profile',
        onboarding_completed_at: '2023-01-01T00:00:00Z',
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      const memberships: Membership[] = [
        {
          id: 'membership_1',
          user_id: userId,
          organization_id: 'org_1',
          role: 'company_admin',
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
        },
      ];

      const organization: Organization = {
        id: 'org_1',
        name: 'Test Company',
        type: 'company',
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      mockRepository.findUserById.mockResolvedValue(user);
      mockRepository.findMembershipsByUserId.mockResolvedValue(memberships);
      mockRepository.findOrganizationById.mockResolvedValue(organization);

      const result = await usersService.getUserProfile(userId);

      expect(result).toEqual({
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        onboarding_status: 'completed',
        onboarding_step: 'profile',
        onboarding_completed_at: '2023-01-01T00:00:00Z',
        memberships: [
          {
            id: 'membership_1',
            organization_id: 'org_1',
            organization_name: 'Test Company',
            role: 'company_admin',
          },
        ],
      });
    });

    it('should return profile with empty memberships when no memberships exist', async () => {
      const user: User = {
        id: userId,
        clerk_user_id: 'clerk_123',
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      mockRepository.findUserById.mockResolvedValue(user);
      mockRepository.findMembershipsByUserId.mockResolvedValue([]);

      const result = await usersService.getUserProfile(userId);

      expect(result.memberships).toEqual([]);
    });

    it('should skip memberships with missing organizations', async () => {
      const user: User = {
        id: userId,
        clerk_user_id: 'clerk_123',
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      const memberships: Membership[] = [
        {
          id: 'membership_1',
          user_id: userId,
          organization_id: 'missing_org',
          role: 'company_admin',
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
        },
      ];

      mockRepository.findUserById.mockResolvedValue(user);
      mockRepository.findMembershipsByUserId.mockResolvedValue(memberships);
      mockRepository.findOrganizationById.mockResolvedValue(null);

      const result = await usersService.getUserProfile(userId);

      expect(result.memberships).toEqual([]);
    });

    it('should throw error when user not found', async () => {
      mockRepository.findUserById.mockResolvedValue(null);

      await expect(
        usersService.getUserProfile('user123')
      ).rejects.toThrow('User user123 not found');
    });
  });

  describe('getUserByClerkId', () => {
    it('should return user when found', async () => {
      const user = {
        id: 'user123',
        clerk_user_id: 'clerk_123',
        email: 'test@example.com',
        name: 'Test User'
      } as User;

      mockRepository.findUserByClerkUserId.mockResolvedValue(user);

      const result = await usersService.getUserByClerkId('clerk_123');

      expect(result).toEqual(user);
    });

    it('should return null when user not found', async () => {
      mockRepository.findUserByClerkUserId.mockResolvedValue(null);

      const result = await usersService.getUserByClerkId('clerk_123');

      expect(result).toBeNull();
    });
  });

  describe('updateOnboardingProgress', () => {
    it('should update onboarding progress', async () => {
      const user = {
        id: 'user123',
        clerk_user_id: 'clerk_123',
        email: 'test@example.com',
        name: 'Test User',
        onboarding_status: 'not_started'
      } as User;

      const updatedUser = {
        ...user,
        onboarding_step: 2,
        onboarding_status: 'in_progress'
      } as User;

      mockRepository.findUserById.mockResolvedValue(user);
      mockRepository.updateUser.mockResolvedValue(updatedUser);

      const result = await usersService.updateOnboardingProgress(
        'user123',
        2,
        'in_progress'
      );

      expect(result).toEqual(updatedUser);
      expect(mockRepository.updateUser).toHaveBeenCalledWith('user123', {
        onboarding_step: 2,
        onboarding_status: 'in_progress'
      });
    });

    it('should throw error when user not found', async () => {
      mockRepository.findUserById.mockResolvedValue(null);

      await expect(
        usersService.updateOnboardingProgress('user123', 'in_progress', 'profile')
      ).rejects.toThrow('User user123 not found');
    });
  });

  describe('completeOnboarding', () => {
    it('should complete recruiter onboarding without organization', async () => {
      const user = {
        id: 'user123',
        clerk_user_id: 'clerk_123',
        email: 'test@example.com',
        name: 'Test User'
      } as User;

      const updatedUser = {
        ...user,
        onboarding_status: 'completed',
        onboarding_completed_at: expect.any(Date)
      } as User;

      mockRepository.findUserById.mockResolvedValue(user);
      mockRepository.updateUser.mockResolvedValue(updatedUser);

      const data = {
        recruiter: {
          bio: 'Experienced recruiter',
          phone: '+1234567890',
          industries: ['Technology'],
          specialties: ['Full-stack Development']
        }
      };

      const result = await usersService.completeOnboarding('user123', 'recruiter', data);

      expect(result).toEqual({ 
        user: updatedUser, 
        organizationId: undefined
      });
      expect(mockRepository.createOrganization).not.toHaveBeenCalled();
      expect(mockRepository.createMembership).not.toHaveBeenCalled();
    });

    it('should create new company organization for company admin', async () => {
      const user = {
        id: 'user123',
        clerk_user_id: 'clerk_123',
        email: 'test@example.com',
        name: 'Test User'
      } as User;

      const newOrg = {
        id: 'org456',
        name: 'New Company',
        type: 'company'
      } as Organization;

      const membership = {
        id: 'mem123',
        user_id: 'user123',
        organization_id: 'org456',
        role: 'company_admin'
      } as Membership;

      const updatedUser = {
        ...user,
        onboarding_status: 'completed',
        onboarding_completed_at: expect.any(Date)
      } as User;

      mockRepository.findUserById.mockResolvedValue(user);
      mockRepository.createOrganization.mockResolvedValue(newOrg);
      mockRepository.createMembership.mockResolvedValue(membership);
      mockRepository.updateUser.mockResolvedValue(updatedUser);

      const data = {
        company: {
          name: 'New Company'
        }
      };

      const result = await usersService.completeOnboarding('user123', 'company_admin', data);

      expect(result).toEqual({ 
        user: updatedUser, 
        organizationId: 'org456'
      });
      expect(mockRepository.createOrganization).toHaveBeenCalledWith({
        name: 'New Company',
        type: 'company'
      });
      expect(mockRepository.createMembership).toHaveBeenCalledWith({
        user_id: 'user123',
        organization_id: 'org456',
        role: 'company_admin'
      });
    });

    it('should throw error when user not found', async () => {
      mockRepository.findUserById.mockResolvedValue(null);

      await expect(
        usersService.completeOnboarding('nonexistent', 'company_admin', {})
      ).rejects.toThrow('User nonexistent not found');
    });

    it('should throw error when company name required but missing', async () => {
      const user = {
        id: 'user123',
        clerk_user_id: 'clerk_123',
        email: 'test@example.com',
        name: 'Test User'
      } as User;

      mockRepository.findUserById.mockResolvedValue(user);

      const data = {
        company: {}
      };

      await expect(
        usersService.completeOnboarding('user123', 'company_admin', data)
      ).rejects.toThrow('Company name is required');
    });
  });
});