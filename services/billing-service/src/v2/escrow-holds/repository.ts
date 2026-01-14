// EscrowHoldRepository - V2 Domain Repository for Escrow Holds

import { SupabaseClient } from '@supabase/supabase-js';
import { StandardListParams, StandardListResponse } from '@splits-network/shared-types';
import { resolveAccessContext, isRecruiter, isCompanyUser, getAccessibleCompanyIds } from '../shared/access-helpers';
import {
    EscrowHold,
    EscrowHoldCreate,
    EscrowHoldUpdate,
    EscrowHoldFilters,
} from './types';

export class EscrowHoldRepository {
    constructor(private supabase: SupabaseClient) { }

    /**
     * List escrow holds with role-based filtering and pagination
     */
    async list(
        clerkUserId: string,
        params: StandardListParams & { filters?: EscrowHoldFilters }
    ): Promise<StandardListResponse<EscrowHold>> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);
        const { page = 1, limit = 25, search, filters, sort_by, sort_order } = params;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('escrow_holds')
            .select('*', { count: 'exact' });

        // Apply role-based filtering
        if (isRecruiter(context)) {
            // Recruiters see holds for their placements
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
            // Company users see holds for their organization's placements
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
        // Platform admins see all holds (no filter)

        // Apply filters
        if (filters?.status) {
            query = query.eq('status', filters.status);
        }
        if (filters?.placement_id) {
            query = query.eq('placement_id', filters.placement_id);
        }
        if (filters?.date_from) {
            query = query.gte('release_scheduled_date', filters.date_from);
        }
        if (filters?.date_to) {
            query = query.lte('release_scheduled_date', filters.date_to);
        }

        // Apply search (across hold_reason)
        if (search) {
            query = query.ilike('hold_reason', `%${search}%`);
        }

        // Apply sorting
        const sortBy = sort_by || 'release_scheduled_date';
        const sortOrder = sort_order || 'asc';
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data, count, error } = await query;

        if (error) {
            throw new Error(`Failed to list escrow holds: ${error.message}`);
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
     * Get a single escrow hold by ID with role-based access
     */
    async getById(id: string, clerkUserId: string): Promise<EscrowHold | null> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        const { data, error } = await this.supabase
            .from('escrow_holds')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw new Error(`Failed to get escrow hold: ${error.message}`);
        }

        // Additional role-based access check
        if (isRecruiter(context)) {
            // Verify this hold belongs to recruiter's placement
            const { data: placement } = await this.supabase
                .from('placements')
                .select('recruiter_user_id')
                .eq('id', data.placement_id)
                .single();

            if (!placement || placement.recruiter_user_id !== context.identityUserId) {
                return null;
            }
        } else if (isCompanyUser(context)) {
            // Verify this hold belongs to company's placement
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
     * Create a new escrow hold (admin/system only)
     */
    async create(
        clerkUserId: string,
        holdData: EscrowHoldCreate
    ): Promise<EscrowHold> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Only platform admins can manually create holds
        if (!context.isPlatformAdmin) {
            throw new Error('Only platform administrators can create escrow holds');
        }

        const { data, error } = await this.supabase
            .from('escrow_holds')
            .insert({
                ...holdData,
                held_at: new Date().toISOString(),
                status: 'active',
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create escrow hold: ${error.message}`);
        }

        return data;
    }

    /**
     * Update an escrow hold with role-based access
     */
    async update(
        id: string,
        clerkUserId: string,
        updates: EscrowHoldUpdate
    ): Promise<EscrowHold> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Only platform admins can update holds
        if (!context.isPlatformAdmin) {
            throw new Error('Only platform administrators can update escrow holds');
        }

        const { data, error } = await this.supabase
            .from('escrow_holds')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update escrow hold: ${error.message}`);
        }

        return data;
    }

    /**
     * Delete an escrow hold (admin only - soft delete by marking as cancelled)
     */
    async delete(id: string, clerkUserId: string): Promise<void> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Only platform admins can delete holds
        if (!context.isPlatformAdmin) {
            throw new Error('Only platform administrators can delete escrow holds');
        }

        const { error } = await this.supabase
            .from('escrow_holds')
            .update({
                status: 'cancelled',
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to delete escrow hold: ${error.message}`);
        }
    }

    /**
     * Find holds due for release (automation use)
     * No role filtering - system use only
     */
    async findDueReleases(beforeDate: Date): Promise<EscrowHold[]> {
        const { data, error } = await this.supabase
            .from('escrow_holds')
            .select('*')
            .eq('status', 'active')
            .lte('release_scheduled_date', beforeDate.toISOString())
            .order('release_scheduled_date', { ascending: true });

        if (error) {
            throw new Error(`Failed to find due releases: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Find holds by placement ID
     */
    async findByPlacementId(placementId: string): Promise<EscrowHold[]> {
        const { data, error } = await this.supabase
            .from('escrow_holds')
            .select('*')
            .eq('placement_id', placementId)
            .order('held_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to find holds by placement: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Find active holds by placement ID
     */
    async findActiveByPlacementId(placementId: string): Promise<EscrowHold[]> {
        const { data, error } = await this.supabase
            .from('escrow_holds')
            .select('*')
            .eq('placement_id', placementId)
            .eq('status', 'active')
            .order('held_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to find active holds: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Release an escrow hold
     */
    async release(id: string, releasedBy: string): Promise<EscrowHold> {
        const { data, error } = await this.supabase
            .from('escrow_holds')
            .update({
                status: 'released',
                released_at: new Date().toISOString(),
                released_by: releasedBy,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to release escrow hold: ${error.message}`);
        }

        return data;
    }

    /**
     * Cancel an escrow hold
     */
    async cancel(id: string): Promise<EscrowHold> {
        const { data, error } = await this.supabase
            .from('escrow_holds')
            .update({
                status: 'cancelled',
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to cancel escrow hold: ${error.message}`);
        }

        return data;
    }

    /**
     * Get total active hold amount for a placement
     */
    async getTotalActiveHolds(placementId: string): Promise<number> {
        const { data, error } = await this.supabase
            .from('escrow_holds')
            .select('hold_amount')
            .eq('placement_id', placementId)
            .eq('status', 'active');

        if (error) {
            throw new Error(`Failed to get total active holds: ${error.message}`);
        }

        return data?.reduce((sum, hold) => sum + hold.hold_amount, 0) || 0;
    }
}
