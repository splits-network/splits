// PayoutScheduleServiceV2 - Business logic for payout schedule automation

import { SupabaseClient } from '@supabase/supabase-js';
import { StandardListParams, StandardListResponse } from '@splits-network/shared-types';
import { IEventPublisher } from '../shared/events';
import { PayoutScheduleRepository } from './repository';
import { PayoutAuditRepository } from '../audit/repository';
import { InvoiceEligibilityRepository } from './invoice-eligibility-repository';
import { PlacementInvoice } from '../placement-invoices/types';
import { PayoutServiceV2 } from '../payouts/service';
import {
    PayoutSchedule,
    PayoutScheduleCreate,
    PayoutScheduleUpdate,
    PayoutScheduleFilters,
    PayoutScheduleWithAmount,
} from './types';

const MAX_RETRY_ATTEMPTS = 3;

export class PayoutScheduleServiceV2 {
    private supabase: SupabaseClient;
    private repository: PayoutScheduleRepository;
    private eventPublisher: IEventPublisher;
    private auditRepository: PayoutAuditRepository;
    private invoiceRepository: InvoiceEligibilityRepository;

    constructor(
        supabase: SupabaseClient,
        eventPublisher: IEventPublisher,
        auditRepository: PayoutAuditRepository,
        private payoutService: PayoutServiceV2
    ) {
        this.supabase = supabase;
        this.repository = new PayoutScheduleRepository(supabase);
        this.eventPublisher = eventPublisher;
        this.auditRepository = auditRepository;
        this.invoiceRepository = new InvoiceEligibilityRepository(supabase);
    }

    /**
     * List payout schedules with filters, enriched with transaction amounts
     */
    async list(
        clerkUserId: string,
        params: StandardListParams & { filters?: PayoutScheduleFilters }
    ): Promise<StandardListResponse<PayoutScheduleWithAmount>> {
        const result = await this.repository.list(clerkUserId, params);

        if (result.data.length === 0) {
            return { ...result, data: [] };
        }

        // Enrich with transaction totals
        const placementIds = [...new Set(result.data.map(s => s.placement_id))];
        const { data: totals } = await this.supabase
            .from('placement_payout_transactions')
            .select('placement_id, amount')
            .in('placement_id', placementIds);

        const amountMap = new Map<string, { total: number; count: number }>();
        for (const row of totals || []) {
            const entry = amountMap.get(row.placement_id) || { total: 0, count: 0 };
            entry.total += Number(row.amount) || 0;
            entry.count += 1;
            amountMap.set(row.placement_id, entry);
        }

        const enriched: PayoutScheduleWithAmount[] = result.data.map(schedule => ({
            ...schedule,
            total_amount: amountMap.get(schedule.placement_id)?.total || 0,
            transaction_count: amountMap.get(schedule.placement_id)?.count || 0,
        }));

        return { ...result, data: enriched };
    }

    /**
     * Get a single payout schedule by ID
     */
    async getById(id: string, clerkUserId: string): Promise<PayoutSchedule | null> {
        return this.repository.getById(id, clerkUserId);
    }

    /**
     * Create a new payout schedule
     */
    async create(
        clerkUserId: string,
        scheduleData: PayoutScheduleCreate
    ): Promise<PayoutSchedule> {
        // Validate schedule data
        this.validateScheduleData(scheduleData);

        // Create schedule
        const schedule = await this.repository.create(clerkUserId, scheduleData);

        // Log schedule creation
        await this.auditRepository.logScheduleAction(
            schedule.id,
            schedule.placement_id,
            'create_schedule',
            'Created payout schedule',
            { trigger_event: schedule.trigger_event, scheduled_date: schedule.scheduled_date },
            clerkUserId,
            'platform_admin'
        );

        // Publish event
        await this.eventPublisher.publish('payout_schedule.created', {
            scheduleId: schedule.id,
            placementId: schedule.placement_id,
            scheduledDate: schedule.scheduled_date,
            triggerEvent: schedule.trigger_event,
        });

        return schedule;
    }

    /**
     * Update a payout schedule
     */
    async update(
        id: string,
        clerkUserId: string,
        updates: PayoutScheduleUpdate
    ): Promise<PayoutSchedule> {
        // Validate updates
        if (updates.scheduled_date) {
            const scheduledDate = new Date(updates.scheduled_date);
            if (isNaN(scheduledDate.getTime())) {
                throw new Error('Invalid scheduled_date format');
            }
        }

        if (updates.guarantee_completion_date) {
            const guaranteeDate = new Date(updates.guarantee_completion_date);
            if (isNaN(guaranteeDate.getTime())) {
                throw new Error('Invalid guarantee_completion_date format');
            }
        }

        // Update schedule
        const schedule = await this.repository.update(id, clerkUserId, updates);

        // Log update to audit log
        await this.auditRepository.logScheduleAction(
            schedule.id,
            schedule.placement_id,
            'update_schedule',
            'Updated payout schedule',
            updates,
            clerkUserId,
            'platform_admin'
        );

        // Publish event
        await this.eventPublisher.publish('payout_schedule.updated', {
            scheduleId: schedule.id,
            placementId: schedule.placement_id,
            changes: Object.keys(updates),
        });

        return schedule;
    }

