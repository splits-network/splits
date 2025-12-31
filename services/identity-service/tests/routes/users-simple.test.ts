import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import { registerUsersRoutes } from '../../src/routes/users/routes';
import { UsersService } from '../../src/services/users/service';
import { IdentityRepository } from '../../src/repository';

describe('Users Routes', () => {
  let app: FastifyInstance;
  let usersService: UsersService;
  let mockRepository: vi.Mocked<IdentityRepository>;

  beforeEach(async () => {
    app = Fastify({ logger: false });
    
    // Create a mock repository
    mockRepository = {
      findUserByClerkUserId: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      findUserById: vi.fn(),
      findMembershipsByUserId: vi.fn(),
      findOrganizationByClerkId: vi.fn(),
      createOrganization: vi.fn(),
      createMembership: vi.fn(),
    } as any;

    // Create the actual service with mocked repository
    usersService = new UsersService(mockRepository);
    
    // Register the routes with the service
    await app.register(registerUsersRoutes, usersService);
  });

  afterEach(async () => {
    await app.close();
    vi.clearAllMocks();
  });

  describe('Route Registration', () => {
    it('should register all user routes successfully', async () => {
      // Test that routes are properly registered by checking if the server starts
      await app.ready();
      expect(app.hasRoute({ method: 'POST', url: '/sync-clerk-user' })).toBe(true);
    });
  });

  describe('POST /sync-clerk-user', () => {
    it('should sync user from Clerk successfully', async () => {
      const mockUser = {
        id: 'user123',
        clerk_user_id: 'clerk_123',
        email: 'test@example.com',
        name: 'Test User'
      };

      mockRepository.findUserByClerkUserId.mockResolvedValue(null);
      mockRepository.createUser.mockResolvedValue(mockUser);

      const response = await app.inject({
        method: 'POST',
        url: '/sync-clerk-user',
        payload: {
          clerk_user_id: 'clerk_123',
          email: 'test@example.com',
          name: 'Test User'
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.data).toEqual(mockUser);
    });

    it('should return 400 when missing required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/sync-clerk-user',
        payload: {
          email: 'test@example.com'
          // Missing clerk_user_id
        }
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /users/:id', () => {
    it('should return user profile successfully', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User'
      };

      mockRepository.findUserById.mockResolvedValue(mockUser);
      mockRepository.findMembershipsByUserId.mockResolvedValue([]);

      const response = await app.inject({
        method: 'GET',
        url: '/users/user123'
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.data.id).toBe('user123');
    });

    it('should return 404 when user not found', async () => {
      mockRepository.findUserById.mockResolvedValue(null);

      const response = await app.inject({
        method: 'GET',
        url: '/users/user123'
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update user profile successfully', async () => {
      const existingUser = {
        id: 'user123',
        clerk_user_id: 'clerk_123',
        email: 'test@example.com',
        name: 'Old Name'
      };

      const updatedUser = {
        ...existingUser,
        name: 'New Name'
      };

      mockRepository.findUserById.mockResolvedValue(existingUser);
      mockRepository.updateUser.mockResolvedValue(updatedUser);

      const response = await app.inject({
        method: 'PATCH',
        url: '/users/user123',
        payload: {
          name: 'New Name'
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.data.name).toBe('New Name');
    });
  });

  describe('POST /users/:id/change-password', () => {
    it('should handle password change endpoint', async () => {
      const user = {
        id: 'user123',
        clerk_user_id: 'clerk_123',
        email: 'test@example.com',
        name: 'Test User'
      };

      mockRepository.findUserById.mockResolvedValue(user);

      // Mock Clerk client not configured scenario
      delete process.env.CLERK_SECRET_KEY;

      const response = await app.inject({
        method: 'POST',
        url: '/users/user123/change-password',
        payload: {
          currentPassword: 'oldpass',
          newPassword: 'newpass'
        }
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('PATCH /users/:id/onboarding', () => {
    it('should update onboarding progress', async () => {
      const user = {
        id: 'user123',
        clerk_user_id: 'clerk_123',
        email: 'test@example.com',
        name: 'Test User',
        onboarding_status: 'not_started'
      };

      const updatedUser = {
        ...user,
        onboarding_status: 'in_progress',
        onboarding_step: 'profile_setup'
      };

      mockRepository.findUserById.mockResolvedValue(user);
      mockRepository.updateUser.mockResolvedValue(updatedUser);

      const response = await app.inject({
        method: 'PATCH',
        url: '/users/user123/onboarding',
        payload: {
          step: 1,
          status: 'in_progress'
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.data.onboarding_status).toBe('in_progress');
    });
  });

  describe('POST /users/:id/complete-onboarding', () => {
    it('should complete onboarding successfully', async () => {
      const user = {
        id: 'user123',
        clerk_user_id: 'clerk_123',
        email: 'test@example.com',
        name: 'Test User'
      };

      const newOrg = {
        id: 'org123',
        name: 'Test Company',
        clerk_organization_id: null
      };

      const membership = {
        id: 'mem123',
        user_id: 'user123',
        organization_id: 'org123',
        role: 'company_admin'
      };

      const updatedUser = {
        ...user,
        onboarding_status: 'completed'
      };

      mockRepository.findUserById.mockResolvedValue(user);
      mockRepository.createOrganization.mockResolvedValue(newOrg);
      mockRepository.createMembership.mockResolvedValue(membership);
      mockRepository.updateUser.mockResolvedValue(updatedUser);

      const response = await app.inject({
        method: 'POST',
        url: '/users/user123/complete-onboarding',
        payload: {
          role: 'company_admin',
          company: {
            name: 'Test Company'
          }
        }
      });

      expect(response.statusCode).toBe(200);
    });
  });
});