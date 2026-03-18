/**
 * Identity Service V3 Gateway Routes
 *
 * Declarative config for all V3 identity-related resources.
 * The proxy layer handles auth, CORS, correlation IDs — no custom handlers.
 */

import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { registerV3Routes, V3RouteConfig } from './proxy';
import { requireAuth } from '../../middleware/auth';
import { buildAuthHeaders } from '../../helpers/auth-headers';

const identityV3Routes: V3RouteConfig[] = [
  // ── Users (specific paths before :id to avoid collision) ────────
  { path: '/users/me', method: 'GET', auth: 'required' },
  { path: '/users/me', method: 'PATCH', auth: 'required' },
  { path: '/users/register', method: 'POST', auth: 'required' },
  { path: '/users/activity', method: 'POST', auth: 'required' },
  { path: '/users/profile-image', method: 'PATCH', auth: 'required' },
  { path: '/users/profile-image', method: 'DELETE', auth: 'required' },
  { path: '/users', method: 'GET', auth: 'required' },
  { path: '/users/:id', method: 'GET', auth: 'required' },
  { path: '/users', method: 'POST', auth: 'required' },
  { path: '/users/:id', method: 'PATCH', auth: 'required' },
  { path: '/users/:id', method: 'DELETE', auth: 'required' },

  // ── User Roles Views (before CRUD to avoid :id collision) ──────
  { path: '/user-roles/views/detail', method: 'GET', auth: 'required' },
  { path: '/user-roles/:id/view/detail', method: 'GET', auth: 'required' },

  // ── User Roles Core CRUD ────────────────────────────────────────
  { resource: 'user-roles', auth: 'required' },

  // ── Organizations Core CRUD ─────────────────────────────────────
  { resource: 'organizations', auth: 'required' },

  // ── Memberships Views (before CRUD to avoid :id collision) ─────
  { path: '/memberships/views/detail', method: 'GET', auth: 'required' },
  { path: '/memberships/:id/view/detail', method: 'GET', auth: 'required' },

  // ── Memberships Core CRUD ───────────────────────────────────────
  { resource: 'memberships', auth: 'required' },

  // ── Invitations Views (before CRUD to avoid :id collision) ─────
  { path: '/invitations/views/detail', method: 'GET', auth: 'required' },
  { path: '/invitations/:id/view/detail', method: 'GET', auth: 'required' },

  // ── Invitations Core CRUD ───────────────────────────────────────
  { resource: 'invitations', auth: 'required' },

  // ── Invitations Actions ─────────────────────────────────────────
  { path: '/invitations/:id/preview', method: 'GET', auth: 'none' },
  { path: '/invitations/:id/accept', method: 'POST', auth: 'required' },
  { path: '/invitations/:id/resend', method: 'POST', auth: 'required' },

  // ── Consent ─────────────────────────────────────────────────────
  { path: '/consent', method: 'GET', auth: 'required' },
  { path: '/consent', method: 'POST', auth: 'required' },
  { path: '/consent', method: 'DELETE', auth: 'required' },

  // ── Webhooks ────────────────────────────────────────────────────
  { path: '/webhooks/health', method: 'GET', auth: 'none' },
  { path: '/webhooks/clerk', method: 'POST', auth: 'none' },
];

export function registerIdentityV3Routes(app: FastifyInstance, services: ServiceRegistry) {
  const identityClient = services.get('identity');

  registerV3Routes(app, identityClient, identityV3Routes);
}