    /**
     * Cancel a payout schedule
     */
    async cancel(
        id: string,
        clerkUserId: string,
        reason: string
    ): Promise<PayoutSchedule> {
        const schedule = await this.repository.update(id, clerkUserId, {
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            cancellation_reason: reason,
        });

        // Publish event
        await this.eventPublisher.publish('payout_schedule.cancelled', {
            scheduleId: schedule.id,
            placementId: schedule.placement_id,
            reason,
        });

        return schedule;
    }

    /**
     * Delete a payout schedule (soft delete)
     */
    async delete(id: string, clerkUserId: string): Promise<void> {
        // Get schedule to get payout_id for audit logging
        const schedule = await this.repository.getById(id, clerkUserId);
        if (!schedule) {
            throw new Error('Payout schedule not found');
        }

        // Log deletion to audit log
        await this.auditRepository.logScheduleAction(
            schedule.id,
            schedule.placement_id,
            'delete_schedule',
            'Payout schedule deleted by admin',
            undefined,
            clerkUserId,
            'platform_admin'
        );

        await this.repository.delete(id, clerkUserId);

        // Publish event
        await this.eventPublisher.publish('payout_schedule.deleted', {
            scheduleId: id,
        });
    }

    /**
     * Process due schedules (automation job)
     * This is the core automation logic called by the cron job
     */
    async processDueSchedules(): Promise<{
        processed: number;
        failed: number;
        errors: Array<{ scheduleId: string; error: string }>;
    }> {
        const results = {
            processed: 0,
            failed: 0,
            errors: [] as Array<{ scheduleId: string; error: string }>,
        };

        try {
            // Find all due schedules
            const dueSchedules = await this.repository.findDueSchedules(new Date());

            console.log(`Found ${dueSchedules.length} due schedules to process`);

            // Process each schedule
            for (const schedule of dueSchedules) {
                try {
                    await this.processSchedule(schedule);
                    results.processed++;
                } catch (error) {
                    console.error(`Failed to process schedule ${schedule.id}:`, error);
                    results.failed++;
                    results.errors.push({
                        scheduleId: schedule.id,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });

                    // Mark schedule as failed with retry logic
                    await this.handleScheduleFailure(schedule.id, error);
                }
            }

            console.log(`Processed ${results.processed} schedules, ${results.failed} failed`);
        } catch (error) {
            console.error('Error in processDueSchedules:', error);
            throw error;
        }

        return results;
    }

    async processDueSchedulesForPlacement(placementId: string): Promise<{
        processed: number;
        failed: number;
        errors: Array<{ scheduleId: string; error: string }>;
    }> {
        const results = {
            processed: 0,
            failed: 0,
            errors: [] as Array<{ scheduleId: string; error: string }>,
        };

        try {
            const dueSchedules = await this.repository.findDueSchedulesForPlacement(placementId, new Date());
            for (const schedule of dueSchedules) {
                try {
                    await this.processSchedule(schedule);
                    results.processed++;
                } catch (error) {
                    results.failed++;
                    results.errors.push({
                        scheduleId: schedule.id,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });
                    await this.handleScheduleFailure(schedule.id, error);
                }
            }
        } catch (error) {
            throw error;
        }

        return results;
    }

    /**
     * Process a single schedule
     */
    private async processSchedule(schedule: PayoutSchedule, callerClerkUserId?: string): Promise<void> {
        // Mark as processing
        await this.repository.markProcessing(schedule.id);

        // Log processing start
        await this.auditRepository.logScheduleProcessing(
            schedule.id,
            schedule.placement_id,
            { trigger_event: schedule.trigger_event, payout_id: schedule.payout_id }
        );

        console.log(`Processing schedule ${schedule.id} for placement ${schedule.placement_id}`);

        // Check invoice collectibility
        const invoice = await this.invoiceRepository.getInvoiceByPlacementId(schedule.placement_id);
        if (!this.isInvoiceCollectible(invoice)) {
            await this.repository.markFailed(
                schedule.id,
                'Invoice not collectible (missing, unpaid, or due date not reached)'
            );
            return;
        }

        // Execute Stripe transfers for all pending transactions
        // Admin triggers pass clerkUserId for auth; cron/system use internal method (no auth check)
        let processed;
        try {
            processed = callerClerkUserId
                ? await this.payoutService.processPlacementTransactions(schedule.placement_id, callerClerkUserId)
                : await this.payoutService.processPlacementTransactionsInternal(schedule.placement_id);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error during transfer processing';
            await this.repository.markFailed(schedule.id, errorMessage);
            throw error;
        }

        // Check for partial failures (some paid, some failed)
        const paid = processed.filter(t => t.status === 'paid');
        const failed = processed.filter(t => t.status === 'failed');
        const payoutId = paid[0]?.id || null;

        if (failed.length > 0 && paid.length > 0) {
            // Partial success — mark as processed but note the failures
            const failureNote = `Partial: ${paid.length} paid, ${failed.length} failed`;
            await this.repository.markProcessed(schedule.id, payoutId);
            console.warn(`Schedule ${schedule.id}: ${failureNote}`);
        } else {
            // Full success (or all skipped/zero-amount)
            await this.repository.markProcessed(schedule.id, payoutId);
        }

        // Log successful completion
        await this.auditRepository.logScheduleCompletion(
            schedule.id,
            schedule.placement_id,
            {
                paid_count: paid.length,
                failed_count: failed.length,
                payout_id: payoutId,
            }
        );

        // Publish event
        await this.eventPublisher.publish('payout_schedule.processed', {
            scheduleId: schedule.id,
            placementId: schedule.placement_id,
            ...(payoutId && { payoutId }),
        });
    }

