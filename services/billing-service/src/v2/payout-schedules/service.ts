// PayoutScheduleServiceV2 - Business logic for payout schedule automation

import { SupabaseClient } from '@supabase/supabase-js';
import { StandardListParams, StandardListResponse } from '@splits-network/shared-types';
import { EventPublisher } from '../shared/events';
import { PayoutScheduleRepository } from './repository';
import { PayoutAuditRepository } from '../audit/repository';
import {
    PayoutSchedule,
    PayoutScheduleCreate,
    PayoutScheduleUpdate,
    PayoutScheduleFilters,
} from './types';

const MAX_RETRY_ATTEMPTS = 3;

export class PayoutScheduleServiceV2 {
    private repository: PayoutScheduleRepository;
    private eventPublisher: EventPublisher;
    private auditRepository: PayoutAuditRepository;

    constructor(
        supabase: SupabaseClient,
        eventPublisher: EventPublisher,
        auditRepository: PayoutAuditRepository
    ) {
        this.repository = new PayoutScheduleRepository(supabase);
        this.eventPublisher = eventPublisher;
        this.auditRepository = auditRepository;
    }

    /**
     * List payout schedules with filters
     */
    async list(
        clerkUserId: string,
        params: StandardListParams & { filters?: PayoutScheduleFilters }
    ): Promise<StandardListResponse<PayoutSchedule>> {
        return this.repository.list(clerkUserId, params);
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

        // Log schedule creation (not payout creation - that happens during processing)
        if (schedule.payout_id) {
            await this.auditRepository.logAction(
                schedule.payout_id,
                'create_schedule',
                'Created payout schedule',
                { trigger_event: schedule.trigger_event, scheduled_date: schedule.scheduled_date, placement_id: schedule.placement_id },
                clerkUserId,
                'platform_admin'
            );
        }

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

        // Log update to audit log if payout exists
        if (schedule.payout_id) {
            await this.auditRepository.logAction(
                schedule.payout_id,
                'update_schedule',
                `Updated payout schedule`,
                updates,
                clerkUserId,
                'platform_admin'
            );
        }

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

        // Log deletion to audit log if payout exists
        if (schedule.payout_id) {
            await this.auditRepository.logAction(
                schedule.payout_id,
                'delete_schedule',
                `Payout schedule deleted by admin`,
                undefined,
                clerkUserId,
                'platform_admin'
            );
        }

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

    /**
     * Process a single schedule
     */
    private async processSchedule(schedule: PayoutSchedule): Promise<void> {
        // Mark as processing
        await this.repository.markProcessing(schedule.id);

        // Log processing start if payout exists
        if (schedule.payout_id) {
            await this.auditRepository.logProcessing(
                schedule.payout_id,
                undefined,
                { schedule_id: schedule.id, trigger_event: schedule.trigger_event }
            );
        }

        // TODO: Integrate with payout creation logic
        // For now, we'll create a placeholder payout
        // In real implementation, this would:
        // 1. Calculate payout amount from placement
        // 2. Check escrow holds
        // 3. Create Stripe payout
        // 4. Create payout record

        console.log(`Processing schedule ${schedule.id} for placement ${schedule.placement_id}`);

        // Simulate payout creation (replace with actual logic)
        const payoutId = `payout_${schedule.id}`;

        // Mark as processed
        await this.repository.markProcessed(schedule.id, payoutId);

        // Log successful completion if payout exists
        if (schedule.payout_id) {
            await this.auditRepository.logCompletion(
                schedule.payout_id,
                { schedule_id: schedule.id, created_payout_id: payoutId }
            );
        }

        // Publish event
        await this.eventPublisher.publish('payout_schedule.processed', {
            scheduleId: schedule.id,
            placementId: schedule.placement_id,
            payoutId,
        });
    }

    /**
     * Handle schedule processing failure with retry logic
     */
    private async handleScheduleFailure(
        scheduleId: string,
        error: unknown
    ): Promise<void> {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Get current schedule to check retry count and payout_id
        const { data: schedule } = await this.repository['supabase']
            .from('payout_schedules')
            .select('retry_count, payout_id')
            .eq('id', scheduleId)
            .single();

        const retryCount = (schedule?.retry_count || 0) + 1;

        // Mark as failed
        await this.repository.markFailed(scheduleId, errorMessage);

        // Log failure to audit log if payout exists
        if (schedule?.payout_id) {
            await this.auditRepository.logFailure(
                schedule.payout_id,
                errorMessage,
                { retry_count: retryCount, schedule_id: scheduleId }
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

        // Only process schedules in scheduled status
        if (schedule.status !== 'scheduled') {
            throw new Error(`Cannot process schedule in ${schedule.status} status`);
        }

        // Log manual trigger action if payout exists
        if (schedule.payout_id) {
            await this.auditRepository.logAction(
                schedule.payout_id,
                'trigger_processing',
                `Manual processing triggered by admin`,
                undefined,
                clerkUserId,
                'platform_admin'
            );
        }

        // Process the schedule
        await this.processSchedule(schedule);

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
