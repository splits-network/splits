import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { CacheManager } from '../cache/cache-manager.js';
import { StatsRepository } from './stats/repository.js';
import { StatsServiceV2 } from './stats/service.js';
import { registerStatsRoutes } from './stats/routes.js';
import { MarketplaceMetricsRepository } from './marketplace-metrics/repository.js';
import { MarketplaceMetricsServiceV2 } from './marketplace-metrics/service.js';
import { registerMarketplaceMetricsRoutes } from './marketplace-metrics/routes.js';
import { ChartRepository } from './charts/repository.js';
import { ChartServiceV2 } from './charts/service.js';
import { registerChartRoutes } from './charts/routes.js';
import { ActivityService } from './activity/service.js';
import { registerActivityRoutes } from './activity/routes.js';

// Domain route imports (will be created)
// import { marketplaceHealthRoutes } from './marketplace-health/routes';

interface RouteOptions extends FastifyPluginOptions {
    supabase: SupabaseClient;
    cache: CacheManager;
    config: any;
    redis?: import('ioredis').Redis;
    activityService?: ActivityService;
}

/**
 * Register all V2 routes for analytics service
 */
export async function registerV2Routes(
    app: FastifyInstance,
    options: RouteOptions
) {
    const { supabase, cache, config, activityService } = options;

    // Root V2 endpoint
    app.get('/', async (request, reply) => {
        return reply.send({
            data: {
                service: 'analytics-service',
                version: '1.0.0',
                endpoints: {
                    stats: '/api/v2/stats',
                    charts: '/api/v2/charts/:type',
                    marketplaceHealth: '/api/v2/marketplace-health',
                    docs: '/docs',
                },
            },
        });
    });

    // Initialize services
    const statsRepository = new StatsRepository(supabase);
    const statsService = new StatsServiceV2(statsRepository);

    const marketplaceMetricsRepository = new MarketplaceMetricsRepository(supabase);
    const marketplaceMetricsService = new MarketplaceMetricsServiceV2(
        marketplaceMetricsRepository,
        supabase
    );

    const chartRepository = new ChartRepository(supabase);
    const chartService = new ChartServiceV2(chartRepository, supabase);

    // Register domain routes
    registerStatsRoutes(app, { statsService });
    registerMarketplaceMetricsRoutes(app, { marketplaceMetricsService });
    registerChartRoutes(app, { chartService });
    if (activityService) {
        registerActivityRoutes(app, { activityService });
    }
}
