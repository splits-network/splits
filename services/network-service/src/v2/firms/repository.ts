/**
 * Firm Repository
 * Direct Supabase queries for firms, firm_members, and firm_invitations
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FirmFilters, FirmUpdate, FirmMemberFilters, CreateFirmInvitationRequest, RepositoryListResponse } from './types';
import { resolveAccessContext } from '../shared/access';
import { randomUUID } from 'crypto';

export class FirmRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' }
        });
    }

    async findFirms(
        clerkUserId: string,
        filters: FirmFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);

        let query = this.supabase
            .from('firms')
            .select('*', { count: 'exact' });

        // Role-based access filtering
        if (accessContext.recruiterId) {
            // Recruiters see only firms they are members of
            const { data: memberFirmIds } = await this.supabase
                .from('firm_members')
                .select('firm_id')
                .eq('recruiter_id', accessContext.recruiterId)
                .eq('status', 'active');

            const firmIds = (memberFirmIds || []).map(m => m.firm_id);
            if (firmIds.length === 0) {
                return { data: [], total: 0 };
            }
            query = query.in('id', firmIds);
        } else if (!accessContext.isPlatformAdmin) {
            // Company users see firms linked to their billing org
            const organizationIds = accessContext.organizationIds;
            if (organizationIds.length === 0) {
                return { data: [], total: 0 };
            }
            query = query.in('billing_organization_id', organizationIds);
        }
        // Platform admins see all firms

        // Apply filters
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.search) {
            query = query.ilike('name', `%${filters.search}%`);
        }

        // Apply sorting
        const sortBy = filters.sort_by || 'created_at';
        const sortOrder = filters.sort_order?.toLowerCase() === 'asc' ? true : false;
        query = query.order(sortBy, { ascending: sortOrder });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;
        if (error) throw error;

        const firms = data || [];

        // Enrich with member stats
        if (firms.length > 0) {
            const firmIds = firms.map(t => t.id);

            const { data: memberCounts } = await this.supabase
                .from('firm_members')
                .select('firm_id, status')
                .in('firm_id', firmIds);

            const statsMap = new Map<string, { member_count: number; active_member_count: number }>();
            for (const m of memberCounts || []) {
                const existing = statsMap.get(m.firm_id) || { member_count: 0, active_member_count: 0 };
                existing.member_count++;
                if (m.status === 'active') existing.active_member_count++;
                statsMap.set(m.firm_id, existing);
            }

            for (const firm of firms) {
                const stats = statsMap.get(firm.id) || { member_count: 0, active_member_count: 0 };
                firm.member_count = stats.member_count;
                firm.active_member_count = stats.active_member_count;
            }
        }
        console.log(`[FirmRepository] findFirms — filters:`, filters, `result count: ${firms.length}, total: ${count}`);
        return {
            data: firms,
            total: count || 0,
        };
    }

    async findFirm(id: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .from('firms')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        // Enrich with member stats
        if (data) {
            const { data: members } = await this.supabase
                .from('firm_members')
                .select('status')
                .eq('firm_id', id);

            data.member_count = (members || []).length;
            data.active_member_count = (members || []).filter(m => m.status === 'active').length;
        }

        return data;
    }

    async createFirm(
        firmData: { name: string },
        clerkUserId: string
    ): Promise<any> {
        // Resolve the internal user UUID and recruiter ID from the Clerk user ID
        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);
        const internalUserId = accessContext.identityUserId;

        if (!internalUserId) {
            throw { statusCode: 400, message: 'User not found — cannot create firm' };
        }

        const now = new Date().toISOString();

        // Insert the firm using the internal UUID as owner_user_id (FK → users.id)
        const { data: firm, error: firmError } = await this.supabase
            .from('firms')
            .insert({
                name: firmData.name,
                owner_user_id: internalUserId,
                status: 'active',
                created_at: now,
                updated_at: now,
            })
            .select()
            .single();

        if (firmError) throw firmError;

        // Auto-add creator as owner member (if they are a recruiter)
        const recruiterId = accessContext.recruiterId;
        if (recruiterId) {
            await this.supabase
                .from('firm_members')
                .insert({
                    firm_id: firm.id,
                    recruiter_id: recruiterId,
                    role: 'owner',
                    status: 'active',
                    joined_at: now,
                });
        }

        firm.member_count = recruiterId ? 1 : 0;
        firm.active_member_count = recruiterId ? 1 : 0;

        return firm;
    }

    async updateFirm(id: string, updates: FirmUpdate): Promise<any> {
        const { data, error } = await this.supabase
            .from('firms')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteFirm(id: string): Promise<void> {
        // Soft delete via status change
        const { error } = await this.supabase
            .from('firms')
            .update({ status: 'suspended', updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }

    async findFirmMembers(
        firmId: string,
        filters: FirmMemberFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 50;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('firm_members')
            .select(`
                *,
                recruiter:recruiters!inner(
                    id,
                    user_id,
                    status,
                    user:users!recruiters_user_id_fkey(
                        id,
                        name,
                        email
                    )
                )
            `, { count: 'exact' })
            .eq('firm_id', firmId);

        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.role) {
            query = query.eq('role', filters.role);
        }

        query = query.order('joined_at', { ascending: false });
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;
        if (error) throw error;

        return {
            data: data || [],
            total: count || 0,
        };
    }

    async removeFirmMember(firmId: string, memberId: string): Promise<void> {
        const { error } = await this.supabase
            .from('firm_members')
            .update({ status: 'removed' })
            .eq('id', memberId)
            .eq('firm_id', firmId);

        if (error) throw error;
    }

    async findFirmMember(memberId: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .from('firm_members')
            .select('*')
            .eq('id', memberId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async createFirmInvitation(
        firmId: string,
        invitation: CreateFirmInvitationRequest,
        clerkUserId: string
    ): Promise<any> {
        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const { data, error } = await this.supabase
            .from('firm_invitations')
            .insert({
                firm_id: firmId,
                email: invitation.email,
                role: invitation.role,
                invited_by: accessContext.identityUserId,
                token: randomUUID(),
                status: 'pending',
                expires_at: expiresAt.toISOString(),
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
