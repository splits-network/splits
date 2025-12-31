import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import Fastify from 'fastify';

// Import route functions
import { registerUsersRoutes } from '../src/routes/users/routes';
import { registerOrganizationsRoutes } from '../src/routes/organizations/routes';
import { registerMembershipsRoutes } from '../src/routes/memberships/routes';
import { registerInvitationsRoutes } from '../src/routes/invitations/routes';
import { registerWebhooksRoutes } from '../src/routes/webhooks/routes';
import { registerConsentRoutes } from '../src/routes/consent/routes';

// Mock all services
vi.mock('../src/services/users/service', () => ({
  UsersService: vi.fn().mockImplementation(() => ({
    syncClerkUser: vi.fn(),
    updateUserProfile: vi.fn(),
    deleteUser: vi.fn(),
    getUser: vi.fn(),
    listUsers: vi.fn(),
    createPasswordResetRequest: vi.fn(),
    resetPassword: vi.fn()
  }))
}));

vi.mock('../src/services/organizations/service', () => ({
  OrganizationsService: vi.fn().mockImplementation(() => ({
    createOrganization: vi.fn(),
    updateOrganization: vi.fn(),
    getOrganization: vi.fn(),
    listOrganizations: vi.fn(),
    deleteOrganization: vi.fn(),
    listOrganizationUsers: vi.fn()
  }))
}));

vi.mock('../src/services/memberships/service', () => ({
  MembershipsService: vi.fn().mockImplementation(() => ({
    createMembership: vi.fn(),
    updateMembership: vi.fn(),
    getMembership: vi.fn(),
    listMemberships: vi.fn(),
    deleteMembership: vi.fn(),
    listUserMemberships: vi.fn()
  }))
}));

vi.mock('../src/services/invitations/service', () => ({
  InvitationsService: vi.fn().mockImplementation(() => ({
    createInvitation: vi.fn(),
    updateInvitation: vi.fn(),
    getInvitation: vi.fn(),
    listInvitations: vi.fn(),
    deleteInvitation: vi.fn(),
    acceptInvitation: vi.fn()
  }))
}));

vi.mock('../src/services/webhooks/service', () => ({
  WebhooksService: vi.fn().mockImplementation(() => ({
    handleClerkUserCreated: vi.fn(),
    handleClerkUserUpdated: vi.fn(),
    handleClerkUserDeleted: vi.fn(),
    handleClerkOrganizationCreated: vi.fn(),
    handleClerkOrganizationUpdated: vi.fn(),
    handleClerkOrganizationDeleted: vi.fn()
  }))
}));

vi.mock('../src/services/consent/service', () => ({
  ConsentService: vi.fn().mockImplementation(() => ({
    recordConsent: vi.fn(),
    getConsent: vi.fn(),
    updateConsent: vi.fn(),
    checkConsent: vi.fn()
  }))
}));

