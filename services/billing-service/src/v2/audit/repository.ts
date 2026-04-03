// PlacementPayoutAuditRepository - Audit logging for placement payout operations

import { SupabaseClient } from '@supabase/supabase-js';
import { StandardListParams, StandardListResponse } from '@splits-network/shared-types';
import { resolveAccessContext, isRecruiter, isCompanyUser, getAccessibleCompanyIds } from '../shared/access-helpers.js';
import { PlacementPayoutAuditLog, PlacementPayoutAuditCreate, PlacementPayoutAuditFilters } from './types.js';

const TABLE = 'placement_payout_audit_log';

export class PayoutAuditRepository {
    constructor(private supabase: SupabaseClient) { }

    /**
     * List audit logs with role-based filtering and pagination
     */
    async list(
        clerkUserId: string,
        params: StandardListParams & { filters?: PlacementPayoutAuditFilters }
    ): Promise<StandardListResponse<PlacementPayoutAuditLog>> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);
        const { page = 1, limit = 25, search, filters, sort_by, sort_order } = params;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from(TABLE)
            .select('*', { count: 'exact' });

        // Apply role-based filtering
        if (isRecruiter(context)) {
            const { data: transactions } = await this.supabase
                .from('placement_payout_transactions')
                .select('id, placement_id')
                .eq('recruiter_id', context.identityUserId);

            const placementIds = [...new Set(transactions?.map(t => t.placement_id) || [])];
            if (placementIds.length === 0) {
                return { data: [], pagination: { total: 0, page, limit, total_pages: 0 } };
            }
            query = query.in('placement_id', placementIds);
        } else if (isCompanyUser(context)) {
            const { data: placements } = await this.supabase
                .from('placements')
                .select('id')
                .in('company_id', getAccessibleCompanyIds(context));

            const placementIds = placements?.map(p => p.id) || [];
            if (placementIds.length === 0) {
                return { data: [], pagination: { total: 0, page, limit, total_pages: 0 } };
            }
            query = query.in('placement_id', placementIds);
        }
        // Platform admins see all

        // Apply filters
        if (filters?.placement_id) query = query.eq('placement_id', filters.placement_id);
        if (filters?.schedule_id) query = query.eq('schedule_id', filters.schedule_id);
        if (filters?.transaction_id) query = query.eq('transaction_id', filters.transaction_id);
        if (filters?.event_type) query = query.eq('event_type', filters.event_type);
        if (filters?.action) query = query.eq('action', filters.action);
        if (filters?.changed_by) query = query.eq('changed_by', filters.changed_by);
        if (filters?.date_from) query = query.gte('created_at', filters.date_from);
        if (filters?.date_to) query = query.lte('created_at', filters.date_to);

        // Apply search
        if (search) {
            query = query.or(
                `event_type.ilike.%${search}%,action.ilike.%${search}%,reason.ilike.%${search}%`
            );
        }

        // Sorting and pagination
        const sortBy = sort_by || 'created_at';
        const sortOrder = sort_order || 'desc';
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
        query = query.range(offset, offset + limit - 1);

        const { data, count, error } = await query;
        if (error) throw new Error(`Failed to list audit logs: ${error.message}`);

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
     * Get audit logs for a specific placement
     */
    async getByPlacementId(placementId: string): Promise<PlacementPayoutAuditLog[]> {
        const { data, error } = await this.supabase
            .from(TABLE)
            .select('*')
            .eq('placement_id', placementId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to get audit logs: ${error.message}`);
        return data || [];
    }

    /**
     * Insert an audit log entry
     */
    async log(entry: PlacementPayoutAuditCreate): Promise<PlacementPayoutAuditLog> {
        const { data, error } = await this.supabase
            .from(TABLE)
            .insert(entry)
            .select()
            .single();

        if (error) throw new Error(`Failed to write audit log: ${error.message}`);
        return data;
    }

    // ========================================================================
    // Schedule-level logging
    // ========================================================================

    async logScheduleProcessing(
        scheduleId: string,
        placementId: string,
        metadata?: Record<string, any>
    ): Promise<PlacementPayoutAuditLog> {
        return this.log({
            placement_id: placementId,
            schedule_id: scheduleId,
            event_type: 'processing',
            action: 'schedule_processing',
            metadata,
        });
    }

    async logScheduleCompletion(
        scheduleId: string,
        placementId: string,
        metadata?: Record<string, any>
    ): Promise<PlacementPayoutAuditLog> {
        return this.log({
            placement_id: placementId,
            schedule_id: scheduleId,
            event_type: 'completed',
            action: 'schedule_completed',
            metadata,
        });
    }

    async logScheduleFailure(
        scheduleId: string,
        placementId: string,
        reason: string,
        metadata?: Record<string, any>
    ): Promise<PlacementPayoutAuditLog> {
        return this.log({
            placement_id: placementId,
            schedule_id: scheduleId,
            event_type: 'failed',
            action: 'schedule_failed',
            reason,
            metadata,
        });
    }

    async logScheduleAction(
        scheduleId: string,
        placementId: string,
        action: string,
        reason?: string,
        metadata?: Record<string, any>,
        changedBy?: string,
        changedByRole?: string
    ): Promise<PlacementPayoutAuditLog> {
        return this.log({
            placement_id: placementId,
            schedule_id: scheduleId,
            event_type: 'action',
            action,
            reason,
            metadata,
            changed_by: changedBy,
            changed_by_role: changedByRole,
        });
    }

    // ========================================================================
    // Transaction-level logging
    // ========================================================================

    async logTransactionProcessing(
        transactionId: string,
        placementId: string,
        metadata?: Record<string, any>
    ): Promise<PlacementPayoutAuditLog> {
        return this.log({
            placement_id: placementId,
            transaction_id: transactionId,
            event_type: 'processing',
            action: 'transfer_processing',
            metadata,
        });
    }

    async logTransactionSuccess(
        transactionId: string,
        placementId: string,
        metadata?: Record<string, any>
    ): Promise<PlacementPayoutAuditLog> {
        return this.log({
            placement_id: placementId,
            transaction_id: transactionId,
            event_type: 'completed',
            action: 'transfer_sent',
            metadata,
        });
    }

    async logTransactionFailure(
        transactionId: string,
        placementId: string,
        reason: string,
        metadata?: Record<string, any>
    ): Promise<PlacementPayoutAuditLog> {
        return this.log({
            placement_id: placementId,
            transaction_id: transactionId,
            event_type: 'failed',
            action: 'transfer_failed',
            reason,
            metadata,
        });
    }
}
