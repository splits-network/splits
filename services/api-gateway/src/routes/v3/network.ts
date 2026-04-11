/**
 * Network Service V3 Gateway Routes
 *
 * Declarative config for all V3 network-related resources.
 * The proxy layer handles auth, CORS, correlation IDs — no custom handlers.
 */

import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients.js';
import { registerV3Routes, V3RouteConfig } from './proxy.js';
import { requireAuth, optionalAuth } from '../../middleware/auth.js';
import { buildAuthHeaders } from '../../helpers/auth-headers.js';

const networkV3Routes: V3RouteConfig[] = [
  // ── Recruiters Views (registered before :id to avoid param collision) ──
  { path: '/recruiters/views/marketplace-listing', method: 'GET', auth: 'none' },
  { path: '/recruiters/me', method: 'GET', auth: 'required' },
  { path: '/recruiters/by-slug/:slug', method: 'GET', auth: 'none' },
  { path: '/recruiters/:id/view/profile', method: 'GET', auth: 'none' },

  // ── Recruiters Core CRUD ──
  { path: '/recruiters', method: 'GET', auth: 'required' },
  { path: '/recruiters/:id', method: 'GET', auth: 'required' },
  { path: '/recruiters', method: 'POST', auth: 'required' },
  { path: '/recruiters/:id', method: 'PATCH', auth: 'required' },
  { path: '/recruiters/:id', method: 'DELETE', auth: 'required' },

  // ── Recruiter Candidates Core CRUD ──────────────────────────────
  { resource: 'recruiter-candidates', auth: 'required' },

  // ── Recruiter Candidates Views ──────────────────────────────────
  { path: '/recruiter-candidates/views/list', method: 'GET', auth: 'required' },
  { path: '/recruiter-candidates/views/list-for-candidate', method: 'GET', auth: 'required' },
  { path: '/recruiter-candidates/:id/view/detail', method: 'GET', auth: 'required' },

  // ── Recruiter Candidates Invitations ────────────────────────────
  { path: '/recruiter-candidates/invitations/:token', method: 'GET', auth: 'none' },
  { path: '/recruiter-candidates/invitations/:token/accept', method: 'POST', auth: 'none' },
  { path: '/recruiter-candidates/invitations/:token/decline', method: 'POST', auth: 'none' },

  // ── Recruiter Candidates Actions ────────────────────────────────
  { path: '/recruiter-candidates/:id/terminate', method: 'PATCH', auth: 'required' },

  // ── Recruiter Companies ─────────────────────────────────────────
  { path: '/recruiter-companies/views/list', method: 'GET', auth: 'required' },
  { path: '/recruiter-companies', method: 'GET', auth: 'required' },
  { path: '/recruiter-companies/:id/view/detail', method: 'GET', auth: 'required' },
  { path: '/recruiter-companies/:id', method: 'GET', auth: 'required' },
  { path: '/recruiter-companies/:id', method: 'PATCH', auth: 'required' },
  { path: '/recruiter-companies/:id', method: 'DELETE', auth: 'required' },
  { path: '/recruiter-companies/my-permissions', method: 'GET', auth: 'required' },
  { path: '/recruiter-companies/my-permissions/:companyId', method: 'GET', auth: 'required' },
  { path: '/recruiter-companies/request-connection', method: 'POST', auth: 'required' },
  { path: '/recruiter-companies/invite', method: 'POST', auth: 'required' },
  { path: '/recruiter-companies/:id/respond', method: 'PATCH', auth: 'required' },
  { path: '/recruiter-companies/:id/terminate', method: 'PATCH', auth: 'required' },

  // ── Company Invitations ─────────────────────────────────────────
  { path: '/company-invitations/views/list', method: 'GET', auth: 'required' },
  { path: '/company-invitations', method: 'GET', auth: 'required' },
  { path: '/company-invitations/:id/view/detail', method: 'GET', auth: 'required' },
  { path: '/company-invitations/:id', method: 'GET', auth: 'required' },
  { path: '/company-invitations', method: 'POST', auth: 'required' },
  { path: '/company-invitations/:id', method: 'DELETE', auth: 'required' },
  { path: '/company-invitations/lookup', method: 'GET', auth: 'none' },
  { path: '/company-invitations/complete-relationship', method: 'POST', auth: 'required' },
  { path: '/company-invitations/:id/accept', method: 'POST', auth: 'required' },
  { path: '/company-invitations/:id/resend', method: 'POST', auth: 'required' },
  { path: '/company-invitations/:id/revoke', method: 'PATCH', auth: 'required' },

  // ── Recruiter Codes Core CRUD ───────────────────────────────────
  { resource: 'recruiter-codes', auth: 'required' },

  // ── Recruiter Codes Views & Actions ─────────────────────────────
  { path: '/recruiter-codes/views/list', method: 'GET', auth: 'required' },
  { path: '/recruiter-codes/:id/view/detail', method: 'GET', auth: 'required' },
  { path: '/recruiter-codes/lookup', method: 'GET', auth: 'none' },
  { path: '/recruiter-codes/default', method: 'GET', auth: 'required' },
  { path: '/recruiter-codes/log', method: 'GET', auth: 'required' },
  { path: '/recruiter-codes/log', method: 'POST', auth: 'required' },

  // ── Firms Core CRUD ─────────────────────────────────────────────
  { resource: 'firms', auth: 'required' },

  // ── Firms Views ─────────────────────────────────────────────────
  { path: '/firms/views/list', method: 'GET', auth: 'required' },
  { path: '/firms/my-firm', method: 'GET', auth: 'required' },
  { path: '/firms/my-firms', method: 'GET', auth: 'required' },
  { path: '/firms/by-slug/:slug', method: 'GET', auth: 'required' },
  { path: '/firms/:id/view/detail', method: 'GET', auth: 'required' },
  { path: '/firms/:firmId/views/members', method: 'GET', auth: 'required' },

  // ── Public Firms ────────────────────────────────────────────────
  { path: '/public/firms', method: 'GET', auth: 'none' },
  { path: '/public/firms/:slug', method: 'GET', auth: 'none' },
  { path: '/public/firms/:slug/profile', method: 'GET', auth: 'none' },
  { path: '/public/firms/:slug/members', method: 'GET', auth: 'none' },

  // ── Public Companies ──────────────────────────────────────────
  { path: '/public/companies', method: 'GET', auth: 'none' },
  { path: '/public/companies/:slug', method: 'GET', auth: 'none' },
  { path: '/public/companies/:slug/profile', method: 'GET', auth: 'none' },
  { path: '/public/companies/:slug/jobs', method: 'GET', auth: 'none' },

  // ── Firm Invitations ────────────────────────────────────────────
  { path: '/firm-invitations/:token/preview', method: 'GET', auth: 'none' },
  { path: '/firm-invitations/:token/accept', method: 'POST', auth: 'required' },

  // ── Firm Members ────────────────────────────────────────────────
  { path: '/firms/:firmId/members', method: 'GET', auth: 'required' },
  { path: '/firms/:firmId/members/:memberId', method: 'DELETE', auth: 'required' },
  { path: '/firms/:firmId/transfer-ownership', method: 'POST', auth: 'required' },

  // ── Firm Invitations Management ─────────────────────────────────
  { path: '/firms/:firmId/invitations', method: 'GET', auth: 'required' },
  { path: '/firms/:firmId/invitations', method: 'POST', auth: 'required' },
  { path: '/firms/:firmId/invitations/:invitationId', method: 'DELETE', auth: 'required' },
  { path: '/firms/:firmId/invitations/:invitationId/resend', method: 'POST', auth: 'required' },

  // ── Assignments Views ───────────────────────────────────────────
  { path: '/assignments/views/list', method: 'GET', auth: 'required' },
  { path: '/assignments/:id/view/detail', method: 'GET', auth: 'required' },

  // ── Assignments Core CRUD ───────────────────────────────────────
  { resource: 'assignments', auth: 'required' },

  // ── Reputation Views ──────────────────────────────────────────
  { path: '/reputation/views/list', method: 'GET', auth: 'required' },

  // ── Reputation Core CRUD ────────────────────────────────────────
  { resource: 'reputation', auth: 'required' },

  // ── Company Reputation Views ──────────────────────────────────
  { path: '/company-reputation/views/list', method: 'GET', auth: 'required' },
  { path: '/company-reputation/:companyId/view/detail', method: 'GET', auth: 'required' },

  // ── Company Reputation ──────────────────────────────────────────
  { path: '/company-reputation', method: 'GET', auth: 'required' },
  { path: '/company-reputation/:companyId', method: 'GET', auth: 'required' },

  // ── Admin ───────────────────────────────────────────────────────
  // Network admin routes are NOT registered on the main gateway — they collide
  // with identity's /admin/counts and /admin/stats. These endpoints are only used
  // by the admin app, which routes through admin-gateway (service-prefixed paths).
];

export function registerNetworkV3Routes(app: FastifyInstance, services: ServiceRegistry) {
  const networkClient = services.get('network');

  registerV3Routes(app, networkClient, networkV3Routes);

  // ── Public Recruiter Profile (custom handler — rewrites path) ─────
  // Frontend calls /api/v3/public/recruiters/:slug but the network service
  // exposes this as /api/v3/recruiters/by-slug/:slug. Optional auth so
  // logged-in users get personalized data.
  app.get(
    '/api/v3/public/recruiters/:slug',
    { preHandler: optionalAuth() },
    async (request: any, reply: any) => {
      try {
        const { slug } = request.params as { slug: string };
        const query = request.query as Record<string, any>;
        const correlationId = (request as any).correlationId;
        const data = await networkClient.get(
          `/api/v3/recruiters/by-slug/${slug}`,
          query,
          correlationId,
          buildAuthHeaders(request)
        );
        return reply.send(data);
      } catch (error: any) {
        return reply
          .status(error?.statusCode || 500)
          .send(error?.jsonBody || { error: { code: 'PROXY_ERROR', message: error.message } });
      }
    }
  );
}
