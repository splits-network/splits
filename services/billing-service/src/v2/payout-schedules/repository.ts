// PayoutScheduleRepository - V2 Domain Repository for Payout Schedules

import { SupabaseClient } from '@supabase/supabase-js';
import { StandardListParams, StandardListResponse } from '@splits-network/shared-types';
import { resolveAccessContext, isRecruiter, isCompanyUser, getAccessibleCompanyIds } from '../shared/access-helpers';
import {
    PayoutSchedule,
    PayoutScheduleCreate,
    PayoutScheduleUpdate,
    PayoutScheduleFilters,
} from './types';

export class PayoutScheduleRepository {
    constructor(private supabase: SupabaseClient) { }

    /**
     * List payout schedules with role-based filtering and pagination
     */
    async list(
        clerkUserId: string,
        params: StandardListParams & { filters?: PayoutScheduleFilters }
    ): Promise<StandardListResponse<PayoutSchedule>> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);
        const { page = 1, limit = 25, search, filters, sort_by, sort_order } = params;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('payout_schedules')
            .select('*', { count: 'exact' });

        // Apply role-based filtering
        if (isRecruiter(context)) {
            // Recruiters see schedules for their placements
            const { data: placements } = await this.supabase
                .from('placements')
                .select('id')
                .eq('recruiter_user_id', context.identityUserId);

            const placementIds = placements?.map(p => p.id) || [];
            if (placementIds.length === 0) {
                return {
                    data: [],
                    pagination: { total: 0, page, limit, total_pages: 0 }
                };
            }
            query = query.in('placement_id', placementIds);
        } else if (isCompanyUser(context)) {
            // Company users see schedules for their organization's placements
            const { data: placements } = await this.supabase
                .from('placements')
                .select('id')
                .in('company_id', getAccessibleCompanyIds(context));

            const placementIds = placements?.map(p => p.id) || [];
            if (placementIds.length === 0) {
                return {
                    data: [],
                    pagination: { total: 0, page, limit, total_pages: 0 }
                };
            }
            query = query.in('placement_id', placementIds);
        }
        // Platform admins see all schedules (no filter)

        // Apply filters
        if (filters?.status) {
            query = query.eq('status', filters.status);
        }
        if (filters?.date_from) {
            query = query.gte('scheduled_date', filters.date_from);
        }
        if (filters?.date_to) {
            query = query.lte('scheduled_date', filters.date_to);
        }
        if (filters?.placement_id) {
            query = query.eq('placement_id', filters.placement_id);
        }
        if (filters?.trigger_event) {
            query = query.eq('trigger_event', filters.trigger_event);
        }

        // Apply search (across trigger_event and cancellation_reason)
        if (search) {
            query = query.or(
                `trigger_event.ilike.%${search}%,cancellation_reason.ilike.%${search}%`
            );
        }

        // Apply sorting
        const sortBy = sort_by || 'scheduled_date';
        const sortOrder = sort_order || 'asc';
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data, count, error } = await query;

        if (error) {
            throw new Error(`Failed to list payout schedules: ${error.message}`);
        }

        return {
            data: data || [],
            pagination: {
                total: count || 0,
                page,
                limit,
                total_pages: Math.ceil((count || 0) / limit),
            },
        };
    }

    /**
     * Get a single payout schedule by ID with role-based access
     */
    async getById(id: string, clerkUserId: string): Promise<PayoutSchedule | null> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        let query = this.supabase
            .from('payout_schedules')
            .select('*')
            .eq('id', id)
            .single();

        const { data, error } = await query;

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw new Error(`Failed to get payout schedule: ${error.message}`);
        }

        // Additional role-based access check
        if (isRecruiter(context)) {
            // Verify this schedule belongs to recruiter's placement
            const { data: placement } = await this.supabase
                .from('placements')
                .select('recruiter_user_id')
                .eq('id', data.placement_id)
                .single();

            if (!placement || placement.recruiter_user_id !== context.identityUserId) {
                return null;
            }
        } else if (isCompanyUser(context)) {
            // Verify this schedule belongs to company's placement
            const { data: placement } = await this.supabase
                .from('placements')
                .select('company_id')
                .eq('id', data.placement_id)
                .single();

            if (!placement || !getAccessibleCompanyIds(context).includes(placement.company_id)) {
                return null;
            }
        }

        return data;
    }

    /**
     * Create a new payout schedule (admin/system only)
     */
    async create(
        clerkUserId: string,
        scheduleData: PayoutScheduleCreate
    ): Promise<PayoutSchedule> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Only platform admins can manually create schedules
        if (!context.isPlatformAdmin) {
            throw new Error('Only platform administrators can create payout schedules');
        }

        const { data, error } = await this.supabase
            .from('payout_schedules')
            .insert({
                ...scheduleData,
                status: scheduleData.status || 'scheduled',
                retry_count: 0,
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create payout schedule: ${error.message}`);
        }

        return data;
    }

    /**
     * Update a payout schedule with role-based access
     */
    async update(
        id: string,
        clerkUserId: string,
        updates: PayoutScheduleUpdate
    ): Promise<PayoutSchedule> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Only platform admins can update schedules
        if (!context.isPlatformAdmin) {
            throw new Error('Only platform administrators can update payout schedules');
        }

        const { data, error } = await this.supabase
            .from('payout_schedules')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update payout schedule: ${error.message}`);
        }

        return data;
    }

    /**
     * Delete a payout schedule (admin only - soft delete by marking as cancelled)
     */
    async delete(id: string, clerkUserId: string): Promise<void> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Only platform admins can delete schedules
        if (!context.isPlatformAdmin) {
            throw new Error('Only platform administrators can delete payout schedules');
        }

        const { error } = await this.supabase
            .from('payout_schedules')
            .update({
                status: 'cancelled',
                cancelled_at: new Date().toISOString(),
                cancellation_reason: 'Deleted by administrator',
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to delete payout schedule: ${error.message}`);
        }
    }

    /**
     * Find schedules due for processing (automation use)
     * No role filtering - system use only
     */
    async findDueSchedules(beforeDate: Date): Promise<PayoutSchedule[]> {
        const { data, error } = await this.supabase
            .from('payout_schedules')
            .select('*')
            .eq('status', 'scheduled')
            .lte('scheduled_date', beforeDate.toISOString())
            .order('scheduled_date', { ascending: true });

        if (error) {
            throw new Error(`Failed to find due schedules: ${error.message}`);
        }

        return data || [];
    }

    async findDueSchedulesForPlacement(placementId: string, beforeDate: Date): Promise<PayoutSchedule[]> {
        const { data, error } = await this.supabase
            .from('payout_schedules')
            .select('*')
            .eq('placement_id', placementId)
            .eq('status', 'scheduled')
            .lte('scheduled_date', beforeDate.toISOString())
            .order('scheduled_date', { ascending: true });

        if (error) {
            throw new Error(`Failed to find due schedules for placement: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Find schedules by placement ID (for cascade operations)
     */
    async findByPlacementId(placementId: string): Promise<PayoutSchedule[]> {
        const { data, error } = await this.supabase
            .from('payout_schedules')
            .select('*')
            .eq('placement_id', placementId)
            .order('scheduled_date', { ascending: true });

        if (error) {
            throw new Error(`Failed to find schedules by placement: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Mark schedule as triggered
     */
    async markTriggered(id: string): Promise<PayoutSchedule> {
        const { data, error } = await this.supabase
            .from('payout_schedules')
            .update({
                status: 'triggered',
                triggered_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to mark schedule as triggered: ${error.message}`);
        }

        return data;
    }

    /**
     * Mark schedule as processing
     */
    async markProcessing(id: string): Promise<PayoutSchedule> {
        const { data, error } = await this.supabase
            .from('payout_schedules')
            .update({
                status: 'processing',
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to mark schedule as processing: ${error.message}`);
        }

        return data;
    }

    /**
     * Mark schedule as processed
     */
    async markProcessed(id: string, payoutId: string): Promise<PayoutSchedule> {
        const { data, error } = await this.supabase
            .from('payout_schedules')
            .update({
                status: 'processed',
                payout_id: payoutId,
                processed_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to mark schedule as processed: ${error.message}`);
        }

        return data;
    }

    /**
     * Mark schedule as failed and increment retry count
     */
    async markFailed(id: string, reason: string): Promise<PayoutSchedule> {
        // Get current retry count
        const { data: current } = await this.supabase
            .from('payout_schedules')
            .select('retry_count')
            .eq('id', id)
            .single();

        const retryCount = (current?.retry_count || 0) + 1;

        const { data, error } = await this.supabase
            .from('payout_schedules')
            .update({
                status: 'failed',
                failure_reason: reason,
                retry_count: retryCount,
                last_retry_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to mark schedule as failed: ${error.message}`);
        }

        return data;
    }
}
