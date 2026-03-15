/**
 * Chat Service V3 Gateway Routes
 *
 * Declarative config for conversations and messaging counters.
 * The proxy layer handles auth, CORS, correlation IDs — no custom handlers.
 */

import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { registerV3Routes, V3RouteConfig } from './proxy';

const chatV3Routes: V3RouteConfig[] = [
  // ── Conversations (views/actions before :id to avoid collision) ──
  { path: '/chat/conversations/:id/resync', method: 'GET', auth: 'required' },
  { path: '/chat/conversations/:id/messages', method: 'GET', auth: 'required' },
  { path: '/chat/conversations/:id/messages', method: 'POST', auth: 'required' },
  { path: '/chat/conversations/:id/accept', method: 'POST', auth: 'required' },
  { path: '/chat/conversations/:id/decline', method: 'POST', auth: 'required' },
  { path: '/chat/conversations/:id/mute', method: 'POST', auth: 'required' },
  { path: '/chat/conversations/:id/mute', method: 'DELETE', auth: 'required' },
  { path: '/chat/conversations/:id/archive', method: 'POST', auth: 'required' },
  { path: '/chat/conversations/:id/archive', method: 'DELETE', auth: 'required' },
  { path: '/chat/conversations/:id/read-receipt', method: 'POST', auth: 'required' },

  // ── Conversations Core CRUD ────────────────────────────────────
  { resource: 'chat/conversations', auth: 'required' },

  // ── Blocks ─────────────────────────────────────────────────────
  { path: '/chat/blocks', method: 'POST', auth: 'required' },
  { path: '/chat/blocks/:blockedUserId', method: 'DELETE', auth: 'required' },

  // ── Reports ────────────────────────────────────────────────────
  { path: '/chat/reports', method: 'POST', auth: 'required' },

  // ── Attachments ────────────────────────────────────────────────
  { path: '/chat/attachments/init', method: 'POST', auth: 'required' },
  { path: '/chat/attachments/:id/complete', method: 'POST', auth: 'required' },
  { path: '/chat/attachments/:id/download-url', method: 'GET', auth: 'required' },

  // ── Messages ───────────────────────────────────────────────────
  { path: '/chat/messages/:id', method: 'PATCH', auth: 'required' },

  // ── Presence ──────────────────────────────────────────────────────
  { path: '/chat/presence', method: 'GET', auth: 'required' },

  // ── Messaging Counters Views ───────────────────────────────────
  { path: '/messaging-counters/views/current', method: 'GET', auth: 'required' },

  // ── Messaging Counters ─────────────────────────────────────────
  { path: '/messaging-counters', method: 'GET', auth: 'required' },
  { path: '/messaging-counters/:id', method: 'GET', auth: 'required' },
];

export function registerChatV3Routes(app: FastifyInstance, services: ServiceRegistry) {
  const chatClient = services.get('chat');

  registerV3Routes(app, chatClient, chatV3Routes);
}
