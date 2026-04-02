/**
 * Expiration Warning Job
 *
 * Sends warnings to responsible parties when applications are approaching
 * their timeout deadline. Runs as a Kubernetes CronJob every 6 hours.
 *
 * For each timeout stage, finds applications within 2 days of expiring
 * and publishes warning events. Deduplicates warnings using last_warning_sent_at.
 */

import { createClient } from '@supabase/supabase-js';
import { loadDatabaseConfig, loadRabbitMQConfig } from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';
import { register, Counter, Histogram, Gauge } from 'prom-client';
import { EventPublisher } from '../v2/shared/events.js';

// Same timeout stages as application-timeout.ts
const TIMEOUT_STAGES: Record<string, number> = {
    recruiter_proposed: 7,
    recruiter_request: 7,
    screen: 14,
    submitted: 14,
    company_review: 14,
    company_feedback: 14,
};

// Map stage to responsible party
const RESPONSIBLE_PARTY: Record<string, string> = {
    recruiter_proposed: 'candidate',
    recruiter_request: 'candidate',
    screen: 'recruiter',
    submitted: 'company',
    company_review: 'company',
    company_feedback: 'company',
};

// Prometheus metrics
const warningRuns = new Counter({
    name: 'expiration_warning_runs_total',
    help: 'Total number of expiration warning job runs',
});

const warningsSent = new Counter({
    name: 'expiration_warnings_sent_total',
    help: 'Total number of expiration warnings sent',
    labelNames: ['stage'],
});

const warningErrors = new Counter({
    name: 'expiration_warning_errors_total',
    help: 'Total number of expiration warning errors',
});

const runDuration = new Histogram({
    name: 'expiration_warning_duration_seconds',
    help: 'Duration of expiration warning job',
    buckets: [5, 10, 30, 60, 120, 300],
});

const lastRunSuccess = new Gauge({
    name: 'expiration_warning_last_success',
    help: 'Timestamp of last successful expiration warning run',
});

/**
 * Main warning function.
 * Finds applications approaching timeout and publishes warning events.
 */
export async function sendExpirationWarnings(): Promise<void> {
    const logger = createLogger({
        serviceName: 'automation-service',
        level: 'info',
        prettyPrint: process.env.NODE_ENV === 'development',
    });

    const endTimer = runDuration.startTimer();
    warningRuns.inc();

    let eventPublisher: EventPublisher | null = null;
    let totalWarnings = 0;
    let totalErrors = 0;

    try {
        logger.info('Starting expiration warning job');

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

        const now = new Date();
        const fiveDaysAgo = new Date(now);
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        for (const [stage, timeoutDays] of Object.entries(TIMEOUT_STAGES)) {
            try {
                // Window: applications that will expire within the next 2 days
                // updated_at < (now - timeout + 2 days) AND updated_at >= (now - timeout)
                const warningCutoff = new Date(now);
                warningCutoff.setDate(warningCutoff.getDate() - timeoutDays + 2);

                const expiryCutoff = new Date(now);
                expiryCutoff.setDate(expiryCutoff.getDate() - timeoutDays);

                const { data: applications, error: queryError } = await supabase
                    .from('applications')
                    .select('id, job_id, candidate_id, candidate_recruiter_id, stage, updated_at, last_warning_sent_at')
                    .eq('stage', stage)
                    .is('expired_at', null)
                    .lt('updated_at', warningCutoff.toISOString())
                    .gte('updated_at', expiryCutoff.toISOString())
                    .or(`last_warning_sent_at.is.null,last_warning_sent_at.lt.${fiveDaysAgo.toISOString()}`)
                    .limit(500);

                if (queryError) {
                    logger.error({ error: queryError, stage }, 'Failed to query applications for warning');
                    totalErrors++;
                    warningErrors.inc();
                    continue;
                }

                if (!applications || applications.length === 0) {
                    logger.debug({ stage, timeoutDays }, 'No applications approaching expiration');
                    continue;
                }

                logger.info({ stage, count: applications.length }, 'Found applications approaching expiration');

                for (const app of applications) {
                    try {
                        // Calculate days remaining until expiration
                        const updatedAt = new Date(app.updated_at);
                        const expiresAt = new Date(updatedAt);
                        expiresAt.setDate(expiresAt.getDate() + timeoutDays);
                        const daysRemaining = Math.max(0, Math.ceil(
                            (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                        ));

                        // Publish warning event
                        await eventPublisher!.publish('application.expiration_warning', {
                            application_id: app.id,
                            job_id: app.job_id,
                            candidate_id: app.candidate_id,
                            candidate_recruiter_id: app.candidate_recruiter_id,
                            stage,
                            days_remaining: daysRemaining,
                            responsible_party: RESPONSIBLE_PARTY[stage],
                        });

                        // Update last_warning_sent_at
                        const { error: updateError } = await supabase
                            .from('applications')
                            .update({ last_warning_sent_at: now.toISOString() })
                            .eq('id', app.id);

                        if (updateError) {
                            logger.error({ error: updateError, applicationId: app.id }, 'Failed to update last_warning_sent_at');
                        }

                        totalWarnings++;
                        warningsSent.inc({ stage });
                    } catch (err) {
                        logger.error({ error: err, applicationId: app.id }, 'Error sending expiration warning');
                        totalErrors++;
                        warningErrors.inc();
                    }
                }
            } catch (err) {
                logger.error({ error: err, stage }, 'Error processing stage warnings');
                totalErrors++;
                warningErrors.inc();
            }
        }

        logger.info(
            { totalWarnings, totalErrors },
            'Expiration warning job completed',
        );

        if (totalErrors === 0) {
            lastRunSuccess.set(Date.now() / 1000);
        }

        endTimer();
    } catch (error) {
        logger.error({ error }, 'Expiration warning job failed');
        warningErrors.inc();
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
    sendExpirationWarnings()
        .then(() => {
            console.log('Expiration warning job completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Expiration warning job failed:', error);
            process.exit(1);
        });
}
