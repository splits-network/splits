/**
 * POST /api/v3/calls/:id/token — Generate access + LiveKit token
 */

import crypto from 'crypto';
import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessToken } from 'livekit-server-sdk';
import { idParamSchema } from '../types.js';

interface LiveKitConfig {
  apiKey: string;
  apiSecret: string;
}

export function registerTokenRoute(
  app: FastifyInstance,
  supabase: SupabaseClient,
  livekit: LiveKitConfig,
) {
  app.post('/api/v3/calls/:id/token', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const { id: callId } = request.params as { id: string };

    // Resolve Clerk user ID to internal user ID
    const isClerkId = clerkUserId.startsWith('user_');
    const column = isClerkId ? 'clerk_user_id' : 'id';
    const { data: userRow, error: userErr } = await supabase
      .from('users')
      .select('id')
      .eq(column, clerkUserId)
      .maybeSingle();

    if (userErr) throw userErr;
    if (!userRow) {
      return reply.status(400).send({ error: { code: 'USER_NOT_FOUND', message: 'Could not resolve user' } });
    }
    const userId = userRow.id;

    // Validate user is a participant
    const { data: participants, error: pErr } = await supabase
      .from('call_participants')
      .select('user_id, role')
      .eq('call_id', callId);

    if (pErr) throw pErr;
    const participant = (participants || []).find((p: any) => p.user_id === userId);
    if (!participant) {
      return reply.status(403).send({ error: { code: 'NOT_PARTICIPANT', message: 'You are not a participant in this call' } });
    }

    // Get call record
    const { data: call, error: callErr } = await supabase
      .from('calls')
      .select('id, livekit_room_name')
      .eq('id', callId)
      .maybeSingle();

    if (callErr) throw callErr;
    if (!call) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Call not found' } });
    }
    if (!call.livekit_room_name) {
      return reply.status(400).send({ error: { code: 'NOT_STARTED', message: 'Call has not started yet' } });
    }

    // Generate access token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: insertErr } = await supabase
      .from('call_access_tokens')
      .insert({ call_id: callId, user_id: userId, token, expires_at: expiresAt });

    if (insertErr) throw insertErr;

    // Generate LiveKit JWT
    const at = new AccessToken(livekit.apiKey, livekit.apiSecret, {
      identity: userId,
      name: participant.role,
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

    return reply.send({ data: { access_token: token, livekit_token: livekitToken, call_id: callId } });
  });
}
