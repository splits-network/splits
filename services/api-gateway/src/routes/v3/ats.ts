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

  // ── Jobs Activity Timeline ────────────────────────────────────
  { path: '/jobs/:id/activity', method: 'GET', auth: 'required' },

  // ── Job Notes ────────────────────────────────────────────────
  { path: '/jobs/:id/notes', method: 'GET', auth: 'required' },
  { path: '/jobs/:id/notes', method: 'POST', auth: 'required' },
  { path: '/jobs/:id/notes/:noteId', method: 'PATCH', auth: 'required' },
  { path: '/jobs/:id/notes/:noteId', method: 'DELETE', auth: 'required' },

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

  // ── Recruiter Saved Jobs Core CRUD ───────────────────────────
  { resource: 'recruiter-saved-jobs', auth: 'required' },

  // ── Recruiter Saved Candidates Core CRUD ─────────────────────
  { resource: 'recruiter-saved-candidates', auth: 'required' },

  // ── Company Sourcers Core CRUD ──────────────────────────────
  { resource: 'company-sourcers', auth: 'required' },

  // ── Company Sourcers Views ──────────────────────────────────
  { path: '/company-sourcers/check-protection/:companyId', method: 'GET', auth: 'required' },

  // ── Job Recommendations Core CRUD ────────────────────────────
  { resource: 'job-recommendations', auth: 'required' },

  // ── Job Recommendations Views ────────────────────────────────
  { path: '/job-recommendations/mine', method: 'GET', auth: 'required' },
  { path: '/job-recommendations/:id/view/detail', method: 'GET', auth: 'required' },

  // ── Candidates Core CRUD ──────────────────────────────────────
  { resource: 'candidates', auth: 'required' },

  // ── Candidates Views ──────────────────────────────────────────
  { path: '/candidates/me', method: 'GET', auth: 'required' },
  { path: '/candidates/views/enriched', method: 'GET', auth: 'required' },
  { path: '/candidates/:id/view/detail', method: 'GET', auth: 'required' },
  { path: '/candidates/:id/dashboard-stats', method: 'GET', auth: 'required' },
  { path: '/candidates/:id/recent-applications', method: 'GET', auth: 'required' },
  { path: '/candidates/:id/primary-resume', method: 'GET', auth: 'required' },

  // ── Companies Core CRUD ───────────────────────────────────────
  { resource: 'companies', auth: 'required' },

  // ── Companies Views ───────────────────────────────────────────
  { path: '/companies/:id/contacts', method: 'GET', auth: 'required' },

  // ── Applications Core CRUD ────────────────────────────────────
  { resource: 'applications', auth: 'required' },

  // ── Applications Views ──────────────────────────────────────
  { path: '/applications/:id/view/detail', method: 'GET', auth: 'required' },

  // ── Applications Actions ──────────────────────────────────────
  { path: '/applications/propose', method: 'POST', auth: 'required' },
  { path: '/applications/affected-by-termination', method: 'GET', auth: 'required' },
  { path: '/applications/termination-decisions', method: 'POST', auth: 'required' },
  { path: '/applications/:id/accept-proposal', method: 'POST', auth: 'required' },
  { path: '/applications/:id/decline-proposal', method: 'POST', auth: 'required' },
  { path: '/applications/:id/accept-offer', method: 'POST', auth: 'required' },
  { path: '/applications/:id/hire', method: 'POST', auth: 'required' },
  { path: '/applications/:id/trigger-ai-review', method: 'POST', auth: 'required' },
  { path: '/applications/:id/return-to-draft', method: 'POST', auth: 'required' },
  { path: '/applications/:id/submit', method: 'POST', auth: 'required' },
  { path: '/applications/:id/request-prescreen', method: 'POST', auth: 'required' },
  { path: '/applications/:id/reactivate', method: 'POST', auth: 'required' },

  // ── Placements Core CRUD ──────────────────────────────────────
  { resource: 'placements', auth: 'required' },

  // ── Placements Views ────────────────────────────────────────
  { path: '/placements/views/enriched', method: 'GET', auth: 'required' },
  { path: '/placements/:id/view/detail', method: 'GET', auth: 'required' },

  // ── Candidate Sourcers Core CRUD ──────────────────────────────
  { resource: 'candidate-sourcers', auth: 'required' },

  // ── Application Notes Core CRUD ───────────────────────────────
  { resource: 'application-notes', auth: 'required' },

  // ── Pre-Screen ────────────────────────────────────────────────
  { path: '/pre-screen', method: 'GET', auth: 'required' },
  { path: '/pre-screen', method: 'POST', auth: 'required' },
  { path: '/pre-screen/answers/:applicationId', method: 'GET', auth: 'required' },
  { path: '/pre-screen/:jobId', method: 'GET', auth: 'required' },
  { path: '/pre-screen/:jobId', method: 'PATCH', auth: 'required' },
  { path: '/pre-screen/:jobId', method: 'DELETE', auth: 'required' },

  // ── Skills (lookup table) ─────────────────────────────────────
  { path: '/skills', method: 'GET', auth: 'required' },
  { path: '/skills/:id', method: 'GET', auth: 'required' },
  { path: '/skills', method: 'POST', auth: 'required' },
  { path: '/skills/:id', method: 'DELETE', auth: 'required' },

  // ── Candidate Skills (junction) ───────────────────────────────
  { path: '/candidate-skills', method: 'GET', auth: 'required' },
  { path: '/candidate-skills', method: 'POST', auth: 'required' },
  { path: '/candidate-skills/candidate/:candidateId/bulk-replace', method: 'PUT', auth: 'required' },
  // DELETE for composite key registered manually below

  // ── Company Skills (junction) ─────────────────────────────────
  { path: '/company-skills', method: 'GET', auth: 'required' },
  { path: '/company-skills', method: 'POST', auth: 'required' },
  { path: '/company-skills/company/:companyId/bulk-replace', method: 'PUT', auth: 'required' },
  // DELETE for composite key registered manually below

  // ── Perks (lookup table) ──────────────────────────────────────
  { path: '/perks', method: 'GET', auth: 'required' },
  { path: '/perks/:id', method: 'GET', auth: 'required' },
  { path: '/perks', method: 'POST', auth: 'required' },
  { path: '/perks/:id', method: 'DELETE', auth: 'required' },

  // ── Company Perks (junction) ──────────────────────────────────
  { path: '/company-perks', method: 'GET', auth: 'required' },
  { path: '/company-perks', method: 'POST', auth: 'required' },
  { path: '/company-perks/company/:companyId/bulk-replace', method: 'PUT', auth: 'required' },
  // DELETE for composite key registered manually below

  // ── Culture Tags (lookup table) ───────────────────────────────
  { path: '/culture-tags', method: 'GET', auth: 'required' },
  { path: '/culture-tags/:id', method: 'GET', auth: 'required' },
  { path: '/culture-tags', method: 'POST', auth: 'required' },
  { path: '/culture-tags/:id', method: 'DELETE', auth: 'required' },

  // ── Company Culture Tags (junction) ───────────────────────────
  { path: '/company-culture-tags', method: 'GET', auth: 'required' },
  { path: '/company-culture-tags', method: 'POST', auth: 'required' },
  { path: '/company-culture-tags/company/:companyId/bulk-replace', method: 'PUT', auth: 'required' },
  // DELETE for composite key registered manually below
];

