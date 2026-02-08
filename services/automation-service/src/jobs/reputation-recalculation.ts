/**
 * Reputation Recalculation Job
 *
 * Batch recalculates reputation scores for all recruiters.
 * Runs as a Kubernetes CronJob daily at 4 AM.
 *
 * This ensures data consistency even if real-time events were missed,
 * and keeps reputation scores up-to-date based on latest metrics.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { loadDatabaseConfig, loadRabbitMQConfig } from '@splits-network/shared-config';
import { createLogger, Logger } from '@splits-network/shared-logging';
import { register, Counter, Histogram, Gauge } from 'prom-client';
import amqp, { Connection, Channel } from 'amqplib';
import { ReputationRepository } from '../v2/reputation/repository';
import { ReputationService } from '../v2/reputation/service';
import { EventPublisher } from '../v2/shared/events';

// Prometheus metrics
const recalculationRuns = new Counter({
    name: 'reputation_recalculation_runs_total',
    help: 'Total number of reputation recalculation job runs',
});

const recruitersProcessed = new Counter({
    name: 'reputation_recruiters_processed_total',
    help: 'Total number of recruiters processed',
});

const recalculationErrors = new Counter({
    name: 'reputation_recalculation_errors_total',
    help: 'Total number of recalculation errors',
});

const runDuration = new Histogram({
    name: 'reputation_recalculation_duration_seconds',
    help: 'Duration of reputation recalculation job',
    buckets: [10, 30, 60, 120, 300, 600],
});

const lastRunSuccess = new Gauge({
    name: 'reputation_recalculation_last_success',
    help: 'Timestamp of last successful recalculation run',
});

/**
 * Main recalculation function.
 * Processes all recruiters and updates their reputation scores.
 */
export async function recalculateAllReputations(): Promise<void> {
    const logger = createLogger({
        serviceName: 'automation-service',
        level: 'info',
        prettyPrint: process.env.NODE_ENV === 'development',
    });

    const endTimer = runDuration.startTimer();
    recalculationRuns.inc();

    let eventPublisher: EventPublisher | null = null;

    try {
        logger.info('Starting reputation recalculation job');

        // Initialize database client
        const dbConfig = loadDatabaseConfig();
        if (!dbConfig.supabaseServiceRoleKey) {
            throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
        }

        // Initialize RabbitMQ for event publishing
        const rabbitConfig = loadRabbitMQConfig();
        eventPublisher = new EventPublisher(
            rabbitConfig.url,
            logger,
            'automation-service',
        );
        await eventPublisher.connect();

        // Initialize repository and service
        const repository = new ReputationRepository(
            dbConfig.supabaseUrl,
            dbConfig.supabaseServiceRoleKey,
        );

        const service = new ReputationService(
            repository,
            eventPublisher,
            logger,
        );

        // Run batch recalculation
        const result = await service.batchRecalculateAll();

        // Update metrics
        recruitersProcessed.inc(result.success);
        recalculationErrors.inc(result.errors);

        logger.info(
            {
                total: result.total,
                success: result.success,
                errors: result.errors,
            },
            'Reputation recalculation job completed',
        );

        if (result.errors === 0) {
            lastRunSuccess.set(Date.now() / 1000);
        }

        endTimer();
    } catch (error) {
        logger.error({ error }, 'Reputation recalculation job failed');
        recalculationErrors.inc();
        endTimer();
        throw error;
    } finally {
        // Cleanup
        if (eventPublisher) {
            try {
                await eventPublisher.close();
            } catch (e) {
                logger.error({ error: e }, 'Failed to close EventPublisher');
            }
        }
    }
}

/**
 * CLI entry point.
 * Run this file directly for manual execution or testing.
 */
if (require.main === module) {
    recalculateAllReputations()
        .then(() => {
            console.log('Reputation recalculation completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Reputation recalculation failed:', error);
            process.exit(1);
        });
}
