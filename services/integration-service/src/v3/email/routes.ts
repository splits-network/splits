/**
 * Email V3 Routes
 * Proxies to external email APIs (Gmail, Microsoft) via V3 infrastructure.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { CryptoService } from '@splits-network/shared-config/src/crypto';
import { IEventPublisher } from '../../v2/shared/events.js';
import { ConnectionAdapter } from '../connections/connection-adapter.js';
import { TokenRefreshService } from '../calendar/token-refresh-service.js';
import { EmailService, SendEmailParams } from './service.js';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

function getClerkUserId(request: any): string | null {
  return (request.headers['x-clerk-user-id'] as string) || null;
}

function mapErrorStatus(err: any): number {
  if (err.message?.includes('Unauthorized')) return 403;
  if (err.message?.includes('not found')) return 404;
  if (err.message?.includes('expired')) return 401;
  return 500;
}

interface EmailRouteConfig {
  supabase: SupabaseClient;
  eventPublisher: IEventPublisher;
  logger: Logger;
  crypto: CryptoService;
}

export function registerEmailRoutes(app: FastifyInstance, config: EmailRouteConfig) {
  const adapter = new ConnectionAdapter(config.supabase);
  const tokenRefresh = new TokenRefreshService(
    config.supabase, config.eventPublisher, config.logger, config.crypto,
  );
  const service = new EmailService(adapter, tokenRefresh, config.logger);

  // GET /api/v3/integrations/email/:connectionId/messages
  app.get('/api/v3/integrations/email/:connectionId/messages', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { connectionId } = request.params as { connectionId: string };
    const query = request.query as {
      q?: string;
      max_results?: string;
      page_token?: string;
    };

    try {
      const result = await service.listMessages(connectionId, clerkUserId, {
        query: query.q,
        maxResults: query.max_results ? parseInt(query.max_results, 10) : 25,
        pageToken: query.page_token,
      });
      return reply.send({ data: result });
    } catch (err: any) {
      config.logger.error({ err, connectionId }, 'Failed to list messages');
      return reply.status(mapErrorStatus(err)).send({ error: err.message });
    }
  });

  // GET /api/v3/integrations/email/:connectionId/messages/:messageId
  app.get('/api/v3/integrations/email/:connectionId/messages/:messageId', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { connectionId, messageId } = request.params as { connectionId: string; messageId: string };

    try {
      const message = await service.getMessage(connectionId, clerkUserId, messageId);
      return reply.send({ data: message });
    } catch (err: any) {
      config.logger.error({ err, connectionId, messageId }, 'Failed to get message');
      return reply.status(mapErrorStatus(err)).send({ error: err.message });
    }
  });

  // GET /api/v3/integrations/email/:connectionId/threads/:threadId
  app.get('/api/v3/integrations/email/:connectionId/threads/:threadId', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { connectionId, threadId } = request.params as { connectionId: string; threadId: string };

    try {
      const thread = await service.getThread(connectionId, clerkUserId, threadId);
      return reply.send({ data: thread });
    } catch (err: any) {
      config.logger.error({ err, connectionId, threadId }, 'Failed to get thread');
      return reply.status(mapErrorStatus(err)).send({ error: err.message });
    }
  });

  // POST /api/v3/integrations/email/:connectionId/messages/:messageId/trash
  app.post('/api/v3/integrations/email/:connectionId/messages/:messageId/trash', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { connectionId, messageId } = request.params as { connectionId: string; messageId: string };

    try {
      await service.trashMessage(connectionId, clerkUserId, messageId);
      return reply.send({ data: { success: true } });
    } catch (err: any) {
      config.logger.error({ err, connectionId, messageId }, 'Failed to trash message');
      return reply.status(mapErrorStatus(err)).send({ error: err.message });
    }
  });

  // POST /api/v3/integrations/email/:connectionId/messages/:messageId/archive
  app.post('/api/v3/integrations/email/:connectionId/messages/:messageId/archive', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { connectionId, messageId } = request.params as { connectionId: string; messageId: string };

    try {
      await service.archiveMessage(connectionId, clerkUserId, messageId);
      return reply.send({ data: { success: true } });
    } catch (err: any) {
      config.logger.error({ err, connectionId, messageId }, 'Failed to archive message');
      return reply.status(mapErrorStatus(err)).send({ error: err.message });
    }
  });

  // POST /api/v3/integrations/email/:connectionId/messages/:messageId/read
  app.post('/api/v3/integrations/email/:connectionId/messages/:messageId/read', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { connectionId, messageId } = request.params as { connectionId: string; messageId: string };

    try {
      await service.markAsRead(connectionId, clerkUserId, messageId);
      return reply.send({ data: { success: true } });
    } catch (err: any) {
      config.logger.error({ err, connectionId, messageId }, 'Failed to mark as read');
      return reply.status(mapErrorStatus(err)).send({ error: err.message });
    }
  });

  // POST /api/v3/integrations/email/:connectionId/messages/:messageId/unread
  app.post('/api/v3/integrations/email/:connectionId/messages/:messageId/unread', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { connectionId, messageId } = request.params as { connectionId: string; messageId: string };

    try {
      await service.markAsUnread(connectionId, clerkUserId, messageId);
      return reply.send({ data: { success: true } });
    } catch (err: any) {
      config.logger.error({ err, connectionId, messageId }, 'Failed to mark as unread');
      return reply.status(mapErrorStatus(err)).send({ error: err.message });
    }
  });

  // POST /api/v3/integrations/email/:connectionId/messages/:messageId/labels
  app.post('/api/v3/integrations/email/:connectionId/messages/:messageId/labels', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { connectionId, messageId } = request.params as { connectionId: string; messageId: string };
    const { add, remove } = request.body as { add?: string[]; remove?: string[] };

    try {
      await service.modifyLabels(connectionId, clerkUserId, messageId, add ?? [], remove ?? []);
      return reply.send({ data: { success: true } });
    } catch (err: any) {
      config.logger.error({ err, connectionId, messageId }, 'Failed to modify labels');
      return reply.status(mapErrorStatus(err)).send({ error: err.message });
    }
  });

  // GET /api/v3/integrations/email/:connectionId/labels
  app.get('/api/v3/integrations/email/:connectionId/labels', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { connectionId } = request.params as { connectionId: string };

    try {
      const labels = await service.listLabels(connectionId, clerkUserId);
      return reply.send({ data: labels });
    } catch (err: any) {
      config.logger.error({ err, connectionId }, 'Failed to list labels');
      return reply.status(mapErrorStatus(err)).send({ error: err.message });
    }
  });

  // POST /api/v3/integrations/email/:connectionId/messages/send
  app.post('/api/v3/integrations/email/:connectionId/messages/send', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { connectionId } = request.params as { connectionId: string };
    const body = request.body as {
      to: string[];
      cc?: string[];
      bcc?: string[];
      subject: string;
      body: string;
      body_type?: 'text' | 'html';
      in_reply_to?: string;
      thread_id?: string;
    };

    if (!body.to?.length || !body.subject || !body.body) {
      return reply.status(400).send({ error: 'to, subject, and body are required' });
    }

    try {
      const params: SendEmailParams = {
        to: body.to,
        cc: body.cc,
        bcc: body.bcc,
        subject: body.subject,
        body: body.body,
        bodyType: body.body_type,
        inReplyTo: body.in_reply_to,
        threadId: body.thread_id,
      };
      const message = await service.sendMessage(connectionId, clerkUserId, params);
      return reply.status(201).send({ data: message });
    } catch (err: any) {
      config.logger.error({ err, connectionId }, 'Failed to send message');
      return reply.status(mapErrorStatus(err)).send({ error: err.message });
    }
  });
}
