/**
 * Application Timeout Job
 *
 * Expires applications that have been stalled in certain stages
 * past a configurable timeout. Runs as a Kubernetes CronJob every 6 hours.
 *
 * Stages checked for timeout:
 * - recruiter_proposed: Candidate hasn't responded to recruiter's proposal
 * - recruiter_request: Candidate hasn't responded to recruiter's info request
 * - screen: Company hasn't acted on screening
 * - submitted: Company hasn't started review
 * - company_review: Company hasn't finished review
 * - company_feedback: Feedback is pending action
 */

import { createClient } from '@supabase/supabase-js';
import { loadDatabaseConfig, loadRabbitMQConfig } from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';
import { register, Counter, Histogram, Gauge } from 'prom-client';
import { EventPublisher } from '../v2/shared/events';

// Stages that can time out, with default timeout in days
const TIMEOUT_STAGES: Record<string, number> = {
    recruiter_proposed: 7,
    recruiter_request: 7,
    screen: 14,
    submitted: 14,
    company_review: 14,
    company_feedback: 14,
};

// Prometheus metrics
const timeoutRuns = new Counter({
    name: 'application_timeout_runs_total',
    help: 'Total number of application timeout job runs',
});

const applicationsExpired = new Counter({
    name: 'application_timeout_expired_total',
    help: 'Total number of applications expired',
    labelNames: ['stage'],
});

const timeoutErrors = new Counter({
    name: 'application_timeout_errors_total',
    help: 'Total number of timeout processing errors',
});

const runDuration = new Histogram({
    name: 'application_timeout_duration_seconds',
    help: 'Duration of application timeout job',
    buckets: [5, 10, 30, 60, 120, 300],
});

const lastRunSuccess = new Gauge({
    name: 'application_timeout_last_success',
    help: 'Timestamp of last successful timeout run',
});

/**
 * Main timeout function.
 * Finds stalled applications and transitions them to expired.
 */
export async function expireTimedOutApplications(): Promise<void> {
    const logger = createLogger({
        serviceName: 'automation-service',
        level: 'info',
        prettyPrint: process.env.NODE_ENV === 'development',
    });

    const endTimer = runDuration.startTimer();
    timeoutRuns.inc();

    let eventPublisher: EventPublisher | null = null;
    let totalExpired = 0;
    let totalErrors = 0;

    try {
        logger.info('Starting application timeout job');

        const dbConfig = loadDatabaseConfig();
        if (!dbConfig.supabaseServiceRoleKey) {
            throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
        }

        const rabbitConfig = loadRabbitMQConfig();
        eventPublisher = new EventPublisher(
            rabbitConfig.url,
            logger,
            'automation-service',
        );
        await eventPublisher.connect();

        const supabase = createClient(dbConfig.supabaseUrl, dbConfig.supabaseServiceRoleKey);

        // Override timeout from env if set (in days)
        const globalTimeoutDays = process.env.APPLICATION_TIMEOUT_DAYS
            ? parseInt(process.env.APPLICATION_TIMEOUT_DAYS, 10)
            : null;

        for (const [stage, defaultTimeoutDays] of Object.entries(TIMEOUT_STAGES)) {
            const timeoutDays = globalTimeoutDays ?? defaultTimeoutDays;
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - timeoutDays);

            try {
                // Find applications stuck in this stage past the timeout
                const { data: staleApplications, error: queryError } = await supabase
                    .from('applications')
                    .select('id, job_id, candidate_id, candidate_recruiter_id')
                    .eq('stage', stage)
                    .lt('updated_at', cutoff.toISOString())
                    .limit(500);

                if (queryError) {
                    logger.error({ error: queryError, stage }, 'Failed to query stale applications');
                    totalErrors++;
                    timeoutErrors.inc();
                    continue;
                }

                if (!staleApplications || staleApplications.length === 0) {
                    logger.debug({ stage, timeoutDays }, 'No stale applications found');
                    continue;
                }

                logger.info({ stage, count: staleApplications.length, timeoutDays }, 'Found stale applications to expire');

                for (const app of staleApplications) {
                    try {
                        // Transition to expired
                        const { error: updateError } = await supabase
                            .from('applications')
                            .update({
                                stage: 'expired',
                                updated_at: new Date().toISOString(),
                            })
                            .eq('id', app.id)
                            .eq('stage', stage); // Optimistic lock: only update if still in expected stage

                        if (updateError) {
                            logger.error({ error: updateError, applicationId: app.id }, 'Failed to expire application');
                            totalErrors++;
                            timeoutErrors.inc();
                            continue;
                        }

                        // Publish stage changed event
                        await eventPublisher!.publish('application.stage_changed', {
                            application_id: app.id,
                            job_id: app.job_id,
                            candidate_id: app.candidate_id,
                            candidate_recruiter_id: app.candidate_recruiter_id,
                            old_stage: stage,
                            new_stage: 'expired',
                            changed_by: 'system:application-timeout',
                        });

                        totalExpired++;
                        applicationsExpired.inc({ stage });
                    } catch (err) {
                        logger.error({ error: err, applicationId: app.id }, 'Error processing application timeout');
                        totalErrors++;
                        timeoutErrors.inc();
                    }
                }
            } catch (err) {
                logger.error({ error: err, stage }, 'Error processing stage timeout');
                totalErrors++;
                timeoutErrors.inc();
            }
        }

        logger.info(
            { totalExpired, totalErrors },
            'Application timeout job completed',
        );

        if (totalErrors === 0) {
            lastRunSuccess.set(Date.now() / 1000);
        }

        endTimer();
    } catch (error) {
        logger.error({ error }, 'Application timeout job failed');
        timeoutErrors.inc();
        endTimer();
        throw error;
    } finally {
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
 */
if (require.main === module) {
    expireTimedOutApplications()
        .then(() => {
            console.log('Application timeout job completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Application timeout job failed:', error);
            process.exit(1);
        });
}
