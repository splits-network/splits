/**
 * ATS Service V3 Gateway Routes
 *
 * Declarative config for all V3 job-related resources.
 * The proxy layer handles auth, CORS, correlation IDs — no custom handlers.
 */

import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { registerV3Routes, V3RouteConfig } from './proxy';
import { requireAuth } from '../../middleware/auth';
import { buildAuthHeaders } from '../../helpers/auth-headers';

const atsV3Routes: V3RouteConfig[] = [
  // ── Jobs Core CRUD ─────────────────────────────────────────────
  { resource: 'jobs', auth: 'required' },

  // ── Jobs List Views ────────────────────────────────────────────
  { path: '/jobs/views/recruiter-board', method: 'GET', auth: 'required' },
  { path: '/jobs/views/company-board', method: 'GET', auth: 'required' },
  { path: '/jobs/views/candidate-listing', method: 'GET', auth: 'optional' },
  { path: '/jobs/views/admin-board', method: 'GET', auth: 'required' },
  { path: '/jobs/views/termination-impact', method: 'GET', auth: 'required' },

  // ── Jobs Detail Views ──────────────────────────────────────────
  { path: '/jobs/:id/view/recruiter-detail', method: 'GET', auth: 'required' },
  { path: '/jobs/:id/view/company-detail', method: 'GET', auth: 'required' },
  { path: '/jobs/:id/view/candidate-detail', method: 'GET', auth: 'optional' },
  { path: '/jobs/:id/view/editor', method: 'GET', auth: 'required' },

  // ── Jobs Actions ───────────────────────────────────────────────
  { path: '/jobs/actions/process-termination', method: 'POST', auth: 'required' },

  // ── Job Requirements Core CRUD ─────────────────────────────────
  { resource: 'job-requirements', auth: 'required' },

  // ── Job Requirements Actions ───────────────────────────────────
  { path: '/job-requirements/actions/bulk-replace', method: 'POST', auth: 'required' },

  // ── Job Skills (partial CRUD) ──────────────────────────────────
  // Cannot use `resource` helper (no PATCH/:id, composite delete key)
  { path: '/job-skills', method: 'GET', auth: 'required' },
  { path: '/job-skills', method: 'POST', auth: 'required' },
  // DELETE for composite key registered manually below

  // ── Job Skills Actions ─────────────────────────────────────────
  { path: '/job-skills/actions/bulk-replace', method: 'POST', auth: 'required' },

  // ── Saved Jobs Core CRUD ───────────────────────────────────────
  { resource: 'saved-jobs', auth: 'required' },

  // ── Saved Jobs Views ───────────────────────────────────────────
  { path: '/saved-jobs/views/enriched', method: 'GET', auth: 'required' },
];

export function registerAtsV3Routes(app: FastifyInstance, services: ServiceRegistry) {
  const atsClient = services.get('ats');

  registerV3Routes(app, atsClient, atsV3Routes);

  // Manual registration for job-skills composite delete (DELETE not in V3RouteConfig)
  app.delete('/api/v3/job-skills/:jobId/:skillId', {
    preHandler: requireAuth(),
  }, async (request, reply) => {
    try {
      const { jobId, skillId } = request.params as { jobId: string; skillId: string };
      const correlationId = (request as any).correlationId;
      const headers = buildAuthHeaders(request);
      const data = await atsClient.delete(
        `/api/v3/job-skills/${jobId}/${skillId}`,
        correlationId,
        headers
      );
      return reply.send(data);
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send(
        error.jsonBody || { error: { code: 'PROXY_ERROR', message: error.message } }
      );
    }
  });
}
