import amqp, { Connection, Channel, ConsumeMessage } from 'amqplib';
import { Logger } from '@splits-network/shared-logging';
import { PlacementSnapshotService } from '../v2/placement-snapshot/service.js';
import { PayoutServiceV2 } from '../v2/payouts/service.js';
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

interface InvoicePaidEvent {
    stripe_invoice_id: string;
    amount_paid: number;
    paid_at: string;
}

interface EscrowHoldReleasedEvent {
    holdId: string;
    placementId: string;
    holdAmount: number;
}

type SubscriptionTier = 'free' | 'paid' | 'premium';
type RoleTierMap = {
    candidate_recruiter_tier: SubscriptionTier | null;
    company_recruiter_tier: SubscriptionTier | null;
    job_owner_tier: SubscriptionTier | null;
    candidate_sourcer_tier: SubscriptionTier | null;
    company_sourcer_tier: SubscriptionTier | null;
};

export class BillingEventConsumer {
    private connection: Connection | null = null;
    private channel: Channel | null = null;
    private readonly exchange = 'splits-network-events';
    private readonly queue = 'billing-events-queue';

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

            // Bind to invoice.paid events for immediate payout processing
            await this.channel.bindQueue(this.queue, this.exchange, 'invoice.paid');

            // Bind to escrow hold releases for payout scheduling
            await this.channel.bindQueue(this.queue, this.exchange, 'escrow_hold.auto_released');

            // Start consuming
            await this.channel.consume(
                this.queue,
                (msg) => this.handleMessage(msg),
                { noAck: false }
            );

