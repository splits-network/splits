import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrganizationsService } from '../../src/services/organizations/service';
import { IdentityRepository } from '../../src/repository';
import { Organization } from '@splits-network/shared-types';

// Mock dependencies
vi.mock('../../src/repository');

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let mockRepository: vi.Mocked<IdentityRepository>;

  beforeEach(() => {
    mockRepository = {
      createOrganization: vi.fn(),
      getMembershipsByOrganization: vi.fn(),
    } as any;
    
    service = new OrganizationsService(mockRepository);
  });

  describe('createOrganization', () => {
    it('should create a company organization', async () => {
      const expectedOrg: Organization = {
        id: 'org123',
        name: 'Test Company',
        type: 'company',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockRepository.createOrganization.mockResolvedValue(expectedOrg);

      const result = await service.createOrganization('Test Company', 'company');

      expect(result).toEqual(expectedOrg);
      expect(mockRepository.createOrganization).toHaveBeenCalledWith({
        name: 'Test Company',
        type: 'company'
      });
    });

    it('should create a platform organization', async () => {
      const expectedOrg: Organization = {
        id: 'org123',
        name: 'Platform',
        type: 'platform',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockRepository.createOrganization.mockResolvedValue(expectedOrg);

      const result = await service.createOrganization('Platform', 'platform');

      expect(result).toEqual(expectedOrg);
      expect(mockRepository.createOrganization).toHaveBeenCalledWith({
        name: 'Platform',
        type: 'platform'
      });
    });
  });

  describe('getOrganizationMemberships', () => {
    it('should retrieve organization memberships', async () => {
      const memberships = [
        {
          id: 'membership1',
          user_id: 'user1',
          organization_id: 'org123',
          role: 'admin',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockRepository.getMembershipsByOrganization.mockResolvedValue(memberships);

      const result = await service.getOrganizationMemberships('org123');

      expect(result).toEqual(memberships);
      expect(mockRepository.getMembershipsByOrganization).toHaveBeenCalledWith('org123');
    });

    it('should return empty array when no memberships exist', async () => {
      mockRepository.getMembershipsByOrganization.mockResolvedValue([]);

      const result = await service.getOrganizationMemberships('org123');

      expect(result).toEqual([]);
    });
  });
});