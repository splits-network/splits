/**
 * OAuth2 Auth Routes V3 - Authorization and Token endpoints
 * POST /authorize, POST /token, POST /refresh, POST /revoke
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { GptConfig } from '@splits-network/shared-config';
import { Logger } from '@splits-network/shared-logging';
import { IEventPublisher } from '../../v2/shared/events.js';
import { OAuthAuthService } from './auth-service.js';
import { OAuthError } from '../../v2/oauth/types.js';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

interface AuthRouteDeps {
  supabase: SupabaseClient;
  gptConfig: GptConfig;
  eventPublisher: IEventPublisher;
  logger: Logger;
}

export function registerOAuthAuthRoutes(app: FastifyInstance, deps: AuthRouteDeps) {
  const { supabase, gptConfig, eventPublisher, logger } = deps;
  const authService = new OAuthAuthService(supabase, gptConfig, eventPublisher, logger);

  // POST /api/v3/gpt/oauth/authorize
  app.post('/api/v3/gpt/oauth/authorize', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);

    try {
      const body = request.body as {
        redirect_uri: string;
        scopes: string[];
        state: string;
        code_challenge?: string;
        code_challenge_method?: 'S256' | 'plain';
      };

      const result = await authService.authorize({
        clerkUserId,
        redirectUri: body.redirect_uri,
        scopes: body.scopes,
        state: body.state,
        codeChallenge: body.code_challenge,
        codeChallengeMethod: body.code_challenge_method,
      });

      return reply.send({ data: result });
    } catch (error) {
      return handleOAuthError(error, reply, logger);
    }
  });

  // POST /api/v3/gpt/oauth/token
  app.post('/api/v3/gpt/oauth/token', async (request, reply) => {
    try {
      const body = request.body as {
        grant_type: string;
        code: string;
        code_verifier?: string;
        client_id: string;
        client_secret: string;
        redirect_uri: string;
      };

      if (body.grant_type !== 'authorization_code') {
        return reply.status(400).send({
          error: { code: 'unsupported_grant_type', message: 'Only authorization_code grant is supported' },
        });
      }

      const result = await authService.exchangeCode({
        code: body.code,
        codeVerifier: body.code_verifier,
        clientId: body.client_id,
        clientSecret: body.client_secret,
        redirectUri: body.redirect_uri,
      });

      return reply.send({ data: result });
    } catch (error) {
      return handleOAuthError(error, reply, logger);
    }
  });

  // POST /api/v3/gpt/oauth/refresh
  app.post('/api/v3/gpt/oauth/refresh', async (request, reply) => {
    try {
      const body = request.body as {
        grant_type: string;
        refresh_token: string;
        client_id: string;
        client_secret: string;
      };

      if (body.grant_type !== 'refresh_token') {
        return reply.status(400).send({
          error: { code: 'unsupported_grant_type', message: 'Only refresh_token grant is supported' },
        });
      }

      const result = await authService.refresh({
        refreshToken: body.refresh_token,
        clientId: body.client_id,
        clientSecret: body.client_secret,
      });

      return reply.send({ data: result });
    } catch (error) {
      return handleOAuthError(error, reply, logger);
    }
  });

  // POST /api/v3/gpt/oauth/revoke
  app.post('/api/v3/gpt/oauth/revoke', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);

    try {
      const body = request.body as { session_id: string };
      await authService.revoke(body.session_id, clerkUserId);
      return reply.send({ data: { revoked: true } });
    } catch (error) {
      return handleOAuthError(error, reply, logger);
    }
  });
}

function handleOAuthError(error: unknown, reply: any, logger: Logger) {
  if (error instanceof OAuthError) {
    const status = error.code === 'invalid_client' ? 401
      : error.code === 'session_limit_exceeded' ? 429
      : 400;
    return reply.status(status).send({ error: { code: error.code, message: error.message } });
  }

  logger.error({ err: error }, 'OAuth route error');
  return reply.status(500).send({ error: { code: 'server_error', message: 'Internal server error' } });
}
