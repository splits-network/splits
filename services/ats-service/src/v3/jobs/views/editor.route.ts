/**
 * GET /api/v3/jobs/:id/view/editor
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { EditorRepository } from './editor.repository.js';
import { EditorService } from './editor.service.js';
import { idParamSchema } from '../types.js';

export function registerEditorView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new EditorRepository(supabase);
  const service = new EditorService(repository, supabase);

  app.get('/api/v3/jobs/:id/view/editor', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.getEditor(id, clerkUserId);
    reply.header('Cache-Control', 'private, max-age=30');
    return reply.send({ data });
  });
}
