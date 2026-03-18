/**
 * Calendar Preferences V3 Routes
 *
 * GET /api/v3/calls/calendar-preferences — Get user's calendar preferences
 * PUT /api/v3/calls/calendar-preferences — Upsert user's calendar preferences
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';

const upsertSchema = {
  type: 'object',
  properties: {
    connection_id: { type: ['string', 'null'] },
    primary_calendar_id: { type: ['string', 'null'] },
    additional_calendar_ids: { type: 'array', items: { type: 'string' } },
    working_hours_start: { type: 'string', pattern: '^\\d{2}:\\d{2}$' },
    working_hours_end: { type: 'string', pattern: '^\\d{2}:\\d{2}$' },
    working_days: { type: 'array', items: { type: 'integer', minimum: 1, maximum: 7 } },
    timezone: { type: 'string', minLength: 1 },
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

export function registerCalendarPreferencesRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  // GET /api/v3/calls/calendar-preferences
  app.get('/api/v3/calls/calendar-preferences', async (request, reply) => {
    const clerkUserId = requireAuth(request, reply);
    if (!clerkUserId) return;

    const userId = await resolveUserId(supabase, clerkUserId);
    if (!userId) {
      return reply.status(400).send({ error: { code: 'USER_NOT_FOUND', message: 'Could not resolve user' } });
    }

    const { data, error } = await supabase
      .from('user_calendar_preferences')
      .select('connection_id, primary_calendar_id, additional_calendar_ids, working_hours_start, working_hours_end, working_days, timezone')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    // Return defaults if no row exists
    const prefs = data || {
      connection_id: null,
      primary_calendar_id: null,
      additional_calendar_ids: [],
      working_hours_start: '09:00',
      working_hours_end: '17:00',
      working_days: [1, 2, 3, 4, 5],
      timezone: 'America/New_York',
    };

    return reply.send({ data: prefs });
  });

  // PUT /api/v3/calls/calendar-preferences
  app.put('/api/v3/calls/calendar-preferences', {
    schema: { body: upsertSchema },
  }, async (request, reply) => {
    const clerkUserId = requireAuth(request, reply);
    if (!clerkUserId) return;

    const userId = await resolveUserId(supabase, clerkUserId);
    if (!userId) {
      return reply.status(400).send({ error: { code: 'USER_NOT_FOUND', message: 'Could not resolve user' } });
    }

    const body = request.body as Record<string, any>;

    const { data, error } = await supabase
      .from('user_calendar_preferences')
      .upsert(
        { user_id: userId, ...body },
        { onConflict: 'user_id' },
      )
      .select('connection_id, primary_calendar_id, additional_calendar_ids, working_hours_start, working_hours_end, working_days, timezone')
      .single();

    if (error) throw error;

    return reply.send({ data });
  });
}