export function registerAtsV3Routes(app: FastifyInstance, services: ServiceRegistry) {
  const atsClient = services.get('ats');

  registerV3Routes(app, atsClient, atsV3Routes);

  // ── Application Notes nested URL aliases ───────────────────────────────
  // Frontend calls /applications/:id/notes — rewrite to flat /application-notes?application_id=:id
  app.get('/api/v3/applications/:id/notes', {
    preHandler: requireAuth(),
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const query = { ...(request.query as Record<string, any>), application_id: id };
      const qs = new URLSearchParams();
      Object.entries(query).forEach(([k, v]) => { if (v != null) qs.append(k, String(v)); });
      const path = `/api/v3/application-notes?${qs.toString()}`;
      const data = await atsClient.get(path, undefined, (request as any).correlationId, buildAuthHeaders(request));
      return reply.send(data);
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send(error.jsonBody || { error: { code: 'PROXY_ERROR', message: error.message } });
    }
  });

  app.post('/api/v3/applications/:id/notes', {
    preHandler: requireAuth(),
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = { ...(request.body as Record<string, any>), application_id: id };
      const data = await atsClient.post('/api/v3/application-notes', body, (request as any).correlationId, buildAuthHeaders(request));
      return reply.status(201).send(data);
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send(error.jsonBody || { error: { code: 'PROXY_ERROR', message: error.message } });
    }
  });

  app.patch('/api/v3/applications/:id/notes/:noteId', {
    preHandler: requireAuth(),
  }, async (request, reply) => {
    try {
      const { noteId } = request.params as { id: string; noteId: string };
      const data = await atsClient.patch(`/api/v3/application-notes/${noteId}`, request.body, (request as any).correlationId, buildAuthHeaders(request));
      return reply.send(data);
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send(error.jsonBody || { error: { code: 'PROXY_ERROR', message: error.message } });
    }
  });

  app.delete('/api/v3/applications/:id/notes/:noteId', {
    preHandler: requireAuth(),
  }, async (request, reply) => {
    try {
      const { noteId } = request.params as { id: string; noteId: string };
      const data = await atsClient.delete(`/api/v3/application-notes/${noteId}`, (request as any).correlationId, buildAuthHeaders(request));
      return reply.send(data);
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send(error.jsonBody || { error: { code: 'PROXY_ERROR', message: error.message } });
    }
  });

  // Manual registration for composite-key DELETEs (not supported by V3RouteConfig resource helper)
  const compositeDeletes = [
    { path: '/api/v3/job-skills/:jobId/:skillId', params: ['jobId', 'skillId'] },
    { path: '/api/v3/candidate-skills/:candidateId/:skillId', params: ['candidateId', 'skillId'] },
    { path: '/api/v3/company-skills/:companyId/:skillId', params: ['companyId', 'skillId'] },
    { path: '/api/v3/company-perks/:companyId/:perkId', params: ['companyId', 'perkId'] },
    { path: '/api/v3/company-culture-tags/:companyId/:cultureTagId', params: ['companyId', 'cultureTagId'] },
  ];

  for (const route of compositeDeletes) {
    app.delete(route.path, {
      preHandler: requireAuth(),
    }, async (request, reply) => {
      try {
        const params = request.params as Record<string, string>;
        const segments = route.params.map(p => params[p]).join('/');
        const basePath = route.path.split('/:')[0];
        const correlationId = (request as any).correlationId;
        const headers = buildAuthHeaders(request);
        const data = await atsClient.delete(
          `${basePath}/${segments}`,
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
}