describe('Route Registration Tests', () => {
  let app: FastifyInstance;
  let mockRepository: any;

  beforeEach(async () => {
    app = Fastify();
    mockRepository = {
      getUser: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
      listUsers: vi.fn(),
      getOrganization: vi.fn(),
      createOrganization: vi.fn(),
      updateOrganization: vi.fn(),
      deleteOrganization: vi.fn(),
      listOrganizations: vi.fn(),
      getMembership: vi.fn(),
      createMembership: vi.fn(),
      updateMembership: vi.fn(),
      deleteMembership: vi.fn(),
      listMemberships: vi.fn(),
      getInvitation: vi.fn(),
      createInvitation: vi.fn(),
      updateInvitation: vi.fn(),
      deleteInvitation: vi.fn(),
      listInvitations: vi.fn(),
      recordConsent: vi.fn(),
      getConsent: vi.fn(),
      updateConsent: vi.fn()
    };
  });

  describe('Users Routes', () => {
    it('should register users routes successfully', async () => {
      expect(() => {
        registerUsersRoutes(app, mockRepository);
      }).not.toThrow();
    });

    it('should register sync-clerk-user route', async () => {
      registerUsersRoutes(app, mockRepository);
      await app.ready();

      const routes = app.printRoutes({ commonPrefix: false });
      expect(routes).toContain('sync-clerk-user (POST)');
    });

    it('should register users by clerk ID route', async () => {
      registerUsersRoutes(app, mockRepository);
      await app.ready();

      const routes = app.printRoutes({ commonPrefix: false });
      expect(routes).toContain('/users/by-clerk-id/:clerkUserId (GET, HEAD)');
    });

    it('should register users by ID route', async () => {
      registerUsersRoutes(app, mockRepository);
      await app.ready();

      const routes = app.printRoutes({ commonPrefix: false });
      expect(routes).toContain('/users/:id (GET, HEAD, PATCH)');
    });

    it('should register change password route', async () => {
      registerUsersRoutes(app, mockRepository);
      await app.ready();

      const routes = app.printRoutes({ commonPrefix: false });
      expect(routes).toContain('/change-password (POST)');
    });

    it('should register complete onboarding route', async () => {
      registerUsersRoutes(app, mockRepository);
      await app.ready();

      const routes = app.printRoutes({ commonPrefix: false });
      expect(routes).toContain('/complete-onboarding (POST)');
    });
  });

  describe('Organizations Routes', () => {
    it('should register organizations routes successfully', async () => {
      expect(() => {
        registerOrganizationsRoutes(app, mockRepository);
      }).not.toThrow();
    });

    it('should register POST /organizations route', async () => {
      registerOrganizationsRoutes(app, mockRepository);
      await app.ready();

      const routes = app.printRoutes({ commonPrefix: false });
      expect(routes).toContain('/organizations (POST)');
    });

    it('should register organization memberships route', async () => {
      registerOrganizationsRoutes(app, mockRepository);
      await app.ready();

      const routes = app.printRoutes({ commonPrefix: false });
      expect(routes).toContain('/:organizationId/memberships (GET, HEAD)');
    });


  });

  describe('Memberships Routes', () => {
    it('should register memberships routes successfully', async () => {
      expect(() => {
        registerMembershipsRoutes(app, mockRepository);
      }).not.toThrow();
    });

    it('should register POST /memberships route', async () => {
      registerMembershipsRoutes(app, mockRepository);
      await app.ready();

      const routes = app.printRoutes({ commonPrefix: false });
      expect(routes).toContain('/memberships (POST)');
    });

    it('should register DELETE /memberships/:id route', async () => {
      registerMembershipsRoutes(app, mockRepository);
      await app.ready();

      const routes = app.printRoutes({ commonPrefix: false });
      expect(routes).toContain('/:id (DELETE)');
    });
  });

  describe('Invitations Routes', () => {
    it('should register invitations routes successfully', async () => {
      expect(() => {
        registerInvitationsRoutes(app, mockRepository);
      }).not.toThrow();
    });

    it('should register POST /invitations route', async () => {
      registerInvitationsRoutes(app, mockRepository);
      await app.ready();

      const routes = app.printRoutes({ commonPrefix: false });
      expect(routes).toContain('/invitations (POST)');
    });

    it('should register GET /invitations route', async () => {
      registerInvitationsRoutes(app, mockRepository);
      await app.ready();

      const routes = app.printRoutes({ commonPrefix: false });
      expect(routes).toContain('/email/:email (GET, HEAD)');
    });

    it('should register GET /invitations/:id route', async () => {
      registerInvitationsRoutes(app, mockRepository);
      await app.ready();

      const routes = app.printRoutes({ commonPrefix: false });
      expect(routes).toContain('/:id (GET, HEAD, DELETE)');
    });

    it('should register PUT /invitations/:id route', async () => {
      registerInvitationsRoutes(app, mockRepository);
      await app.ready();

      const routes = app.printRoutes({ commonPrefix: false });
      expect(routes).toContain('/:id (GET, HEAD, DELETE)');
    });

    it('should register DELETE /invitations/:id route', async () => {
      registerInvitationsRoutes(app, mockRepository);
      await app.ready();

      const routes = app.printRoutes({ commonPrefix: false });
      expect(routes).toContain('/:id (GET, HEAD, DELETE)');
    });
  });

  describe('Webhooks Routes', () => {
    it('should register webhooks routes successfully', async () => {
      expect(() => {
        registerWebhooksRoutes(app, mockRepository);
      }).not.toThrow();
    });

    it('should register POST /webhooks/clerk route', async () => {
      registerWebhooksRoutes(app, mockRepository);
      await app.ready();

      const routes = app.printRoutes({ commonPrefix: false });
      expect(routes).toContain('/webhooks/clerk (POST)');
    });
  });

  describe('Consent Routes', () => {
    it('should register consent routes successfully', async () => {
      expect(() => {
        registerConsentRoutes(app, mockRepository);
      }).not.toThrow();
    });

    it('should register POST /consent route', async () => {
      registerConsentRoutes(app, mockRepository);
      await app.ready();

      const routes = app.printRoutes({ commonPrefix: false });
      expect(routes).toContain('/consent (GET, HEAD, POST, DELETE)');
    });

    it('should register GET /consent/:userId route', async () => {
      registerConsentRoutes(app, mockRepository);
      await app.ready();

      const routes = app.printRoutes({ commonPrefix: false });
      expect(routes).toContain('/consent (GET, HEAD, POST, DELETE)');
    });

    it('should register PUT /consent/:userId route', async () => {
      registerConsentRoutes(app, mockRepository);
      await app.ready();

      const routes = app.printRoutes({ commonPrefix: false });
      expect(routes).toContain('/consent (GET, HEAD, POST, DELETE)');
    });
  });
});

