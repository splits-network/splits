/**
 * V3 Route Registry — Analytics Service
 *
 * Registers all V3 resource routes alongside existing V2 routes.
 * V2 is untouched — both versions coexist and are functional.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { ActivityService } from '../v2/activity/service.js';
import { ChartServiceV2 } from '../v2/charts/service.js';
import { StatsServiceV2 } from '../v2/stats/service.js';
import { registerActivityRoutes } from './activity/routes.js';
import { registerChartRoutes } from './charts/routes.js';
import { registerMarketplaceMetricRoutes } from './marketplace-metrics/routes.js';
import { registerStatsRoutes } from './stats/routes.js';
import { registerViewRoutes } from './views/routes.js';

interface RegisterV3Config {
  supabase: SupabaseClient;
  activityService: ActivityService;
  chartServiceV2: ChartServiceV2;
  statsServiceV2: StatsServiceV2;
}

export function registerV3Routes(app: FastifyInstance, config: RegisterV3Config) {
  registerActivityRoutes(app, config.supabase, config.activityService);
  registerChartRoutes(app, config.supabase, config.chartServiceV2);
  registerMarketplaceMetricRoutes(app, config.supabase);
  registerStatsRoutes(app, config.statsServiceV2);
  registerViewRoutes(app, config.supabase);
}
