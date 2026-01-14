/**
 * Proposal Timeout Automation Job
 * 
 * Checks for proposals that have exceeded the 72-hour response deadline
 * and automatically transitions them to 'timed_out' state.
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
    recruiter_id: string;
    proposed_at: string;
    response_due_at: string;
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

        // Find expired proposals
        const now = new Date().toISOString();
        const { data: expiredProposals, error: queryError } = await supabase
            .from('candidate_role_assignments')
            .select('id, job_id, candidate_id, recruiter_id, proposed_at, response_due_at')
            .eq('state', 'proposed')
            .lt('response_due_at', now);

        if (queryError) {
            logger.error({ error: queryError }, 'Failed to query expired proposals');
            checkErrors.inc();
            throw queryError;
        }

        const proposals = expiredProposals as ExpiredProposal[] || [];
        logger.info({ count: proposals.length }, 'Found expired proposals');

        if (proposals.length === 0) {
            logger.info('No expired proposals to process');
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
 * Process a single expired proposal
 * Updates state to 'timed_out' and publishes event
 */
async function processExpiredProposal(
    supabase: SupabaseClient,
    channel: Channel,
    proposal: ExpiredProposal,
    logger: any
): Promise<void> {
    const timedOutAt = new Date().toISOString();

    // Update proposal state
    const { error: updateError } = await supabase
        .from('candidate_role_assignments')
        .update({
            state: 'timed_out',
            timed_out_at: timedOutAt,
            updated_at: timedOutAt,
        })
        .eq('id', proposal.id);

    if (updateError) {
        throw updateError;
    }

    logger.info({ proposalId: proposal.id }, 'Updated proposal to timed_out state');

    // Publish event to RabbitMQ
    const event = {
        type: 'proposal.timed_out',
        timestamp: timedOutAt,
        data: {
            proposal_id: proposal.id,
            job_id: proposal.job_id,
            candidate_id: proposal.candidate_id,
            recruiter_id: proposal.recruiter_id,
            proposed_at: proposal.proposed_at,
            response_due_at: proposal.response_due_at,
            timed_out_at: timedOutAt,
        },
    };

    const routingKey = 'proposal.timed_out';
    channel.publish(
        'domain_events',
        routingKey,
        Buffer.from(JSON.stringify(event)),
        { persistent: true }
    );

    logger.info({ proposalId: proposal.id, routingKey }, 'Published proposal.timed_out event');
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
