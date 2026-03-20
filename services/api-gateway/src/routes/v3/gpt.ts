/**
 * GPT Service V3 Gateway Routes
 *
 * Declarative config for GPT job search, applications, and OAuth sessions.
 * MCP streaming transport requires raw HTTP proxy (SSE streams can't go through JSON-based ServiceClient).
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { request as httpRequest } from 'node:http';
import { URL } from 'node:url';
import { ServiceRegistry } from '../../clients';
import { registerV3Routes, V3RouteConfig } from './proxy';

const gptV3Routes: V3RouteConfig[] = [
  // ── GPT Action Routes (before parameterized routes) ────────────
  { path: '/gpt/actions/submit-application', method: 'POST', auth: 'required' },
  { path: '/gpt/actions/analyze-resume', method: 'POST', auth: 'required' },

  // ── GPT Actions ────────────────────────────────────────────────
  { path: '/gpt/jobs/search', method: 'GET', auth: 'required' },
  { path: '/gpt/jobs/:id', method: 'GET', auth: 'required' },
  { path: '/gpt/applications', method: 'GET', auth: 'required' },

  // ── GPT OAuth Sessions ─────────────────────────────────────────
  { path: '/gpt/oauth/sessions', method: 'GET', auth: 'required' },
  { path: '/gpt/oauth/sessions/:id/revoke', method: 'POST', auth: 'required' },

  // NOTE: /gpt/mcp routes are registered as custom handlers below (raw HTTP streaming proxy)
];

export function registerGptV3Routes(app: FastifyInstance, services: ServiceRegistry) {
  const gptClient = services.get('gpt');

  registerV3Routes(app, gptClient, gptV3Routes);

  // ── MCP Streaming Transport — Raw HTTP Proxy ────────────────────
  // MCP uses SSE streams that can't go through JSON-based ServiceClient.
  // We pipe raw req/res to the upstream gpt-service.

  function proxyMcpRaw(request: FastifyRequest, reply: FastifyReply, method: string) {
    const upstreamUrl = new URL('/api/v2/mcp', gptClient.baseURL);
    const correlationId = (request as any).correlationId;

    const proxyHeaders: Record<string, string> = {
      'x-correlation-id': correlationId,
    };
    const headersToForward = ['authorization', 'content-type', 'accept', 'mcp-session-id'];
    for (const h of headersToForward) {
      const val = request.headers[h];
      if (val) proxyHeaders[h] = Array.isArray(val) ? val[0] : val;
    }

    reply.hijack();

    const proxyReq = httpRequest(
      {
        hostname: upstreamUrl.hostname,
        port: upstreamUrl.port,
        path: upstreamUrl.pathname,
        method,
        headers: proxyHeaders,
      },
      (proxyRes) => {
        reply.raw.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
        proxyRes.pipe(reply.raw);
      },
    );

    proxyReq.on('error', (err) => {
      request.log.error({ err, correlationId }, 'MCP proxy error');
      if (!reply.raw.headersSent) {
        reply.raw.writeHead(502);
        reply.raw.end(JSON.stringify({ error: 'MCP proxy error' }));
      }
    });

    // Re-serialize parsed body for POST/DELETE (Fastify already consumed the raw stream)
    if ((method === 'POST' || method === 'DELETE') && request.body) {
      const bodyStr = JSON.stringify(request.body);
      proxyReq.setHeader('content-length', Buffer.byteLength(bodyStr));
      proxyReq.end(bodyStr);
    } else {
      proxyReq.end();
    }
  }

  // POST /api/v3/gpt/mcp — MCP messages (JSON-RPC over HTTP)
  app.post('/api/v3/gpt/mcp', async (request: FastifyRequest, reply: FastifyReply) => {
    proxyMcpRaw(request, reply, 'POST');
  });

  // GET /api/v3/gpt/mcp — MCP SSE stream
  app.get('/api/v3/gpt/mcp', async (request: FastifyRequest, reply: FastifyReply) => {
    proxyMcpRaw(request, reply, 'GET');
  });

  // DELETE /api/v3/gpt/mcp — MCP session termination
  app.delete('/api/v3/gpt/mcp', async (request: FastifyRequest, reply: FastifyReply) => {
    proxyMcpRaw(request, reply, 'DELETE');
  });
}
