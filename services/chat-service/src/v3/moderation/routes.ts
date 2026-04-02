/**
 * Moderation V3 Route Registry
 *
 * Registers moderation-specific resources: audit-log and metrics view.
 * Reports are already registered separately at v3/reports (under /api/v3/chat/reports).
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { registerAuditLogRoutes } from './audit-log/routes.js';
import { registerMetricsView } from './views/metrics.route.js';

export function registerModerationRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
) {
  // Metrics view first (before any :id routes)
  registerMetricsView(app, supabase);

  // Audit log resource
  registerAuditLogRoutes(app, supabase);
}
