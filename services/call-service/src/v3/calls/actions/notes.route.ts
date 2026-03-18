/**
 * Call Notes V3 Routes
 *
 * POST /api/v3/calls/:id/notes — Create a note on a call
 * GET  /api/v3/calls/:id/notes — List notes for a call
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { idParamSchema } from '../types';

const createNoteSchema = {
  type: 'object',
  required: ['content'],
  properties: {
    content: { type: 'string', minLength: 1, maxLength: 10000 },
  },
  additionalProperties: false,
};

function requireAuth(request: any, reply: any): string | null {
  const clerkUserId = request.headers['x-clerk-user-id'] as string;
  if (!clerkUserId) {
    reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    return null;
  }
  return clerkUserId;
}

async function resolveUserId(supabase: SupabaseClient, clerkUserId: string): Promise<string | null> {
  const isClerkId = clerkUserId.startsWith('user_');
  const column = isClerkId ? 'clerk_user_id' : 'id';
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq(column, clerkUserId)
    .maybeSingle();
  if (error) throw error;
  return data?.id || null;
}

export function registerNotesRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  // GET /api/v3/calls/:id/notes
  app.get('/api/v3/calls/:id/notes', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = requireAuth(request, reply);
    if (!clerkUserId) return;

    const { id: callId } = request.params as { id: string };

    const { data: notes, error } = await supabase
      .from('call_notes')
      .select('id, call_id, user_id, content, created_at, updated_at, user:users!call_notes_user_id_fkey(name)')
      .eq('call_id', callId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Flatten user join
    const mapped = (notes || []).map((n: any) => ({
      ...n,
      user: { name: n.user?.name || '' },
    }));

    return reply.send({ data: mapped });
  });

  // POST /api/v3/calls/:id/notes
  app.post('/api/v3/calls/:id/notes', {
    schema: { params: idParamSchema, body: createNoteSchema },
  }, async (request, reply) => {
    const clerkUserId = requireAuth(request, reply);
    if (!clerkUserId) return;

    const { id: callId } = request.params as { id: string };
    const { content } = request.body as { content: string };

    const userId = await resolveUserId(supabase, clerkUserId);
    if (!userId) {
      return reply.status(400).send({ error: { code: 'USER_NOT_FOUND', message: 'Could not resolve user' } });
    }

    // Upsert — schema has unique constraint on (call_id, user_id)
    const { data: note, error } = await supabase
      .from('call_notes')
      .upsert(
        { call_id: callId, user_id: userId, content },
        { onConflict: 'call_id,user_id' },
      )
      .select('id, call_id, user_id, content, created_at, updated_at')
      .single();

    if (error) throw error;

    return reply.code(201).send({ data: note });
  });
}
