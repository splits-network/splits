// EscrowHoldServiceV2 - Business logic for escrow hold management

import { SupabaseClient } from '@supabase/supabase-js';
import { StandardListParams, StandardListResponse } from '@splits-network/shared-types';
import { EventPublisher } from '../shared/events';
import { EscrowHoldRepository } from './repository';
import { PayoutAuditRepository } from '../audit/repository';
import {
    EscrowHold,
    EscrowHoldCreate,
    EscrowHoldUpdate,
    EscrowHoldFilters,
} from './types';

export class EscrowHoldServiceV2 {
    private repository: EscrowHoldRepository;
    private eventPublisher: EventPublisher;
    private auditRepository: PayoutAuditRepository;

    constructor(
        supabase: SupabaseClient,
        eventPublisher: EventPublisher,
        auditRepository: PayoutAuditRepository
    ) {
        this.repository = new EscrowHoldRepository(supabase);
        this.eventPublisher = eventPublisher;
        this.auditRepository = auditRepository;
    }

    /**
     * List escrow holds with filters
     */
    async list(
        clerkUserId: string,
        params: StandardListParams & { filters?: EscrowHoldFilters }
    ): Promise<StandardListResponse<EscrowHold>> {
        return this.repository.list(clerkUserId, params);
    }

    /**
     * Get a single escrow hold by ID
     */
    async getById(id: string, clerkUserId: string): Promise<EscrowHold | null> {
        return this.repository.getById(id, clerkUserId);
    }

    /**
     * Create a new escrow hold
     */
    async create(
        clerkUserId: string,
        holdData: EscrowHoldCreate
    ): Promise<EscrowHold> {
        // Validate hold data
        this.validateHoldData(holdData);

        // Create hold
        const hold = await this.repository.create(clerkUserId, holdData);

        // Log creation to audit log if payout exists
        if (hold.payout_id) {
            await this.auditRepository.logCreation(
                hold.payout_id,
                hold.hold_amount,
                clerkUserId,
                { hold_reason: hold.hold_reason, placement_id: hold.placement_id }
            );
        }

        // Publish event
        await this.eventPublisher.publish('escrow_hold.created', {
            holdId: hold.id,
            placementId: hold.placement_id,
            holdAmount: hold.hold_amount,
            releaseDate: hold.release_scheduled_date,
        });

        return hold;
    }

    /**
     * Update an escrow hold
     */
    async update(
        id: string,
        clerkUserId: string,
        updates: EscrowHoldUpdate
    ): Promise<EscrowHold> {
        // Validate updates
        if (updates.hold_amount !== undefined && updates.hold_amount < 0) {
            throw new Error('hold_amount must be non-negative');
        }

        if (updates.release_scheduled_date) {
            const releaseDate = new Date(updates.release_scheduled_date);
            if (isNaN(releaseDate.getTime())) {
                throw new Error('Invalid release_scheduled_date format');
            }
        }

        // Update hold
        const hold = await this.repository.update(id, clerkUserId, updates);

        // Log update to audit log if payout exists
        if (hold.payout_id) {
            await this.auditRepository.logAction(
                hold.payout_id,
                'update_hold',
                `Updated escrow hold`,
                updates,
                clerkUserId,
                'platform_admin'
            );
        }

        // Publish event
        await this.eventPublisher.publish('escrow_hold.updated', {
            holdId: hold.id,
            placementId: hold.placement_id,
            changes: Object.keys(updates),
        });

        return hold;
    }

    /**
     * Delete an escrow hold (soft delete)
     */
    async delete(id: string, clerkUserId: string): Promise<void> {
        // Get hold to get payout_id for audit logging
        const hold = await this.repository.getById(id, clerkUserId);
        if (!hold) {
            throw new Error('Escrow hold not found');
        }

        // Log deletion to audit log if payout exists
        if (hold.payout_id) {
            await this.auditRepository.logAction(
                hold.payout_id,
                'delete_hold',
                `Escrow hold deleted by admin`,
                undefined,
                clerkUserId,
                'platform_admin'
            );
        }

        await this.repository.delete(id, clerkUserId);

        // Publish event
        await this.eventPublisher.publish('escrow_hold.deleted', {
            holdId: id,
        });
    }

    /**
     * Release an escrow hold manually (admin only)
     */
    async release(
        id: string,
        clerkUserId: string
    ): Promise<EscrowHold> {
        // Get the hold
        const hold = await this.repository.getById(id, clerkUserId);
        if (!hold) {
            throw new Error('Escrow hold not found');
        }

        // Only release active holds
        if (hold.status !== 'active') {
            throw new Error(`Cannot release hold in ${hold.status} status`);
        }

        // Release the hold
        const released = await this.repository.release(id, clerkUserId);

        // Log release to audit log if payout exists
        if (released.payout_id) {
            await this.auditRepository.logAction(
                released.payout_id,
                'release_hold',
                `Escrow hold manually released by admin`,
                { hold_amount: released.hold_amount },
                clerkUserId,
                'platform_admin'
            );
        }

        // Publish event
        await this.eventPublisher.publish('escrow_hold.released', {
            holdId: released.id,
            placementId: released.placement_id,
            holdAmount: released.hold_amount,
            releasedBy: clerkUserId,
        });

        return released;
    }

