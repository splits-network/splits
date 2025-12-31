import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import { registerMembershipsRoutes } from '../../src/routes/memberships/routes';
import { IdentityService } from '../../src/service';

// Mock the service
vi.mock('../../src/service');

describe('Memberships Routes', () => {
  let app: FastifyInstance;
  let mockIdentityService: vi.Mocked<IdentityService>;

  beforeEach(async () => {
    app = Fastify();
    
    mockIdentityService = {
      memberships: {
        addMembership: vi.fn(),
        removeMembership: vi.fn(),
      }
    } as any;

    const mockMembershipsService = mockIdentityService.memberships;
    app.decorate('identityService', mockIdentityService);
    await registerMembershipsRoutes(app, mockMembershipsService);
  });

  describe('POST /memberships', () => {
    it('should create membership successfully', async () => {
      const membershipData = {
        user_id: 'user123',
        organization_id: 'org123',
        role: 'member' as const,
      };

      const mockCreatedMembership = { id: 'membership123', ...membershipData };
      mockIdentityService.memberships.addMembership.mockResolvedValue(mockCreatedMembership);

      const response = await app.inject({
        method: 'POST',
        url: '/memberships',
        headers: {
          'x-clerk-user-id': 'clerk_123',
        },
        payload: membershipData,
      });

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.payload)).toEqual({ data: mockCreatedMembership });
    });

    it('should return 400 for invalid membership data', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/memberships',
        headers: {
          'x-clerk-user-id': 'clerk_123',
        },
        payload: {
          // Missing required fields
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /memberships/user/:userId', () => {
    it('should return 404 for non-existent user memberships endpoint', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/memberships/user/user123',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /memberships/organization/:orgId', () => {
    it('should return 404 for non-existent organization memberships endpoint', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/memberships/organization/org123',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /memberships/:id', () => {
    it('should return 404 for non-existent update endpoint', async () => {
      const updateData = { role: 'admin' as const };

      const response = await app.inject({
        method: 'PUT',
        url: '/memberships/membership123',
        payload: updateData,
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /memberships/:id', () => {
    it('should delete membership successfully', async () => {
      mockIdentityService.memberships.removeMembership.mockResolvedValue(undefined);

      const response = await app.inject({
        method: 'DELETE',
        url: '/memberships/membership123',
      });

      expect(response.statusCode).toBe(204);
    });
  });
});