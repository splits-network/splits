import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IdentityService } from '../src/service';
import { IdentityRepository } from '../src/repository';
import { EventPublisher } from '../src/events';
import { User, Organization, Membership } from '@splits-network/shared-types';

// Mock the dependencies
vi.mock('../src/repository');
vi.mock('../src/events');

describe('IdentityService', () => {
  let identityService: IdentityService;
  let mockRepository: vi.Mocked<IdentityRepository>;
  let mockEventPublisher: vi.Mocked<EventPublisher>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create a proper mock repository
    mockRepository = {
      findUserByClerkUserId: vi.fn(),
      findUserById: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      findOrganizationById: vi.fn(),
      createOrganization: vi.fn(),
      findMembershipsByUserId: vi.fn(),
      findMembershipsByOrgId: vi.fn(),
      createMembership: vi.fn(),
      healthCheck: vi.fn(),
    } as any;
    
    mockEventPublisher = {
      connect: vi.fn(),
      close: vi.fn(),
      publish: vi.fn(),
    } as any;
    
    identityService = new IdentityService(mockRepository, mockEventPublisher);
  });

  describe('constructor', () => {
    it('should initialize all service dependencies', () => {
      expect(identityService.users).toBeDefined();
      expect(identityService.organizations).toBeDefined();
      expect(identityService.memberships).toBeDefined();
      expect(identityService.invitations).toBeDefined();
      expect(identityService.webhooks).toBeDefined();
      expect(identityService.consent).toBeDefined();
    });

    it('should work without event publisher', () => {
      const service = new IdentityService(mockRepository);
      expect(service.users).toBeDefined();
      expect(service.organizations).toBeDefined();
    });
  });

  describe('syncClerkUser', () => {
    it('should delegate to users service', async () => {
      const clerkUserId = 'clerk_123';
      const email = 'test@example.com';
      const name = 'Test User';
      const expectedUser: User = {
        id: '123',
        clerk_user_id: clerkUserId,
        email,
        name,
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      // Mock the users service method
      vi.spyOn(identityService.users, 'syncClerkUser').mockResolvedValue(expectedUser);

      const result = await identityService.syncClerkUser(clerkUserId, email, name);

      expect(identityService.users.syncClerkUser).toHaveBeenCalledWith(clerkUserId, email, name);
      expect(result).toEqual(expectedUser);
    });

    it('should handle errors from users service', async () => {
      const error = new Error('Database error');
      vi.spyOn(identityService.users, 'syncClerkUser').mockRejectedValue(error);

      await expect(
        identityService.syncClerkUser('clerk_123', 'test@example.com', 'Test User')
      ).rejects.toThrow('Database error');
    });
  });

  describe('getUserProfile', () => {
    it('should delegate to users service', async () => {
      const userId = '123';
      const expectedProfile = {
        id: userId,
        clerk_user_id: 'clerk_123',
        email: 'test@example.com',
        name: 'Test User',
        memberships: [],
      };

      vi.spyOn(identityService.users, 'getUserProfile').mockResolvedValue(expectedProfile);

      const result = await identityService.getUserProfile(userId);

      expect(identityService.users.getUserProfile).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedProfile);
    });
  });

  describe('createOrganization', () => {
    it('should delegate to organizations service', async () => {
      const name = 'Test Org';
      const type = 'company' as const;
      const expectedOrg: Organization = {
        id: '456',
        name,
        type,
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      vi.spyOn(identityService.organizations, 'createOrganization').mockResolvedValue(expectedOrg);

      const result = await identityService.createOrganization(name, type);

      expect(identityService.organizations.createOrganization).toHaveBeenCalledWith(name, type);
      expect(result).toEqual(expectedOrg);
    });
  });

  describe('addMembership', () => {
    it('should delegate to memberships service', async () => {
      const userId = '123';
      const organizationId = '456';
      const role = 'company_admin' as const;
      const expectedMembership: Membership = {
        id: '789',
        user_id: userId,
        organization_id: organizationId,
        role,
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      vi.spyOn(identityService.memberships, 'addMembership').mockResolvedValue(expectedMembership);

      const result = await identityService.addMembership(userId, organizationId, role);

      expect(identityService.memberships.addMembership).toHaveBeenCalledWith(userId, organizationId, role);
      expect(result).toEqual(expectedMembership);
    });
  });

  describe('removeMembership', () => {
    it('should delegate to memberships service', async () => {
      const membershipId = '789';

      vi.spyOn(identityService.memberships, 'removeMembership').mockResolvedValue();

      await identityService.removeMembership(membershipId);

      expect(identityService.memberships.removeMembership).toHaveBeenCalledWith(membershipId);
    });
  });
});