            this.logger.info('Billing event consumer connected and listening for placement, invoice, and escrow events');
        } catch (error) {
            this.logger.error({ err: error }, 'Failed to connect billing event consumer');
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
            } else if (routingKey === 'invoice.paid') {
                await this.handleInvoicePaid(content.payload);
            } else if (routingKey === 'escrow_hold.auto_released') {
                await this.handleEscrowHoldReleased(content.payload);
            }

            // Acknowledge message
            this.channel.ack(msg);
        } catch (error) {
            const routingKey = msg.fields.routingKey;
            let eventSummary: Record<string, unknown> = { routingKey };
            try {
                const parsed = JSON.parse(msg.content.toString());
                eventSummary.event_id = parsed.event_id;
                eventSummary.event_type = parsed.event_type ?? routingKey;
            } catch { /* unparseable — log routing key only */ }
            this.logger.error({ err: error, ...eventSummary }, 'Error handling message');

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

                if (splits.length === 0) {
                    this.logger.info(
                        { placement_id: event.placement_id },
                        'No recruiter roles on placement — skipping split/transaction creation'
                    );
                } else {
                    this.logger.info(
                        {
                            placement_id: event.placement_id,
                            split_count: splits.length,
                            transaction_count: transactions.length,
                            total_amount: splits.reduce((sum, s) => sum + (s.split_amount || 0), 0),
                            roles_paid: splits.map(s => s.role),
                        },
                        'Created placement splits and payout transactions'
                    );
                }
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
     * Handle invoice.paid event - trigger immediate payout processing
     */
    private async handleInvoicePaid(event: InvoicePaidEvent): Promise<void> {
        this.logger.info({ stripe_invoice_id: event.stripe_invoice_id }, 'Processing invoice.paid event');

        try {
            // Find placement invoice
            const { data: placementInvoice, error: queryError } = await this.supabase
                .from('placement_invoices')
                .select('placement_id')
                .eq('stripe_invoice_id', event.stripe_invoice_id)
                .single();

            if (queryError || !placementInvoice) {
                this.logger.error(
                    { err: queryError, stripe_invoice_id: event.stripe_invoice_id },
                    'Failed to find placement invoice for paid invoice'
                );
                return;
            }

            const placementId = placementInvoice.placement_id;

            // Check if a payout schedule already exists for this placement
            const { data: existingSchedule } = await this.supabase
                .from('payout_schedules')
                .select('id')
                .eq('placement_id', placementId)
                .limit(1)
                .maybeSingle();

            if (existingSchedule) {
                this.logger.info(
                    { placement_id: placementId, schedule_id: existingSchedule.id },
                    'Payout schedule already exists for placement — skipping creation'
                );
                return;
            }

            // Get the invoice's collectible_at date (settlement buffer)
            const { data: invoiceDetails } = await this.supabase
                .from('placement_invoices')
                .select('collectible_at')
                .eq('stripe_invoice_id', event.stripe_invoice_id)
                .single();

            const scheduledDate = invoiceDetails?.collectible_at || new Date().toISOString();

            // Create payout schedule so cron jobs can process it
            const { data: schedule, error: scheduleError } = await this.supabase
                .from('payout_schedules')
                .insert({
                    placement_id: placementId,
                    scheduled_date: scheduledDate,
                    trigger_event: 'invoice.paid',
                    status: 'scheduled',
                    retry_count: 0,
                })
                .select()
                .single();

            if (scheduleError) {
                this.logger.error(
                    { err: scheduleError, placement_id: placementId },
                    'Failed to create payout schedule for paid invoice'
                );
                throw scheduleError;
            }

            this.logger.info(
                {
                    placement_id: placementId,
                    schedule_id: schedule.id,
                    scheduled_date: scheduledDate,
                    stripe_invoice_id: event.stripe_invoice_id,
                    amount_paid: event.amount_paid,
                },
                'Created payout schedule for paid invoice'
            );

        } catch (error) {
            this.logger.error(
                { err: error, stripe_invoice_id: event.stripe_invoice_id },
                'Failed to process invoice.paid event'
            );
            throw error; // Re-throw to trigger message requeue
        }
    }

    /**
     * Handle escrow_hold.auto_released event — schedule payouts for the released placement.
     * When an escrow hold is released, the held funds become available for payout.
     */
    private async handleEscrowHoldReleased(event: EscrowHoldReleasedEvent): Promise<void> {
        this.logger.info({ placement_id: event.placementId, hold_id: event.holdId }, 'Processing escrow_hold.auto_released event');

        try {
            // Check if remaining active holds exist for this placement
            const { data: activeHolds, error: holdError } = await this.supabase
                .from('escrow_holds')
                .select('id')
                .eq('placement_id', event.placementId)
                .eq('status', 'active')
                .limit(1);

            if (holdError) {
                this.logger.error({ err: holdError, placement_id: event.placementId }, 'Failed to check active holds');
                throw holdError;
            }

            if (activeHolds && activeHolds.length > 0) {
                this.logger.info(
                    { placement_id: event.placementId, remaining_holds: activeHolds.length },
                    'Placement still has active escrow holds — deferring payout scheduling'
                );
                return;
            }

            // No remaining holds — check if a payout schedule already exists
            const { data: existingSchedule } = await this.supabase
                .from('payout_schedules')
                .select('id')
                .eq('placement_id', event.placementId)
                .eq('trigger_event', 'escrow_hold.released')
                .limit(1)
                .maybeSingle();

            if (existingSchedule) {
                this.logger.info(
                    { placement_id: event.placementId, schedule_id: existingSchedule.id },
                    'Payout schedule for escrow release already exists — skipping'
                );
                return;
            }

            // Schedule payout immediately (all holds released, funds available)
            const { data: schedule, error: scheduleError } = await this.supabase
                .from('payout_schedules')
                .insert({
                    placement_id: event.placementId,
                    scheduled_date: new Date().toISOString(),
                    trigger_event: 'escrow_hold.released',
                    status: 'scheduled',
                    retry_count: 0,
                })
                .select()
                .single();

            if (scheduleError) {
                this.logger.error(
                    { err: scheduleError, placement_id: event.placementId },
                    'Failed to create payout schedule after escrow release'
                );
                throw scheduleError;
            }

            this.logger.info(
                {
                    placement_id: event.placementId,
                    schedule_id: schedule.id,
                    hold_id: event.holdId,
                    hold_amount: event.holdAmount,
                },
                'Created payout schedule after all escrow holds released'
            );
        } catch (error) {
            this.logger.error(
                { err: error, placement_id: event.placementId, hold_id: event.holdId },
                'Failed to process escrow_hold.auto_released event'
            );
            throw error;
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
            this.logger.info('Billing event consumer closed');
        } catch (error) {
            this.logger.error({ err: error }, 'Error closing billing event consumer');
        }
    }
}