    private isInvoiceCollectible(invoice: PlacementInvoice | null): boolean {
        if (!invoice) return false;

        // For paid invoices, check if funds are available in our Stripe balance
        if (invoice.invoice_status === 'paid') {
            // If we have funds_available flag, respect that (from payout.paid webhook)
            if (invoice.funds_available === true) {
                return true;
            }

            // If no funds_available data yet, fall back to settlement delay 
            // (7-day buffer set in webhook should account for worst-case settlement time)
            if (invoice.collectible_at && new Date() >= new Date(invoice.collectible_at)) {
                return true;
            }

            // Paid but funds not confirmed available yet
            return false;
        }

        // For open invoices, check collectible_at (net terms)
        if (invoice.invoice_status === 'open' && invoice.collectible_at) {
            return new Date(invoice.collectible_at) <= new Date();
        }

        return false;
    }

    /**
     * Handle schedule processing failure with retry logic
     */
    private async handleScheduleFailure(
        scheduleId: string,
        error: unknown
    ): Promise<void> {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Get current schedule to check retry count
        const { data: schedule } = await this.repository['supabase']
            .from('payout_schedules')
            .select('retry_count, payout_id, placement_id')
            .eq('id', scheduleId)
            .single();

        const retryCount = (schedule?.retry_count || 0) + 1;

        // Mark as failed
        await this.repository.markFailed(scheduleId, errorMessage);

        // Log failure to audit log
        if (schedule?.placement_id) {
            await this.auditRepository.logScheduleFailure(
                scheduleId,
                schedule.placement_id,
                errorMessage,
                { retry_count: retryCount }
            );
        }

        // If max retries reached, publish failure event
        if (retryCount >= MAX_RETRY_ATTEMPTS) {
            await this.eventPublisher.publish('payout_schedule.failed', {
                scheduleId,
                reason: errorMessage,
                retryCount,
            });
        }
    }

    /**
     * Trigger manual processing of a specific schedule (admin only)
     */
    async triggerProcessing(
        scheduleId: string,
        clerkUserId: string
    ): Promise<PayoutSchedule> {
        // Get the schedule
        const schedule = await this.repository.getById(scheduleId, clerkUserId);
        if (!schedule) {
            throw new Error('Payout schedule not found');
        }

        // Only allow triggering schedules that are scheduled or failed (retry)
        if (schedule.status !== 'scheduled' && schedule.status !== 'failed') {
            throw new Error(`Cannot process schedule in ${schedule.status} status`);
        }

        // Log manual trigger action
        await this.auditRepository.logScheduleAction(
            schedule.id,
            schedule.placement_id,
            'trigger_processing',
            'Manual processing triggered by admin',
            undefined,
            clerkUserId,
            'platform_admin'
        );

        // Process the schedule with admin's identity for auth
        await this.processSchedule(schedule, clerkUserId);

        // Return updated schedule
        const updated = await this.repository.getById(scheduleId, clerkUserId);
        if (!updated) {
            throw new Error('Failed to retrieve updated schedule');
        }

        return updated;
    }

    /**
     * Validate schedule data
     */
    private validateScheduleData(data: PayoutScheduleCreate): void {
        if (!data.placement_id) {
            throw new Error('placement_id is required');
        }

        if (!data.scheduled_date) {
            throw new Error('scheduled_date is required');
        }

        if (!data.trigger_event) {
            throw new Error('trigger_event is required');
        }

        // Validate date format
        const scheduledDate = new Date(data.scheduled_date);
        if (isNaN(scheduledDate.getTime())) {
            throw new Error('Invalid scheduled_date format');
        }

        // Validate guarantee date if provided
        if (data.guarantee_completion_date) {
            const guaranteeDate = new Date(data.guarantee_completion_date);
            if (isNaN(guaranteeDate.getTime())) {
                throw new Error('Invalid guarantee_completion_date format');
            }

            // Guarantee date should be after scheduled date
            if (guaranteeDate <= scheduledDate) {
                throw new Error(
                    'guarantee_completion_date must be after scheduled_date'
                );
            }
        }
    }
}
