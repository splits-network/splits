/**
 * Job Scheduler
 * 
 * Schedules and manages background jobs using node-cron.
 * Runs metric rollup jobs and marketplace health computation.
 */

import cron from 'node-cron';
import { SupabaseClient } from '@supabase/supabase-js';
import { createLogger } from '@splits-network/shared-logging';
import { rollupHourlyMetrics } from './rollup-hourly';
import { rollupDailyMetrics } from './rollup-daily';
import { rollupMonthlyMetrics } from './rollup-monthly';
import { computeMarketplaceHealth } from './marketplace-health';

const logger = createLogger('analytics-service:scheduler');

interface SchedulerOptions {
    supabase: SupabaseClient;
    enabled?: boolean;
}

export class JobScheduler {
    private tasks: cron.ScheduledTask[] = [];
    private supabase: SupabaseClient;
    private enabled: boolean;

    constructor(options: SchedulerOptions) {
        this.supabase = options.supabase;
        this.enabled = options.enabled !== false;
    }

    /**
     * Start all scheduled jobs
     */
    start(): void {
        if (!this.enabled) {
            logger.info('Job scheduler disabled, skipping job setup');
            return;
        }

        logger.info('Starting job scheduler');

        // Hourly rollup - runs at 5 minutes past each hour
        this.tasks.push(
            cron.schedule('5 * * * *', async () => {
                logger.info('Running hourly metrics rollup');
                try {
                    await rollupHourlyMetrics(this.supabase);
                } catch (error: any) {
                    logger.error(`Hourly rollup failed: ${error.message}`);
                }
            })
        );

        // Daily rollup - runs at 1:00 AM every day
        this.tasks.push(
            cron.schedule('0 1 * * *', async () => {
                logger.info('Running daily metrics rollup');
                try {
                    await rollupDailyMetrics(this.supabase);
                } catch (error: any) {
                    logger.error(`Daily rollup failed: ${error.message}`);
                }
            })
        );

        // Monthly rollup - runs at 2:00 AM on the 1st of each month
        this.tasks.push(
            cron.schedule('0 2 1 * *', async () => {
                logger.info('Running monthly metrics rollup');
                try {
                    await rollupMonthlyMetrics(this.supabase);
                } catch (error: any) {
                    logger.error(`Monthly rollup failed: ${error.message}`);
                }
            })
        );

        // Marketplace health - runs at 3:00 AM every day
        this.tasks.push(
            cron.schedule('0 3 * * *', async () => {
                logger.info('Computing marketplace health');
                try {
                    await computeMarketplaceHealth(this.supabase);
                } catch (error: any) {
                    logger.error(`Marketplace health computation failed: ${error.message}`);
                }
            })
        );

        logger.info(`Scheduled ${this.tasks.length} background jobs`);
    }

    /**
     * Stop all scheduled jobs
     */
    stop(): void {
        logger.info('Stopping job scheduler');
        this.tasks.forEach((task) => task.stop());
        this.tasks = [];
    }

    /**
     * Run all jobs immediately (for testing)
     */
    async runAll(): Promise<void> {
        logger.info('Running all jobs immediately');

        try {
            await rollupHourlyMetrics(this.supabase);
            await rollupDailyMetrics(this.supabase);
            await rollupMonthlyMetrics(this.supabase);
            await computeMarketplaceHealth(this.supabase);
            logger.info('All jobs completed successfully');
        } catch (error: any) {
            logger.error(`Job execution failed: ${error.message}`);
            throw error;
        }
    }
}
