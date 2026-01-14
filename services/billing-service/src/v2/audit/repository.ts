// PayoutAuditRepository - Audit logging for payout operations

import { SupabaseClient } from '@supabase/supabase-js';
import { StandardListParams, StandardListResponse } from '@splits-network/shared-types';
import { resolveAccessContext, isRecruiter, isCompanyUser, getAccessibleCompanyIds } from '../shared/access-helpers';
import { PayoutAuditLog, PayoutAuditCreate, PayoutAuditFilters } from './types';

export class PayoutAuditRepository {
    constructor(private supabase: SupabaseClient) { }

    /**
     * List audit logs with role-based filtering and pagination
     */
    async list(
        clerkUserId: string,
        params: StandardListParams & { filters?: PayoutAuditFilters }
    ): Promise<StandardListResponse<PayoutAuditLog>> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);
        const { page = 1, limit = 25, search, filters, sort_by, sort_order } = params;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('payout_audit_log')
            .select('*', { count: 'exact' });

        // Apply role-based filtering (audit logs visible based on payout access)
        if (isRecruiter(context)) {
            // Recruiters see audit logs for their payouts
            const { data: payouts } = await this.supabase
                .from('payouts')
                .select('id')
                .eq('recruiter_user_id', context.identityUserId);

            const payoutIds = payouts?.map(p => p.id) || [];
            if (payoutIds.length === 0) {
                return {
                    data: [],
                    pagination: { total: 0, page, limit, total_pages: 0 }
                };
            }
            query = query.in('payout_id', payoutIds);
        } else if (isCompanyUser(context)) {
            // Company users see audit logs for their organization's payouts
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

            const { data: payouts } = await this.supabase
                .from('payouts')
                .select('id')
                .in('placement_id', placementIds);

            const payoutIds = payouts?.map(p => p.id) || [];
            if (payoutIds.length === 0) {
                return {
                    data: [],
                    pagination: { total: 0, page, limit, total_pages: 0 }
                };
            }
            query = query.in('payout_id', payoutIds);
        }
        // Platform admins see all audit logs (no filter)

        // Apply filters
        if (filters?.payout_id) {
            query = query.eq('payout_id', filters.payout_id);
        }
        if (filters?.event_type) {
            query = query.eq('event_type', filters.event_type);
        }
        if (filters?.action) {
            query = query.eq('action', filters.action);
        }
        if (filters?.changed_by) {
            query = query.eq('changed_by', filters.changed_by);
        }
        if (filters?.date_from) {
            query = query.gte('created_at', filters.date_from);
        }
        if (filters?.date_to) {
            query = query.lte('created_at', filters.date_to);
        }

        // Apply search (across event_type, action, reason)
        if (search) {
            query = query.or(
                `event_type.ilike.%${search}%,action.ilike.%${search}%,reason.ilike.%${search}%`
            );
        }

        // Apply sorting
        const sortBy = sort_by || 'created_at';
        const sortOrder = sort_order || 'desc';
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data, count, error } = await query;

        if (error) {
            throw new Error(`Failed to list audit logs: ${error.message}`);
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
     * Get audit logs for a specific payout
     */
    async getByPayoutId(payoutId: string, clerkUserId: string): Promise<PayoutAuditLog[]> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        let query = this.supabase
            .from('payout_audit_log')
            .select('*')
            .eq('payout_id', payoutId)
            .order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
            throw new Error(`Failed to get audit logs: ${error.message}`);
        }

        // Additional role-based access check
        if (data && data.length > 0 && !context.isPlatformAdmin) {
            // Verify access to this payout
            const { data: payout } = await this.supabase
                .from('payouts')
                .select('recruiter_user_id, placement_id')
                .eq('id', payoutId)
                .single();

            if (!payout) {
                return [];
            }

            if (isRecruiter(context) && payout.recruiter_user_id !== context.identityUserId) {
                return [];
            }

            if (isCompanyUser(context)) {
                const { data: placement } = await this.supabase
                    .from('placements')
                    .select('company_id')
                    .eq('id', payout.placement_id)
                    .single();

                if (!placement || !getAccessibleCompanyIds(context).includes(placement.company_id)) {
                    return [];
                }
            }
        }

        return data || [];
    }

    /**
     * Log a change to a payout (status, amount, etc.)
     */
    async logChange(data: PayoutAuditCreate): Promise<PayoutAuditLog> {
        const { data: log, error } = await this.supabase
            .from('payout_audit_log')
            .insert(data)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to log payout change: ${error.message}`);
        }

        return log;
    }

    /**
     * Log an action on a payout (process, retry, cancel, etc.)
     */
    async logAction(
        payoutId: string,
        action: string,
        reason?: string,
        metadata?: Record<string, any>,
        changedBy?: string,
        changedByRole?: string
    ): Promise<PayoutAuditLog> {
        return this.logChange({
            payout_id: payoutId,
            event_type: 'action',
            action,
            reason,
            metadata,
            changed_by: changedBy,
            changed_by_role: changedByRole,
        });
    }

    /**
     * Log a status change
     */
    async logStatusChange(
        payoutId: string,
        oldStatus: string,
        newStatus: string,
        reason?: string,
        changedBy?: string,
        changedByRole?: string
    ): Promise<PayoutAuditLog> {
        return this.logChange({
            payout_id: payoutId,
            event_type: 'status_change',
            old_status: oldStatus,
            new_status: newStatus,
            reason,
            changed_by: changedBy,
            changed_by_role: changedByRole,
        });
    }

    /**
     * Log an amount change
     */
    async logAmountChange(
        payoutId: string,
        oldAmount: number,
        newAmount: number,
        reason?: string,
        changedBy?: string,
        changedByRole?: string
    ): Promise<PayoutAuditLog> {
        return this.logChange({
            payout_id: payoutId,
            event_type: 'amount_change',
            old_amount: oldAmount,
            new_amount: newAmount,
            reason,
            changed_by: changedBy,
            changed_by_role: changedByRole,
        });
    }

    /**
     * Log payout creation
     */
    async logCreation(
        payoutId: string,
        amount: number,
        createdBy?: string,
        metadata?: Record<string, any>
    ): Promise<PayoutAuditLog> {
        return this.logChange({
            payout_id: payoutId,
            event_type: 'created',
            new_amount: amount,
            metadata,
            created_by: createdBy,
        });
    }

    /**
     * Log payout processing
     */
    async logProcessing(
        payoutId: string,
        stripePayoutId?: string,
        metadata?: Record<string, any>
    ): Promise<PayoutAuditLog> {
        return this.logChange({
            payout_id: payoutId,
            event_type: 'processing',
            metadata: { ...metadata, stripe_payout_id: stripePayoutId },
        });
    }

    /**
     * Log payout completion
     */
    async logCompletion(
        payoutId: string,
        metadata?: Record<string, any>
    ): Promise<PayoutAuditLog> {
        return this.logChange({
            payout_id: payoutId,
            event_type: 'completed',
            metadata,
        });
    }

    /**
     * Log payout failure
     */
    async logFailure(
        payoutId: string,
        reason: string,
        metadata?: Record<string, any>
    ): Promise<PayoutAuditLog> {
        return this.logChange({
            payout_id: payoutId,
            event_type: 'failed',
            reason,
            metadata,
        });
    }
}
