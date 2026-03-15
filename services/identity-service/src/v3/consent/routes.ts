/**
 * Consent V3 Routes — Get/Save/Delete user consent
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { ConsentRepository } from './repository';
import { ConsentService } from './service';
import { SaveConsentInput, saveConsentSchema } from './types';

export function registerConsentRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient
) {
  const repository = new ConsentRepository(supabase);
  const service = new ConsentService(repository, supabase);

  // GET /api/v3/consent — get current user consent
  app.get('/api/v3/consent', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.getConsent(clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/consent — save consent preferences
  app.post('/api/v3/consent', {
    schema: { body: saveConsentSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const body = request.body as SaveConsentInput;
    const input: SaveConsentInput = {
      preferences: {
        functional: Boolean(body.preferences.functional),
        analytics: Boolean(body.preferences.analytics),
        marketing: Boolean(body.preferences.marketing),
      },
      ip_address: body.ip_address || request.ip,
      user_agent: body.user_agent || (request.headers['user-agent'] as string | undefined),
      consent_source: body.consent_source || 'web',
    };
    const data = await service.saveConsent(clerkUserId, input);
    return reply.code(201).send({ data });
  });

  // DELETE /api/v3/consent — delete consent
  app.delete('/api/v3/consent', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    await service.deleteConsent(clerkUserId);
    return reply.code(204).send();
  });
}