    /**
     * Cancel an escrow hold (admin only)
     */
    async cancel(
        id: string,
        clerkUserId: string
    ): Promise<EscrowHold> {
        // Get the hold
        const hold = await this.repository.getById(id, clerkUserId);
        if (!hold) {
            throw new Error('Escrow hold not found');
        }

        // Only cancel active holds
        if (hold.status !== 'active') {
            throw new Error(`Cannot cancel hold in ${hold.status} status`);
        }

        // Cancel the hold
        const cancelled = await this.repository.cancel(id);

        // Log cancellation to audit log if payout exists
        if (cancelled.payout_id) {
            await this.auditRepository.logAction(
                cancelled.payout_id,
                'cancel_hold',
                `Escrow hold cancelled by admin`,
                undefined,
                clerkUserId,
                'platform_admin'
            );
        }

        // Publish event
        await this.eventPublisher.publish('escrow_hold.cancelled', {
            holdId: cancelled.id,
            placementId: cancelled.placement_id,
        });

        return cancelled;
    }

    /**
     * Process due releases (automation job)
     * This is called by the cron job to release holds automatically
     */
    async processDueReleases(): Promise<{
        processed: number;
        failed: number;
        errors: Array<{ holdId: string; error: string }>;
    }> {
        const results = {
            processed: 0,
            failed: 0,
            errors: [] as Array<{ holdId: string; error: string }>,
        };

        try {
            // Find all holds due for release
            const dueHolds = await this.repository.findDueReleases(new Date());

            console.log(`Found ${dueHolds.length} escrow holds due for release`);

            // Process each hold
            for (const hold of dueHolds) {
                try {
                    await this.processHoldRelease(hold);
                    results.processed++;
                } catch (error) {
                    console.error(`Failed to release hold ${hold.id}:`, error);
                    results.failed++;
                    results.errors.push({
                        holdId: hold.id,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });
                }
            }

            console.log(`Released ${results.processed} holds, ${results.failed} failed`);
        } catch (error) {
            console.error('Error in processDueReleases:', error);
            throw error;
        }

        return results;
    }

    /**
     * Process a single hold release
     */
    private async processHoldRelease(hold: EscrowHold): Promise<void> {
        console.log(`Releasing hold ${hold.id} for placement ${hold.placement_id}`);

        // Release the hold (system user)
        const released = await this.repository.release(hold.id, 'system');

        // Log automated release to audit log if payout exists
        if (released.payout_id) {
            await this.auditRepository.logAction(
                released.payout_id,
                'auto_release_hold',
                `Escrow hold automatically released on scheduled date`,
                { hold_amount: released.hold_amount },
                'system',
                'automated'
            );
        }

        // Publish event
        await this.eventPublisher.publish('escrow_hold.auto_released', {
            holdId: released.id,
            placementId: released.placement_id,
            holdAmount: released.hold_amount,
        });

        // TODO: Integrate with payout system
        // When a hold is released, we may need to:
        // 1. Create a new payout schedule
        // 2. Process pending payouts that were blocked by this hold
        // 3. Notify the recruiter
    }

    /**
     * Get active holds for a placement
     */
    async getActiveHoldsForPlacement(
        placementId: string,
        clerkUserId: string
    ): Promise<EscrowHold[]> {
        return this.repository.findActiveByPlacementId(placementId);
    }

    /**
     * Get total active hold amount for a placement
     */
    async getTotalActiveHolds(
        placementId: string,
        clerkUserId: string
    ): Promise<number> {
        return this.repository.getTotalActiveHolds(placementId);
    }

    /**
     * Validate hold data
     */
    private validateHoldData(data: EscrowHoldCreate): void {
        if (!data.placement_id) {
            throw new Error('placement_id is required');
        }

        if (data.hold_amount === undefined || data.hold_amount === null) {
            throw new Error('hold_amount is required');
        }

        if (data.hold_amount < 0) {
            throw new Error('hold_amount must be non-negative');
        }

        if (!data.hold_reason) {
            throw new Error('hold_reason is required');
        }

        if (!data.release_scheduled_date) {
            throw new Error('release_scheduled_date is required');
        }

        // Validate date format
        const releaseDate = new Date(data.release_scheduled_date);
        if (isNaN(releaseDate.getTime())) {
            throw new Error('Invalid release_scheduled_date format');
        }

        // Release date should be in the future
        if (releaseDate <= new Date()) {
            throw new Error('release_scheduled_date must be in the future');
        }
    }
}
