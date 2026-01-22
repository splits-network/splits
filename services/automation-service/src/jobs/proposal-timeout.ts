/**
 * Application Timeout Automation Job
 * 
 * Checks for applications in 'recruiter_proposed' stage that have exceeded 
 * the 72-hour response deadline and automatically transitions them to 'expired' stage.
 * 
 * Runs as a Kubernetes CronJob every 6 hours.
 * 
 * @see docs/plan-databaseTableIntegration2.prompt.md (Feature 1)
 * @see docs/implementation-plans/proposals-workflow-api-backend.md
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { loadDatabaseConfig, loadRabbitMQConfig } from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';
import { register, Counter, Histogram } from 'prom-client';
import amqp, { Connection, Channel } from 'amqplib';

// Prometheus metrics
const timeoutCheckRuns = new Counter({
    name: 'proposals_timeout_check_runs_total',
    help: 'Total number of proposal timeout check runs',
});

const proposalsTimedOut = new Counter({
    name: 'proposals_timed_out_total',
    help: 'Total number of proposals timed out',
});

const checkDuration = new Histogram({
    name: 'proposals_timeout_check_duration_seconds',
    help: 'Duration of timeout check job',
    buckets: [0.1, 0.5, 1, 2, 5, 10],
});

const checkErrors = new Counter({
    name: 'proposals_timeout_check_errors_total',
    help: 'Total number of timeout check errors',
});

interface ExpiredProposal {
    id: string;
    job_id: string;
    candidate_id: string;
    candidate_recruiter_id: string | null;
    stage: string;
    created_at: string;
    updated_at: string;
}

/**
 * Main timeout checker function
 * Finds and processes all expired proposals
 */
export async function checkProposalTimeouts(): Promise<void> {
    const logger = createLogger({
        serviceName: 'automation-service',
        level: 'info',
        prettyPrint: process.env.NODE_ENV === 'development',
    });

    const endTimer = checkDuration.startTimer();
    timeoutCheckRuns.inc();

    let supabase: SupabaseClient | null = null;
    let rabbitmqConnection: Connection | null = null;
    let rabbitmqChannel: Channel | null = null;

    try {
        logger.info('Starting proposal timeout check');

        // Initialize Supabase client
        const dbConfig = loadDatabaseConfig();
        if (!dbConfig.supabaseServiceRoleKey) {
            throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
        }
        supabase = createClient(dbConfig.supabaseUrl, dbConfig.supabaseServiceRoleKey, {
            db: { schema: 'public' }
        });

        // Initialize RabbitMQ connection
        const rabbitConfig = loadRabbitMQConfig();
        rabbitmqConnection = (await amqp.connect(rabbitConfig.url)) as any;
        rabbitmqChannel = await (rabbitmqConnection as any).createChannel();
        
        if (!rabbitmqChannel) {
            throw new Error('Failed to create RabbitMQ channel');
        }
        
        await rabbitmqChannel.assertExchange('domain_events', 'topic', { durable: true });

        // Find expired proposals (applications in recruiter_proposed stage older than 72 hours)
        const now = new Date();
        const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString();
        const { data: expiredProposals, error: queryError } = await supabase
            .from('applications')
            .select('id, job_id, candidate_id, candidate_recruiter_id, stage, created_at, updated_at')
            .eq('stage', 'recruiter_proposed')
            .lt('updated_at', seventyTwoHoursAgo);

        if (queryError) {
            logger.error({ error: queryError }, 'Failed to query expired applications');
            checkErrors.inc();
            throw queryError;
        }

        const proposals = expiredProposals as ExpiredProposal[] || [];
        logger.info({ count: proposals.length }, 'Found expired applications');

        if (proposals.length === 0) {
            logger.info('No expired applications to process');
            endTimer();
            return;
        }

        // Process each expired proposal
        let successCount = 0;
        let errorCount = 0;

        for (const proposal of proposals) {
            try {
                if (!rabbitmqChannel) {
                    throw new Error('RabbitMQ channel not initialized');
                }
                await processExpiredProposal(supabase, rabbitmqChannel, proposal, logger);
                successCount++;
                proposalsTimedOut.inc();
            } catch (error) {
                logger.error(
                    { proposalId: proposal.id, error },
                    'Failed to process expired proposal'
                );
                errorCount++;
                checkErrors.inc();
            }
        }

        logger.info(
            { total: proposals.length, success: successCount, errors: errorCount },
            'Proposal timeout check completed'
        );

        endTimer();
    } catch (error) {
        logger.error({ error }, 'Proposal timeout check failed');
        checkErrors.inc();
        endTimer();
        throw error;
    } finally {
        // Cleanup
        if (rabbitmqChannel) {
            try {
                await rabbitmqChannel.close();
            } catch (e) {
                logger.error({ error: e }, 'Failed to close RabbitMQ channel');
            }
        }
        if (rabbitmqConnection) {
            try {
                await (rabbitmqConnection as any).close();
            } catch (e) {
                logger.error({ error: e }, 'Failed to close RabbitMQ connection');
            }
        }
    }
}

/**
 * Process a single expired application
 * Updates stage to 'expired' and publishes event
 */
async function processExpiredProposal(
    supabase: SupabaseClient,
    channel: Channel,
    proposal: ExpiredProposal,
    logger: any
): Promise<void> {
    const expiredAt = new Date().toISOString();

    // Update application stage to expired
    const { error: updateError } = await supabase
        .from('applications')
        .update({
            stage: 'expired',
            updated_at: expiredAt,
        })
        .eq('id', proposal.id);

    if (updateError) {
        throw updateError;
    }

    logger.info({ applicationId: proposal.id }, 'Updated application to expired stage');

    // Publish event to RabbitMQ
    const event = {
        type: 'application.stage_changed',
        timestamp: expiredAt,
        data: {
            application_id: proposal.id,
            job_id: proposal.job_id,
            candidate_id: proposal.candidate_id,
            candidate_recruiter_id: proposal.candidate_recruiter_id,
            previous_stage: 'recruiter_proposed',
            new_stage: 'expired',
            stage_changed_at: expiredAt,
            reason: 'timeout_after_72_hours',
        },
    };

    const routingKey = 'application.stage_changed';
    channel.publish(
        'domain_events',
        routingKey,
        Buffer.from(JSON.stringify(event)),
        { persistent: true }
    );

    logger.info({ applicationId: proposal.id, routingKey }, 'Published application.stage_changed event');
}

/**
 * CLI entry point
 * Run this file directly for manual execution or testing
 */
if (require.main === module) {
    checkProposalTimeouts()
        .then(() => {
            console.log('Proposal timeout check completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Proposal timeout check failed:', error);
            process.exit(1);
        });
}
