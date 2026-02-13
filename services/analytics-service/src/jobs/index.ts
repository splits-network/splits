import cron from 'node-cron';
import { SupabaseClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import { createLogger } from '@splits-network/shared-logging';
import { CacheManager } from '../cache/cache-manager';
import { rollupHourlyMetrics } from './rollup-hourly';
import { rollupDailyMetrics } from './rollup-daily';
import { rollupMonthlyMetrics } from './rollup-monthly';
import { computeMarketplaceHealth } from './marketplace-health';
import { rollupActivitySnapshot } from './rollup-activity';

const logger = createLogger('BackgroundJobs');

/**
 * Start all background aggregation jobs
 */
export function startBackgroundJobs(supabase: SupabaseClient, cache: CacheManager, redis?: Redis) {
    logger.info('Starting background aggregation jobs...');

    // Hourly rollup at :05 past every hour
    cron.schedule('5 * * * *', async () => {
        logger.info('Starting hourly metrics rollup...');
        try {
            await rollupHourlyMetrics(supabase);
            logger.info('Hourly metrics rollup completed');
        } catch (error) {
            logger.error({ error }, 'Hourly metrics rollup failed');
        }
    });

    // Daily rollup at 1:00 AM UTC
    cron.schedule('0 1 * * *', async () => {
        logger.info('Starting daily metrics rollup...');
        try {
            await rollupDailyMetrics(supabase);
            await cache.invalidatePattern('analytics:*'); // Clear all cache on daily rollup
            logger.info('Daily metrics rollup completed');
        } catch (error) {
            logger.error({ error }, 'Daily metrics rollup failed');
        }
    });

    // Monthly rollup on 1st day of month at 2:00 AM UTC
    cron.schedule('0 2 1 * *', async () => {
        logger.info('Starting monthly metrics rollup...');
        try {
            await rollupMonthlyMetrics(supabase);
            logger.info('Monthly metrics rollup completed');
        } catch (error) {
            logger.error({ error }, 'Monthly metrics rollup failed');
        }
    });

    // Marketplace health at 3:00 AM UTC daily
    cron.schedule('0 3 * * *', async () => {
        logger.info('Computing marketplace health metrics...');
        try {
            await computeMarketplaceHealth(supabase);
            logger.info('Marketplace health metrics computed');
        } catch (error) {
            logger.error({ error }, 'Marketplace health computation failed');
        }
    });

    // Activity snapshot every 5 minutes (stores online counts in DB for historical trends)
    if (redis) {
        cron.schedule('*/5 * * * *', async () => {
            try {
                await rollupActivitySnapshot(redis, supabase);
            } catch (error) {
                logger.error({ error }, 'Activity snapshot rollup failed');
            }
        });
    }

    logger.info('Background jobs scheduled successfully');
}
