/**
 * Notification Service V3 Gateway Routes
 *
 * Declarative config for notifications, preferences, templates, and admin notifications.
 * The proxy layer handles auth, CORS, correlation IDs — no custom handlers.
 */

import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients.js';
import { registerV3Routes, V3RouteConfig } from './proxy.js';

const notificationV3Routes: V3RouteConfig[] = [
  // ── Notifications Actions ──────────────────────────────────────
  { path: '/notifications/actions/mark-all-read', method: 'POST', auth: 'required' },
  { path: '/notifications/actions/mark-category-read', method: 'POST', auth: 'required' },

  // ── Notifications Views ────────────────────────────────────────
  { path: '/notifications/views/unread-count', method: 'GET', auth: 'required' },
  { path: '/notifications/views/counts-by-category', method: 'GET', auth: 'required' },

  // ── Notifications CRUD (no POST) ───────────────────────────────
  { path: '/notifications', method: 'GET', auth: 'required' },
  { path: '/notifications/:id', method: 'GET', auth: 'required' },
  { path: '/notifications/:id', method: 'PATCH', auth: 'required' },
  { path: '/notifications/:id', method: 'DELETE', auth: 'required' },

  // ── Notification Preferences Actions ───────────────────────────
  { path: '/notification-preferences/actions/bulk-update', method: 'POST', auth: 'required' },

  // ── Notification Preferences ───────────────────────────────────
  { path: '/notification-preferences', method: 'GET', auth: 'required' },
  { path: '/notification-preferences/:category', method: 'PATCH', auth: 'required' },

  // ── Push Notifications ─────────────────────────────────────────
  { path: '/public/push/vapid-key', method: 'GET', auth: 'none' },
  { path: '/push/subscriptions/actions/unsubscribe', method: 'POST', auth: 'required' },
  { path: '/push/subscriptions', method: 'POST', auth: 'required' },
  { path: '/push/subscriptions', method: 'GET', auth: 'required' },

  // ── Templates Core CRUD ────────────────────────────────────────
  { resource: 'templates', auth: 'required' },

  // ── Admin Notifications Views ──────────────────────────────────
  { path: '/admin-notifications/views/notification-log', method: 'GET', auth: 'required' },
  { path: '/admin-notifications/views/counts', method: 'GET', auth: 'required' },

  // ── Admin Notifications Core CRUD ──────────────────────────────
  { resource: 'admin-notifications', auth: 'required' },
];

export function registerNotificationV3Routes(app: FastifyInstance, services: ServiceRegistry) {
  const notificationClient = services.get('notification');

  registerV3Routes(app, notificationClient, notificationV3Routes);
}
