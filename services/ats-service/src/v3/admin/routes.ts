/**
 * Admin V3 Routes — View registry for admin dashboard endpoints
 *
 * These are all views (joins, aggregations, cross-resource queries).
 * No core CRUD — admin has no single "admin" table.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { registerAdminJobsView } from './views/jobs.route';
import { registerAdminListViews } from './views/lists.route';
import { registerAdminStatsViews } from './views/stats.route';
import { registerAdminChartsView } from './views/charts.route';

export function registerAdminRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  registerAdminJobsView(app, supabase);
  registerAdminListViews(app, supabase);
  registerAdminStatsViews(app, supabase);
  registerAdminChartsView(app, supabase);
}
