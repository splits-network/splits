/**
 * POST /api/v3/calls/exchange-token — Public token exchange (no auth)
 *
 * Exchanges a magic-link access token for a LiveKit JWT and call details.
 * Used by the video app join flow.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessToken } from 'livekit-server-sdk';

interface LiveKitConfig {
  apiKey: string;
  apiSecret: string;
}

const bodySchema = {
  type: 'object',
  required: ['token'],
  properties: {
    token: { type: 'string' },
  },
  additionalProperties: false,
};

export function registerExchangeTokenRoute(
  app: FastifyInstance,
  supabase: SupabaseClient,
  livekit: LiveKitConfig,
) {
  app.post('/api/v3/calls/exchange-token', {
    schema: { body: bodySchema },
  }, async (request, reply) => {
    const { token } = request.body as { token: string };

    // Look up access token
    const { data: accessToken, error: atErr } = await supabase
      .from('call_access_tokens')
      .select('id, call_id, user_id, expires_at')
      .eq('token', token)
      .maybeSingle();

    if (atErr) throw atErr;
    if (!accessToken) {
      return reply.status(404).send({ error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } });
    }

    // Validate not expired
    if (new Date(accessToken.expires_at) <= new Date()) {
      return reply.status(410).send({ error: { code: 'TOKEN_EXPIRED', message: 'Token has expired' } });
    }

    // Mark as used
    await supabase
      .from('call_access_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', accessToken.id);

    // Get call detail with participants and entity links
    const { data: call, error: callErr } = await supabase
      .from('calls')
      .select(`
        *,
        participants:call_participants(id, call_id, user_id, role, joined_at, left_at,
          user:users!call_participants_user_id_fkey(name, email, profile_image_url)),
        entity_links:call_entity_links(id, call_id, entity_type, entity_id)
      `)
      .eq('id', accessToken.call_id)
      .maybeSingle();

    if (callErr) throw callErr;
    if (!call) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Call not found' } });
    }

    if (!call.livekit_room_name) {
      return reply.status(400).send({ error: { code: 'NOT_STARTED', message: 'Call has not started yet' } });
    }

    // Generate LiveKit JWT
    const at = new AccessToken(livekit.apiKey, livekit.apiSecret, {
      identity: accessToken.user_id,
      name: 'participant',
    });
    at.addGrant({
      roomJoin: true,
      room: call.livekit_room_name,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });
    at.ttl = '4h';
    const livekitToken = await at.toJwt();

    // Map participants for frontend
    const mappedCall = {
      ...call,
      participants: (call.participants || []).map((p: any) => ({
        ...p,
        user: p.user ? {
          name: p.user.name || '',
          avatar_url: p.user.profile_image_url || null,
          email: p.user.email || '',
        } : { name: '', avatar_url: null, email: '' },
      })),
      entity_links: call.entity_links || [],
    };

    return reply.send({ data: { livekit_token: livekitToken, call: mappedCall } });
  });
}
