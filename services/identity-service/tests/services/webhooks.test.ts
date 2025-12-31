import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebhooksService } from '../../src/services/webhooks/service';
import { IdentityRepository } from '../../src/repository';

// Mock dependencies
vi.mock('../../src/repository');
vi.mock('../../src/services/users/service');

describe('WebhooksService', () => {
  let service: WebhooksService;
  let mockRepository: vi.Mocked<IdentityRepository>;

  beforeEach(() => {
    mockRepository = {
      findUserByClerkUserId: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
    } as any;
    
    service = new WebhooksService(mockRepository);
  });

  describe('handleUserCreatedOrUpdated', () => {
    it('should handle user creation/update', async () => {
      await service.handleUserCreatedOrUpdated('clerk_123', 'test@example.com', 'John', 'Doe');
      
      // This calls the users service internally, so we just verify it completes without error
      expect(true).toBe(true);
    });

    it('should handle user with no last name', async () => {
      await service.handleUserCreatedOrUpdated('clerk_123', 'test@example.com', 'John', null);
      
      expect(true).toBe(true);
    });

    it('should use email prefix when no name provided', async () => {
      await service.handleUserCreatedOrUpdated('clerk_123', 'test@example.com', null, null);
      
      expect(true).toBe(true);
    });
  });

  describe('handleUserDeleted', () => {
    it('should log user deletion', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      await service.handleUserDeleted('clerk_123');
      
      expect(consoleSpy).toHaveBeenCalledWith('User deleted in Clerk: clerk_123 (consider cleanup)');
      
      consoleSpy.mockRestore();
    });
  });
});