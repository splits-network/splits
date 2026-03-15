/**
 * Document Service V3 Gateway Routes
 *
 * Declarative config for document management.
 * Profile-image upload uses a custom multipart stream proxy.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { registerV3Routes, V3RouteConfig } from './proxy';
import { requireAuth } from '../../middleware/auth';
import { buildAuthHeaders } from '../../helpers/auth-headers';

const documentV3Routes: V3RouteConfig[] = [
  { path: '/documents', method: 'GET', auth: 'required' },
  { path: '/documents/:id', method: 'GET', auth: 'required' },
  { path: '/documents/:id', method: 'PATCH', auth: 'required' },
  { path: '/documents/:id', method: 'DELETE', auth: 'required' },
];

export function registerDocumentV3Routes(app: FastifyInstance, services: ServiceRegistry) {
  const documentClient = services.get('document');

  registerV3Routes(app, documentClient, documentV3Routes);

  // Document upload — multipart stream proxy to document service
  app.post('/api/v3/documents', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const correlationId = (request as any).correlationId || 'unknown';
    const authHeaders = buildAuthHeaders(request);
    const documentServiceUrl = process.env.DOCUMENT_SERVICE_URL || 'http://localhost:3006';

    try {
      const proxyHeaders: Record<string, string> = {
        ...authHeaders,
        'x-correlation-id': correlationId,
      };
      if (request.headers['content-type']) {
        proxyHeaders['content-type'] = request.headers['content-type'] as string;
      }
      if (request.headers['content-length']) {
        proxyHeaders['content-length'] = request.headers['content-length'] as string;
      }

      const response = await fetch(`${documentServiceUrl}/api/v2/documents`, {
        method: 'POST',
        body: request.raw,
        headers: proxyHeaders,
        duplex: 'half',
      } as RequestInit);

      const responseText = await response.text();

      if (!response.ok) {
        try {
          return reply.status(response.status).send(JSON.parse(responseText));
        } catch {
          return reply.status(response.status).send({ error: { message: 'Document upload failed' } });
        }
      }

      try {
        const result = JSON.parse(responseText);
        return reply.status(201).send(result);
      } catch {
        return reply.status(500).send({ error: { message: 'Invalid response from document service' } });
      }
    } catch (error: any) {
      request.log.error({ error: error.message, correlationId }, 'Failed to upload document');
      return reply.status(500).send({ error: { message: 'Document upload failed' } });
    }
  });

  // Profile-image upload — multipart stream proxy to document service
  app.post('/api/v3/documents/profile-image', {
    preHandler: requireAuth(),
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const correlationId = (request as any).correlationId || 'unknown';
    const authHeaders = buildAuthHeaders(request);
    const documentServiceUrl = process.env.DOCUMENT_SERVICE_URL || 'http://localhost:3006';

    try {
      const proxyHeaders: Record<string, string> = {
        ...authHeaders,
        'x-correlation-id': correlationId,
      };
      if (request.headers['content-type']) {
        proxyHeaders['content-type'] = request.headers['content-type'] as string;
      }
      if (request.headers['content-length']) {
        proxyHeaders['content-length'] = request.headers['content-length'] as string;
      }

      const response = await fetch(`${documentServiceUrl}/api/v2/documents/profile-image`, {
        method: 'POST',
        body: request.raw,
        headers: proxyHeaders,
        duplex: 'half',
      } as RequestInit);

      const responseText = await response.text();

      if (!response.ok) {
        try {
          return reply.status(response.status).send(JSON.parse(responseText));
        } catch {
          return reply.status(response.status).send({ error: { message: 'Profile image upload failed' } });
        }
      }

      try {
        const result = JSON.parse(responseText);
        return reply.status(201).send(result);
      } catch {
        return reply.status(500).send({ error: { message: 'Invalid response from document service' } });
      }
    } catch (error: any) {
      request.log.error({ error: error.message, correlationId }, 'Failed to upload profile image');
      return reply.status(500).send({ error: { message: 'Profile image upload failed' } });
    }
  });
}
