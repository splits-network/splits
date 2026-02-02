import amqp, { Connection, Channel, ConsumeMessage } from 'amqplib';
import { Logger } from '@splits-network/shared-logging';
import { PlacementSnapshotService } from '../v2/placement-snapshot/service';
import { PayoutServiceV2 } from '../v2/payouts/service';
import { SupabaseClient } from '@supabase/supabase-js';

interface PlacementCreatedEvent {
    placement_id: string;
    candidate_id: string;
    job_id: string;
    application_id: string;

    // Fee information - support both formats for backwards compatibility
    salary?: number;
    fee_percentage?: number;
    placement_fee?: number;  // Pre-calculated total fee

    // 5 role IDs for commission attribution
    candidate_recruiter_id: string | null;
    company_recruiter_id: string | null;
    job_owner_recruiter_id: string | null;
    candidate_sourcer_recruiter_id: string | null;
    company_sourcer_recruiter_id: string | null;

    created_by?: string;
}

type SubscriptionTier = 'free' | 'paid' | 'premium';
type RoleTierMap = {
    candidate_recruiter_tier: SubscriptionTier | null;
    company_recruiter_tier: SubscriptionTier | null;
    job_owner_tier: SubscriptionTier | null;
    candidate_sourcer_tier: SubscriptionTier | null;
    company_sourcer_tier: SubscriptionTier | null;
};

export class PlacementEventConsumer {
    private connection: Connection | null = null;
    private channel: Channel | null = null;
    private readonly exchange = 'splits-network-events';
    private readonly queue = 'billing-placement-queue';

    constructor(
        private rabbitMqUrl: string,
        private snapshotService: PlacementSnapshotService,
        private payoutService: PayoutServiceV2,
        private systemUserId: string,
        private supabase: SupabaseClient,
        private logger: Logger
    ) { }

    /**
     * Connect to RabbitMQ and start consuming events
     */
    async connect(): Promise<void> {
        try {
            this.connection = (await amqp.connect(this.rabbitMqUrl)) as any;
            this.channel = await (this.connection as any).createChannel();

            if (!this.channel) throw new Error('Failed to create channel');

            // Declare topic exchange (must be done before binding)
            await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
            await this.channel.assertQueue(this.queue, { durable: true });

            // Bind to placement.created events
            await this.channel.bindQueue(this.queue, this.exchange, 'placement.created');

            // Start consuming
            await this.channel.consume(
                this.queue,
                (msg) => this.handleMessage(msg),
                { noAck: false }
            );

            this.logger.info('Placement event consumer connected and listening');
        } catch (error) {
            this.logger.error({ err: error }, 'Failed to connect placement event consumer');
            throw error;
        }
    }

    /**
     * Handle incoming RabbitMQ messages
     */
    private async handleMessage(msg: ConsumeMessage | null): Promise<void> {
        if (!msg || !this.channel) return;

        try {
            const content = JSON.parse(msg.content.toString());
            const routingKey = msg.fields.routingKey;

            this.logger.debug({ routingKey, content }, 'Received event');

            // Route to appropriate handler
            if (routingKey === 'placement.created') {
                await this.handlePlacementCreated(content.payload);
            }

            // Acknowledge message
            this.channel.ack(msg);
        } catch (error) {
            this.logger.error({ err: error, msg: msg.content.toString() }, 'Error handling message');

            // Negative acknowledge - requeue for retry
            if (this.channel) {
                this.channel.nack(msg, false, true);
            }
        }
    }

