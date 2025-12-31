import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import { registerOrganizationsRoutes } from '../../src/routes/organizations/routes';
import { IdentityService } from '../../src/service';

// Mock the service
vi.mock('../../src/service');

describe('Organizations Routes', () => {
  let app: FastifyInstance;
  let mockIdentityService: vi.Mocked<IdentityService>;

  beforeEach(async () => {
    app = Fastify();
    
    mockIdentityService = {
      organizations: {
        createOrganization: vi.fn(),
        getOrganizationMemberships: vi.fn(),
      }
    } as any;

    const mockOrganizationsService = mockIdentityService.organizations;
    app.decorate('identityService', mockIdentityService);
    await registerOrganizationsRoutes(app, mockOrganizationsService);
  });

  describe('GET /organizations/:organizationId/memberships', () => {
    it('should return organization memberships', async () => {
      const mockMemberships = [
        { id: 'mem1', user_id: 'user1', organization_id: 'org123', role: 'admin' },
        { id: 'mem2', user_id: 'user2', organization_id: 'org123', role: 'member' },
      ];

      mockIdentityService.organizations.getOrganizationMemberships.mockResolvedValue(mockMemberships);

      const response = await app.inject({
        method: 'GET',
        url: '/organizations/org123/memberships',
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toEqual({ data: mockMemberships });
    });

    it('should return empty array when no memberships found', async () => {
      mockIdentityService.organizations.getOrganizationMemberships.mockResolvedValue([]);

      const response = await app.inject({
        method: 'GET',
        url: '/organizations/org123/memberships',
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toEqual({ data: [] });
    });
  });

  describe('POST /organizations', () => {
    it('should create organization successfully', async () => {
      const orgData = {
        name: 'New Organization',
        type: 'company' as const,
        settings: { theme: 'light' },
      };

      const mockCreatedOrg = { id: 'org456', ...orgData };
      mockIdentityService.organizations.createOrganization.mockResolvedValue(mockCreatedOrg);

      const response = await app.inject({
        method: 'POST',
        url: '/organizations',
        headers: {
          'x-clerk-user-id': 'clerk_123',
        },
        payload: orgData,
      });

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.payload)).toEqual({ data: mockCreatedOrg });
    });

    it('should return 400 for invalid organization data', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/organizations',
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

  describe('PUT /organizations/:id', () => {
    it('should return 404 for non-existent update endpoint', async () => {
      const updateData = {
        name: 'Updated Organization',
        settings: { theme: 'dark' },
      };

      const response = await app.inject({
        method: 'PUT',
        url: '/organizations/org123',
        payload: updateData,
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /organizations/:id', () => {
    it('should return 404 for non-existent delete endpoint', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/organizations/org123',
      });

      expect(response.statusCode).toBe(404);
    });
  });
});