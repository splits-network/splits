/**
 * Firm Repository
 * Direct Supabase queries for firms, firm_members, and firm_invitations
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FirmFilters, FirmUpdate, FirmMemberFilters, CreateFirmInvitationRequest, PublicFirmFilters, PUBLIC_FIRM_SELECT, RepositoryListResponse } from './types';
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
        if (filters.marketplace_visible !== undefined) {
            query = query.eq('marketplace_visible', filters.marketplace_visible);
            // When filtering marketplace, only show approved firms
            if (filters.marketplace_visible) {
                query = query.not('marketplace_approved_at', 'is', null);
            }
        }
        if (filters.candidate_firm !== undefined) {
            query = query.eq('candidate_firm', filters.candidate_firm);
        }
        if (filters.industries && filters.industries.length > 0) {
            query = query.overlaps('industries', filters.industries);
        }
        if (filters.specialties && filters.specialties.length > 0) {
            query = query.overlaps('specialties', filters.specialties);
        }
        if (filters.placement_types && filters.placement_types.length > 0) {
            query = query.overlaps('placement_types', filters.placement_types);
        }
        if (filters.geo_focus && filters.geo_focus.length > 0) {
            query = query.overlaps('geo_focus', filters.geo_focus);
        }

        // Single-value filters (from frontend query params)
        if (filters.team_size_range) {
            query = query.eq('team_size_range', filters.team_size_range);
        }
        if (filters.is_candidate_firm === 'yes') {
            query = query.eq('candidate_firm', true);
        } else if (filters.is_candidate_firm === 'no') {
            query = query.eq('candidate_firm', false);
        }
        if (filters.is_company_firm === 'yes') {
            query = query.eq('company_firm', true);
        } else if (filters.is_company_firm === 'no') {
            query = query.eq('company_firm', false);
        }
        if (filters.is_marketplace_visible === 'yes') {
            query = query.eq('marketplace_visible', true).not('marketplace_approved_at', 'is', null);
        } else if (filters.is_marketplace_visible === 'no') {
            query = query.or('marketplace_visible.eq.false,marketplace_approved_at.is.null');
        }
        if (filters.placement_type) {
            query = query.contains('placement_types', [filters.placement_type]);
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

    async resolveInternalUserId(clerkUserId: string): Promise<string> {
        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);
        if (!accessContext.identityUserId) {
            throw { statusCode: 400, message: 'User not found' };
        }
        return accessContext.identityUserId;
    }

    async getRecruiterUserId(recruiterId: string): Promise<string | null> {
        const { data } = await this.supabase
            .from('recruiters')
            .select('user_id')
            .eq('id', recruiterId)
            .single();

        return data?.user_id || null;
    }

    async findOwnerMember(firmId: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .from('firm_members')
            .select('*')
            .eq('firm_id', firmId)
            .eq('role', 'owner')
            .eq('status', 'active')
            .maybeSingle();

        if (error) throw error;
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

    async listFirmInvitations(firmId: string): Promise<any[]> {
        const { data, error } = await this.supabase
            .from('firm_invitations')
            .select('id, email, role, status, token, invited_by, expires_at, created_at')
            .eq('firm_id', firmId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async cancelFirmInvitation(firmId: string, invitationId: string): Promise<void> {
        const { error } = await this.supabase
            .from('firm_invitations')
            .update({ status: 'revoked' })
            .eq('id', invitationId)
            .eq('firm_id', firmId)
            .eq('status', 'pending');

        if (error) throw error;
    }

    async resendFirmInvitation(firmId: string, invitationId: string): Promise<any> {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const { data, error } = await this.supabase
            .from('firm_invitations')
            .update({
                token: randomUUID(),
                expires_at: expiresAt.toISOString(),
            })
            .eq('id', invitationId)
            .eq('firm_id', firmId)
            .eq('status', 'pending')
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async findFirmInvitationByToken(token: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .from('firm_invitations')
            .select(`
                id, firm_id, email, role, status, token, expires_at, created_at,
                firm:firms!inner(id, name, slug)
            `)
            .eq('token', token)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async acceptFirmInvitation(invitationId: string): Promise<void> {
        const { error } = await this.supabase
            .from('firm_invitations')
            .update({
                status: 'accepted',
                accepted_at: new Date().toISOString(),
            })
            .eq('id', invitationId);

        if (error) throw error;
    }

    async createFirmMemberFromInvitation(
        firmId: string,
        recruiterId: string,
        role: string
    ): Promise<any> {
        const { data, error } = await this.supabase
            .from('firm_members')
            .insert({
                firm_id: firmId,
                recruiter_id: recruiterId,
                role,
                status: 'active',
                joined_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getRecruiterByUserId(userId: string): Promise<{ id: string; user_id: string } | null> {
        const { data, error } = await this.supabase
            .from('recruiters')
            .select('id, user_id')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async findFirmMemberByRecruiterId(
        firmId: string,
        recruiterId: string
    ): Promise<any | null> {
        const { data, error } = await this.supabase
            .from('firm_members')
            .select('*')
            .eq('firm_id', firmId)
            .eq('recruiter_id', recruiterId)
            .eq('status', 'active')
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async findFirmBySlug(slug: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .from('firms')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async isSlugTaken(slug: string, excludeFirmId?: string): Promise<boolean> {
        let query = this.supabase
            .from('firms')
            .select('id')
            .eq('slug', slug);

        if (excludeFirmId) {
            query = query.neq('id', excludeFirmId);
        }

        const { data } = await query.maybeSingle();
        return !!data;
    }

    async findFirmByRecruiterId(recruiterId: string): Promise<any | null> {
        const { data: membership, error: memberError } = await this.supabase
            .from('firm_members')
            .select('firm_id')
            .eq('recruiter_id', recruiterId)
            .eq('status', 'active')
            .limit(1)
            .maybeSingle();

        if (memberError) throw memberError;
        if (!membership) return null;

        return this.findFirm(membership.firm_id);
    }

    async findFirmsByRecruiterId(recruiterId: string): Promise<any[]> {
        const { data: memberships, error: memberError } = await this.supabase
            .from('firm_members')
            .select('firm_id')
            .eq('recruiter_id', recruiterId)
            .eq('status', 'active');

        if (memberError) throw memberError;
        if (!memberships || memberships.length === 0) return [];

        const firms = await Promise.all(
            memberships.map((m) => this.findFirm(m.firm_id))
        );
        return firms.filter(Boolean);
    }

    async transferOwnership(
        firmId: string,
        newOwnerUserId: string,
        newOwnerMemberId: string,
        oldOwnerMemberId: string
    ): Promise<any> {
        const now = new Date().toISOString();

        // Update firm owner
        const { data: firm, error: firmError } = await this.supabase
            .from('firms')
            .update({ owner_user_id: newOwnerUserId, updated_at: now })
            .eq('id', firmId)
            .select()
            .single();

        if (firmError) throw firmError;

        // Demote old owner to admin
        await this.supabase
            .from('firm_members')
            .update({ role: 'admin' })
            .eq('id', oldOwnerMemberId);

        // Promote new owner
        await this.supabase
            .from('firm_members')
            .update({ role: 'owner' })
            .eq('id', newOwnerMemberId);

        return firm;
    }

    // ── Public (unauthenticated) queries ──

    async findPublicFirms(filters: PublicFirmFilters = {}): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 24;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('firms')
            .select(PUBLIC_FIRM_SELECT, { count: 'exact' })
            .eq('marketplace_visible', true)
            .not('marketplace_approved_at', 'is', null)
            .eq('status', 'active');

        if (filters.search) {
            query = query.or(`name.ilike.%${filters.search}%,tagline.ilike.%${filters.search}%`);
        }
        if (filters.industries?.length) {
            query = query.overlaps('industries', filters.industries);
        }
        if (filters.specialties?.length) {
            query = query.overlaps('specialties', filters.specialties);
        }
        if (filters.placement_types?.length) {
            query = query.overlaps('placement_types', filters.placement_types);
        }
        if (filters.geo_focus?.length) {
            query = query.overlaps('geo_focus', filters.geo_focus);
        }
        if (filters.candidate_firm !== undefined) {
            query = query.eq('candidate_firm', filters.candidate_firm);
        }

        const sortBy = filters.sort_by || 'name';
        const ascending = filters.sort_order?.toLowerCase() !== 'desc';
        query = query.order(sortBy, { ascending });
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;
        if (error) throw error;

        const firms = (data || []) as any[];

        // Enrich with member counts (only where show_member_count is true)
        if (firms.length > 0) {
            const firmIds = firms.map(f => f.id);
            const { data: memberCounts } = await this.supabase
                .from('firm_members')
                .select('firm_id')
                .in('firm_id', firmIds)
                .eq('status', 'active');

            const countMap = new Map<string, number>();
            for (const m of memberCounts || []) {
                countMap.set(m.firm_id, (countMap.get(m.firm_id) || 0) + 1);
            }
            for (const firm of firms) {
                firm.active_member_count = firm.show_member_count ? (countMap.get(firm.id) || 0) : null;
            }
        }

        return { data: firms, total: count || 0 };
    }

    async findPublicFirmBySlug(slug: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .from('firms')
            .select(PUBLIC_FIRM_SELECT)
            .eq('slug', slug)
            .eq('marketplace_visible', true)
            .not('marketplace_approved_at', 'is', null)
            .eq('status', 'active')
            .maybeSingle();

        if (error) throw error;
        if (!data) return null;

        const firm = data as any;

        // Enrich with member count if allowed
        if (firm.show_member_count) {
            const { count } = await this.supabase
                .from('firm_members')
                .select('id', { count: 'exact', head: true })
                .eq('firm_id', firm.id)
                .eq('status', 'active');
            firm.active_member_count = count || 0;
        }

        return firm;
    }

    async getFirmOwnerUserId(firmId: string): Promise<string | null> {
        const { data, error } = await this.supabase
            .from('firms')
            .select('owner_user_id')
            .eq('id', firmId)
            .single();

        if (error || !data) return null;
        return data.owner_user_id;
    }

    async getFirmPlacementStats(firmId: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .from('firm_placement_stats')
            .select('*')
            .eq('firm_id', firmId)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async getFirmRecentPlacements(firmId: string, limit = 5): Promise<any[]> {
        const { data, error } = await this.supabase
            .from('firm_recent_placements')
            .select('*')
            .eq('firm_id', firmId)
            .limit(limit);

        if (error) throw error;
        return data || [];
    }

    async findPublicFirmMembers(firmId: string): Promise<any[]> {
        const { data, error } = await this.supabase
            .from('firm_members')
            .select(`
                id, role, joined_at,
                recruiter:recruiters!inner(
                    id,
                    user:users!recruiters_user_id_fkey(name)
                )
            `)
            .eq('firm_id', firmId)
            .eq('status', 'active')
            .order('joined_at', { ascending: true });

        if (error) throw error;
        return data || [];
    }
}