    /**
     * Handle placement.created event - create immutable commission snapshot
     */
    private async handlePlacementCreated(event: PlacementCreatedEvent): Promise<void> {
        this.logger.info({ placement_id: event.placement_id }, 'Processing placement.created event');

        try {
            // Calculate total fee - prefer pre-calculated placement_fee, fall back to calculation
            let totalFee: number;
            if (event.placement_fee !== undefined && event.placement_fee > 0) {
                totalFee = event.placement_fee;
            } else if (event.salary !== undefined && event.fee_percentage !== undefined) {
                totalFee = event.salary * (event.fee_percentage / 100);
            } else {
                this.logger.error(
                    { placement_id: event.placement_id, event },
                    'Cannot calculate total fee - missing salary/fee_percentage and placement_fee'
                );
                throw new Error('Missing fee information in placement.created event');
            }

            // Resolve subscription tier for each role (per recruiter)
            const roleTiers = await this.resolveRoleTiers(event);

            // Create immutable snapshot with all 5 role attributions
            await this.snapshotService.createSnapshot({
                placement_id: event.placement_id,
                candidate_recruiter_id: event.candidate_recruiter_id,
                company_recruiter_id: event.company_recruiter_id,
                job_owner_recruiter_id: event.job_owner_recruiter_id,
                candidate_sourcer_recruiter_id: event.candidate_sourcer_recruiter_id,
                company_sourcer_recruiter_id: event.company_sourcer_recruiter_id,
                total_placement_fee: totalFee,
                ...roleTiers,
            });

            this.logger.info(
                {
                    placement_id: event.placement_id,
                    total_placement_fee: totalFee,
                    role_tiers: roleTiers,
                    roles: {
                        candidate_recruiter: event.candidate_recruiter_id ? '✓' : '✗',
                        company_recruiter: event.company_recruiter_id ? '✓' : '✗',
                        job_owner: event.job_owner_recruiter_id ? '✓' : '✗',
                        candidate_sourcer: event.candidate_sourcer_recruiter_id ? '✓' : '✗',
                        company_sourcer: event.company_sourcer_recruiter_id ? '✓' : '✗',
                    },
                },
                'Created placement snapshot'
            );

            // Phase 6: Automatically create splits and transactions for all commission roles
            try {
                const { splits, transactions } = await this.payoutService.createSplitsAndTransactionsForPlacementInternal(
                    event.placement_id
                );

                this.logger.info(
                    {
                        placement_id: event.placement_id,
                        split_count: splits.length,
                        transaction_count: transactions.length,
                        total_amount: splits.reduce((sum, s) => sum + (s.split_amount || 0), 0),
                        roles_paid: splits.map(s => s.role),
                    },
                    'Phase 6: Created placement splits and payout transactions'
                );
            } catch (payoutError) {
                // Log payout creation failure but don't throw
                // Snapshot is already created - payouts can be retried manually
                this.logger.error(
                    {
                        err: payoutError,
                        placement_id: event.placement_id,
                    },
                    'Phase 6: Failed to create splits/transactions (snapshot exists, can retry manually)'
                );
            }
        } catch (error) {
            this.logger.error(
                { err: error, placement_id: event.placement_id },
                'Failed to create placement snapshot'
            );
            throw error; // Re-throw to trigger message requeue
        }
    }

    private async resolveRoleTiers(event: PlacementCreatedEvent): Promise<RoleTierMap> {
        const [
            candidate_recruiter_tier,
            company_recruiter_tier,
            job_owner_tier,
            candidate_sourcer_tier,
            company_sourcer_tier,
        ] = await Promise.all([
            this.resolveSubscriptionTier(event.candidate_recruiter_id),
            this.resolveSubscriptionTier(event.company_recruiter_id),
            this.resolveSubscriptionTier(event.job_owner_recruiter_id),
            this.resolveSubscriptionTier(event.candidate_sourcer_recruiter_id),
            this.resolveSubscriptionTier(event.company_sourcer_recruiter_id),
        ]);

        return {
            candidate_recruiter_tier,
            company_recruiter_tier,
            job_owner_tier,
            candidate_sourcer_tier,
            company_sourcer_tier,
        };
    }

    private async resolveSubscriptionTier(recruiterId: string | null): Promise<SubscriptionTier | null> {
        if (!recruiterId) return null;

        try {
            const { data, error } = await this.supabase
                .from('subscriptions')
                .select('plan:plans(tier)')
                .eq('recruiter_id', recruiterId)
                .eq('status', 'active')
                .limit(1)
                .maybeSingle();

            if (error) {
                this.logger.warn({ err: error, recruiterId }, 'Failed to resolve subscription tier');
                return 'free';
            }

            const planTier = (data as any)?.plan?.tier as string | undefined;
            switch (planTier) {
                case 'partner':
                    return 'premium';
                case 'pro':
                    return 'paid';
                case 'starter':
                    return 'free';
                default:
                    return 'free';
            }
        } catch (error) {
            this.logger.warn({ err: error, recruiterId }, 'Failed to resolve subscription tier');
            return 'free';
        }
    }

    /**
     * Close RabbitMQ connection
     */
    async close(): Promise<void> {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await (this.connection as any).close();
            }
            this.logger.info('Placement event consumer closed');
        } catch (error) {
            this.logger.error({ err: error }, 'Error closing placement event consumer');
        }
    }
}
