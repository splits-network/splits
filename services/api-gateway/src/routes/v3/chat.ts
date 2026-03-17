/**
 * Chat Service V3 Gateway Routes
 *
 * Declarative config for conversations, messaging, and counters.
 * The proxy layer handles auth, CORS, correlation IDs -- no custom handlers.
 */

import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { registerV3Routes, V3RouteConfig } from './proxy';

const chatV3Routes: V3RouteConfig[] = [
  // -- Conversation Views (before :id to avoid collision) --
  { path: '/chat/conversations/views/list-for-user', method: 'GET', auth: 'required' },
  { path: '/chat/conversations/:id/view/detail', method: 'GET', auth: 'required' },

  // -- Conversation Actions (before :id to avoid collision) --
  { path: '/chat/conversations/actions/start', method: 'POST', auth: 'required' },
  { path: '/chat/conversations/:id/actions/accept', method: 'POST', auth: 'required' },
  { path: '/chat/conversations/:id/actions/decline', method: 'POST', auth: 'required' },
  { path: '/chat/conversations/:id/actions/mute', method: 'POST', auth: 'required' },
  { path: '/chat/conversations/:id/actions/archive', method: 'POST', auth: 'required' },
  { path: '/chat/conversations/:id/actions/read-receipt', method: 'POST', auth: 'required' },
  { path: '/chat/conversations/:id/actions/resync', method: 'GET', auth: 'required' },
  { path: '/chat/conversations/:id/actions/resync', method: 'POST', auth: 'required' },

  // -- Conversations Core CRUD --
  { resource: 'chat/conversations', auth: 'required' },

  // -- Messages (sub-resource of conversations) --
  { path: '/chat/conversations/:id/messages', method: 'GET', auth: 'required' },
  { path: '/chat/conversations/:id/messages', method: 'POST', auth: 'required' },

  // -- V2 compatibility: conversation resync at old path --
  { path: '/chat/conversations/:id/resync', method: 'GET', auth: 'required' },

  // -- V2 compatibility: accept/decline/mute/archive at old paths --
  { path: '/chat/conversations/:id/accept', method: 'POST', auth: 'required' },
  { path: '/chat/conversations/:id/decline', method: 'POST', auth: 'required' },
  { path: '/chat/conversations/:id/mute', method: 'POST', auth: 'required' },
  { path: '/chat/conversations/:id/mute', method: 'DELETE', auth: 'required' },
  { path: '/chat/conversations/:id/archive', method: 'POST', auth: 'required' },
  { path: '/chat/conversations/:id/archive', method: 'DELETE', auth: 'required' },
  { path: '/chat/conversations/:id/read-receipt', method: 'POST', auth: 'required' },

  // -- Blocks --
  { path: '/chat/blocks', method: 'POST', auth: 'required' },
  { path: '/chat/blocks/:blockedUserId', method: 'DELETE', auth: 'required' },

  // -- Reports --
  { path: '/chat/reports', method: 'POST', auth: 'required' },

  // -- Attachments --
  { path: '/chat/attachments/init', method: 'POST', auth: 'required' },
  { path: '/chat/attachments/:id/complete', method: 'POST', auth: 'required' },
  { path: '/chat/attachments/:id/download-url', method: 'GET', auth: 'required' },

  // -- Messages Actions --
  { path: '/chat/messages/:id/actions/redact', method: 'POST', auth: 'required' },

  // -- Messages (admin, V2 compat) --
  { path: '/chat/messages/:id', method: 'PATCH', auth: 'required' },

  // -- Presence --
  { path: '/chat/presence', method: 'GET', auth: 'required' },

  // -- Messaging Counters Views --
  { path: '/messaging-counters/views/current', method: 'GET', auth: 'required' },

  // -- Messaging Counters --
  { path: '/messaging-counters', method: 'GET', auth: 'required' },
  { path: '/messaging-counters/:id', method: 'GET', auth: 'required' },
];

export function registerChatV3Routes(app: FastifyInstance, services: ServiceRegistry) {
  const chatClient = services.get('chat');

  registerV3Routes(app, chatClient, chatV3Routes);
}
