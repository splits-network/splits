/**
 * Parse Resume Action Routes
 *
 * POST /api/v3/smart-resume-profiles/actions/parse-resume
 *   Preview mode: extract from document, diff against existing, return comparison
 *
 * POST /api/v3/smart-resume-profiles/actions/commit-import
 *   Commit mode: apply user-selected entries from a preview
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../../v2/shared/events.js';
import type { IAiClient } from '@splits-network/shared-ai-client';
import { ParseResumeService } from './parse-resume.service.js';

const previewBodySchema = {
  type: 'object',
  required: ['candidate_id', 'document_id'],
  properties: {
    candidate_id: { type: 'string', format: 'uuid' },
    document_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

const commitBodySchema = {
  type: 'object',
  required: ['candidate_id', 'selections'],
  properties: {
    candidate_id: { type: 'string', format: 'uuid' },
    document_id: { type: 'string', format: 'uuid' },
    profile_updates: { type: 'object' },
    selections: {
      type: 'array',
      items: {
        type: 'object',
        required: ['section', 'entries'],
        properties: {
          section: { type: 'string' },
          entries: {
            type: 'array',
            items: {
              type: 'object',
              required: ['status', 'data'],
              properties: {
                status: { type: 'string', enum: ['new', 'updated'] },
                data: { type: 'object' },
                existing_id: { type: 'string', format: 'uuid' },
              },
              additionalProperties: false,
            },
          },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
};

export function registerParseResumeAction(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
  aiClient?: IAiClient,
) {
  const service = new ParseResumeService(supabase, eventPublisher, aiClient);
  const accessResolver = new AccessContextResolver(supabase);

  // Preview: extract + diff
  app.post('/api/v3/smart-resume-profiles/actions/parse-resume', {
    schema: { body: previewBodySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const { candidate_id } = request.body as { candidate_id: string; document_id: string };
    const context = await accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && context.candidateId !== candidate_id) {
      throw new ForbiddenError('You can only parse your own resume');
    }

    const data = await service.preview(request.body as { candidate_id: string; document_id: string });
    return reply.send({ data });
  });

  // Commit: apply selected entries
  app.post('/api/v3/smart-resume-profiles/actions/commit-import', {
    schema: { body: commitBodySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const { candidate_id } = request.body as { candidate_id: string };
    const context = await accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && context.candidateId !== candidate_id) {
      throw new ForbiddenError('You can only import to your own Smart Resume');
    }

    const data = await service.commit(request.body as any);
    return reply.code(201).send({ data });
  });
}