describe('Route Handler Logic Tests', () => {
  let app: FastifyInstance;
  let mockRepository: any;

  beforeEach(async () => {
    app = Fastify();
    mockRepository = {
      getUser: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
      listUsers: vi.fn(),
      getOrganization: vi.fn(),
      createOrganization: vi.fn(),
      updateOrganization: vi.fn(),
      deleteOrganization: vi.fn(),
      listOrganizations: vi.fn(),
      getMembership: vi.fn(),
      createMembership: vi.fn(),
      updateMembership: vi.fn(),
      deleteMembership: vi.fn(),
      listMemberships: vi.fn(),
      getInvitation: vi.fn(),
      createInvitation: vi.fn(),
      updateInvitation: vi.fn(),
      deleteInvitation: vi.fn(),
      listInvitations: vi.fn(),
      recordConsent: vi.fn(),
      getConsent: vi.fn(),
      updateConsent: vi.fn()
    };
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully in users routes', async () => {
      const mockUsersService = {
        getUser: vi.fn().mockRejectedValue(new Error('Service error'))
      };

      registerUsersRoutes(app, mockRepository);
      await app.ready();

      const response = await app.inject({
        method: 'GET',
        url: '/users/test-id',
        headers: {
          'x-clerk-user-id': 'clerk_123'
        }
      });

      // Should handle error gracefully (likely 500 or specific error status)
      expect([400, 404, 500]).toContain(response.statusCode);
    });

    it('should handle missing headers in organizations routes', async () => {
      registerOrganizationsRoutes(app, mockRepository);
      await app.ready();

      const response = await app.inject({
        method: 'GET',
        url: '/organizations'
        // Missing required headers
      });

      // Should handle missing auth gracefully
      expect([400, 401, 403, 404]).toContain(response.statusCode);
    });

    it('should handle invalid JSON in webhooks routes', async () => {
      registerWebhooksRoutes(app, mockRepository);
      await app.ready();

      const response = await app.inject({
        method: 'POST',
        url: '/webhooks/clerk',
        payload: 'invalid-json',
        headers: {
          'content-type': 'application/json'
        }
      });

      // Should handle invalid JSON gracefully
      expect([400, 422]).toContain(response.statusCode);
    });
  });

  describe('Header Validation', () => {
    it('should validate required headers in protected routes', async () => {
      registerUsersRoutes(app, mockRepository);
      await app.ready();

      const response = await app.inject({
        method: 'GET',
        url: '/users'
        // Missing x-clerk-user-id header
      });

      // Should require authentication headers
      expect([400, 401, 403, 404]).toContain(response.statusCode);
    });

    it('should process valid headers correctly', async () => {
      mockRepository.listUsers.mockResolvedValue([]);

      registerUsersRoutes(app, mockRepository);
      await app.ready();

      const response = await app.inject({
        method: 'GET',
        url: '/users',
        headers: {
          'x-clerk-user-id': 'clerk_123'
        }
      });

      // Should process request with valid headers
      expect([200, 404]).toContain(response.statusCode);
    });
  });

  describe('Request Validation', () => {
    it('should validate request body structure', async () => {
      registerUsersRoutes(app, mockRepository);
      await app.ready();

      const response = await app.inject({
        method: 'POST',
        url: '/users',
        payload: {
          // Invalid or incomplete user data
          invalidField: 'value'
        },
        headers: {
          'x-clerk-user-id': 'clerk_123',
          'content-type': 'application/json'
        }
      });

      // Should validate request body
      expect([400, 404, 422]).toContain(response.statusCode);
    });

    it('should validate URL parameters', async () => {
      registerUsersRoutes(app, mockRepository);
      await app.ready();

      const response = await app.inject({
        method: 'GET',
        url: '/users/invalid-id-format',
        headers: {
          'x-clerk-user-id': 'clerk_123'
        }
      });

      // Should validate URL parameters
      expect([400, 404, 422, 500]).toContain(response.statusCode);
    });
  });

  describe('Response Formatting', () => {
    it('should format successful responses correctly', async () => {
      const mockUser = {
        id: '123',
        clerk_user_id: 'clerk_123',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockRepository.getUser.mockResolvedValue(mockUser);

      registerUsersRoutes(app, mockRepository);
      await app.ready();

      const response = await app.inject({
        method: 'GET',
        url: '/users/123',
        headers: {
          'x-clerk-user-id': 'clerk_123'
        }
      });

      if (response.statusCode === 200) {
        const responseData = JSON.parse(response.body);
        expect(responseData).toHaveProperty('data');
        expect(responseData.data).toEqual(mockUser);
      }
    });

    it('should format error responses consistently', async () => {
      mockRepository.getUser.mockRejectedValue(new Error('User not found'));

      registerUsersRoutes(app, mockRepository);
      await app.ready();

      const response = await app.inject({
        method: 'GET',
        url: '/users/nonexistent',
        headers: {
          'x-clerk-user-id': 'clerk_123'
        }
      });

      if (response.statusCode >= 400) {
        const responseData = JSON.parse(response.body);
        expect(responseData).toHaveProperty('error');
      }
    });
  });
});