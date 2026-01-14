import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { CacheManager } from '../cache/cache-manager';
import { StatsRepository } from './stats/repository';
import { StatsServiceV2 } from './stats/service';
import { registerStatsRoutes } from './stats/routes';
import { MarketplaceMetricsRepository } from './marketplace-metrics/repository';
import { MarketplaceMetricsServiceV2 } from './marketplace-metrics/service';
import { registerMarketplaceMetricsRoutes } from './marketplace-metrics/routes';
import { ChartRepository } from './charts/repository';
import { ChartServiceV2 } from './charts/service';
import { registerChartRoutes } from './charts/routes';

// Domain route imports (will be created)
// import { marketplaceHealthRoutes } from './marketplace-health/routes';

interface RouteOptions extends FastifyPluginOptions {
    supabase: SupabaseClient;
    cache: CacheManager;
    config: any;
}

/**
 * Register all V2 routes for analytics service
 */
export async function registerV2Routes(
    app: FastifyInstance,
    options: RouteOptions
) {
    const { supabase, cache, config } = options;

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

    // TODO: Register marketplace health routes when implemented
    // await app.register(marketplaceHealthRoutes, { prefix: '/marketplace-health', supabase, cache });
}
