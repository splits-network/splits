import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MembershipsService } from '../../src/services/memberships/service';
import { IdentityRepository } from '../../src/repository';
import { Membership } from '@splits-network/shared-types';

// Mock the repository
vi.mock('../../src/repository');

describe('MembershipsService', () => {
  let membershipsService: MembershipsService;
  let mockRepository: vi.Mocked<IdentityRepository>;
  
  const userId = 'user_123';
  const organizationId = 'org_456';

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockRepository = {
      createMembership: vi.fn(),
      deleteMembership: vi.fn(),
      findMembershipsByUserId: vi.fn(),
      findMembershipsByOrgId: vi.fn(),
      getMembershipsByOrganization: vi.fn(),
    } as any;
    
    membershipsService = new MembershipsService(mockRepository);
  });

  describe('constructor', () => {
    it('should initialize with repository', () => {
      expect(membershipsService).toBeDefined();
    });
  });

  describe('addMembership', () => {
    const userId = 'user_123';
    const organizationId = 'org_456';

    it('should add company_admin membership', async () => {
      const role = 'company_admin' as const;
      const expectedMembership: Membership = {
        id: 'membership_789',
        user_id: userId,
        organization_id: organizationId,
        role,
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      mockRepository.createMembership.mockResolvedValue(expectedMembership);

      const result = await membershipsService.addMembership(userId, organizationId, role);

      expect(mockRepository.createMembership).toHaveBeenCalledWith({
        user_id: userId,
        organization_id: organizationId,
        role,
      });
      expect(result).toEqual(expectedMembership);
    });

    it('should add hiring_manager membership', async () => {
      const role = 'hiring_manager' as const;
      const expectedMembership: Membership = {
        id: 'membership_789',
        user_id: userId,
        organization_id: organizationId,
        role,
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      mockRepository.createMembership.mockResolvedValue(expectedMembership);

      const result = await membershipsService.addMembership(userId, organizationId, role);

      expect(result).toEqual(expectedMembership);
    });

    it('should add recruiter membership', async () => {
      const role = 'recruiter' as const;
      const expectedMembership: Membership = {
        id: 'membership_789',
        user_id: userId,
        organization_id: organizationId,
        role,
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      mockRepository.createMembership.mockResolvedValue(expectedMembership);

      const result = await membershipsService.addMembership(userId, organizationId, role);

      expect(result).toEqual(expectedMembership);
    });

    it('should add platform_admin membership', async () => {
      const role = 'platform_admin' as const;
      const expectedMembership: Membership = {
        id: 'membership_789',
        user_id: userId,
        organization_id: organizationId,
        role,
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
      };

      mockRepository.createMembership.mockResolvedValue(expectedMembership);

      const result = await membershipsService.addMembership(userId, organizationId, role);

      expect(result).toEqual(expectedMembership);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      mockRepository.createMembership.mockRejectedValue(error);

      await expect(
        membershipsService.addMembership(userId, organizationId, 'company_admin')
      ).rejects.toThrow('Database error');
    });

    it('should handle duplicate membership error', async () => {
      const error = new Error('User already has membership in this organization');
      mockRepository.createMembership.mockRejectedValue(error);

      await expect(
        membershipsService.addMembership(userId, organizationId, 'company_admin')
      ).rejects.toThrow('User already has membership in this organization');
    });

    it('should handle invalid user ID', async () => {
      const error = new Error('Invalid user ID');
      mockRepository.createMembership.mockRejectedValue(error);

      await expect(
        membershipsService.addMembership('invalid', organizationId, 'company_admin')
      ).rejects.toThrow('Invalid user ID');
    });

    it('should handle invalid organization ID', async () => {
      const error = new Error('Invalid organization ID');
      mockRepository.createMembership.mockRejectedValue(error);

      await expect(
        membershipsService.addMembership(userId, 'invalid', 'company_admin')
      ).rejects.toThrow('Invalid organization ID');
    });
  });

  describe('removeMembership', () => {
    it('should remove membership successfully', async () => {
      const membershipId = 'membership_789';
      
      mockRepository.deleteMembership.mockResolvedValue();

      await membershipsService.removeMembership(membershipId);

      expect(mockRepository.deleteMembership).toHaveBeenCalledWith(membershipId);
    });

    it('should handle repository errors', async () => {
      const membershipId = 'membership_789';
      const error = new Error('Database error');
      
      mockRepository.deleteMembership.mockRejectedValue(error);

      await expect(
        membershipsService.removeMembership(membershipId)
      ).rejects.toThrow('Database error');
    });

    it('should handle membership not found', async () => {
      const membershipId = 'nonexistent';
      const error = new Error('Membership not found');
      
      mockRepository.deleteMembership.mockRejectedValue(error);

      await expect(
        membershipsService.removeMembership(membershipId)
      ).rejects.toThrow('Membership not found');
    });

    it('should handle empty membership ID', async () => {
      const error = new Error('Invalid membership ID');
      
      mockRepository.deleteMembership.mockRejectedValue(error);

      await expect(
        membershipsService.removeMembership('')
      ).rejects.toThrow('Invalid membership ID');
    });

    it('should handle unauthorized removal', async () => {
      const membershipId = 'membership_789';
      const error = new Error('Unauthorized to remove this membership');
      
      mockRepository.deleteMembership.mockRejectedValue(error);

      await expect(
        membershipsService.removeMembership(membershipId)
      ).rejects.toThrow('Unauthorized to remove this membership');
    });
  });
});