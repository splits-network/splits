/**
 * Site Notifications V3 Gateway Route
 *
 * Public endpoint proxied to notification-service.
 * Returns active site-wide notifications (maintenance, incidents, announcements).
 */

import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients.js';
import { registerV3Routes, V3RouteConfig } from './proxy.js';

const siteNotificationV3Routes: V3RouteConfig[] = [
  { path: '/public/site-notifications', method: 'GET', auth: 'none' },
];

export function registerSiteNotificationV3Routes(app: FastifyInstance, services: ServiceRegistry) {
  const notificationClient = services.get('notification');

  registerV3Routes(app, notificationClient, siteNotificationV3Routes);
}
