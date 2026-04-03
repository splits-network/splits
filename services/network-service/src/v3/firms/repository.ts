/**
 * Firms V3 Repository — Pure Data Layer
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { FirmListParams, FirmUpdate, FirmMemberListParams, PUBLIC_FIRM_SELECT } from './types.js';

interface ScopeFilters {
  firm_ids?: string[];
  billing_organization_ids?: string[];
}

export class FirmRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: FirmListParams, scopeFilters?: ScopeFilters): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase.from('firms').select('*', { count: 'exact' });

    if (scopeFilters?.firm_ids) query = query.in('id', scopeFilters.firm_ids);
    if (scopeFilters?.billing_organization_ids) query = query.in('billing_organization_id', scopeFilters.billing_organization_ids);
    if (params.status) query = query.eq('status', params.status);
    if (params.search) query = query.ilike('name', `%${params.search}%`);

    query = query.order(params.sort_by || 'created_at', { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('firms').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async findBySlug(slug: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('firms').select('*').eq('slug', slug).maybeSingle();
    if (error) throw error;
    return data;
  }

  async isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
    let query = this.supabase.from('firms').select('id').eq('slug', slug);
    if (excludeId) query = query.neq('id', excludeId);
    const { data } = await query.maybeSingle();
    return !!data;
  }

  async create(firmData: { name: string }, ownerUserId: string, recruiterId?: string): Promise<any> {
    const now = new Date().toISOString();
    const { data: firm, error } = await this.supabase.from('firms').insert({
      name: firmData.name, owner_user_id: ownerUserId, status: 'active', created_at: now, updated_at: now,
    }).select().single();
    if (error) throw error;

    if (recruiterId) {
      await this.supabase.from('firm_members').insert({
        firm_id: firm.id, recruiter_id: recruiterId, role: 'owner', status: 'active', joined_at: now,
      });
      firm.member_count = 1;
      firm.active_member_count = 1;
    } else {
      firm.member_count = 0;
      firm.active_member_count = 0;
    }
    return firm;
  }

  async update(id: string, updates: FirmUpdate): Promise<any> {
    const { data, error } = await this.supabase.from('firms')
      .update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('firms')
      .update({ status: 'suspended', updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  }

  // --- Members ---

  async findMembers(firmId: string, params: FirmMemberListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 50, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase.from('firm_members').select('*', { count: 'exact' }).eq('firm_id', firmId);

    if (params.status) query = query.eq('status', params.status);
    if (params.role) query = query.eq('role', params.role);
    query = query.order('joined_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findMember(memberId: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('firm_members').select('*').eq('id', memberId).maybeSingle();
    if (error) throw error;
    return data;
  }

  async findMemberByRecruiterId(firmId: string, recruiterId: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('firm_members').select('*')
      .eq('firm_id', firmId).eq('recruiter_id', recruiterId).eq('status', 'active').maybeSingle();
    if (error) throw error;
    return data;
  }

  async findOwnerMember(firmId: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('firm_members').select('*')
      .eq('firm_id', firmId).eq('role', 'owner').eq('status', 'active').maybeSingle();
    if (error) throw error;
    return data;
  }

  async removeMember(firmId: string, memberId: string): Promise<void> {
    const { error } = await this.supabase.from('firm_members').update({ status: 'removed' }).eq('id', memberId).eq('firm_id', firmId);
    if (error) throw error;
  }

  async transferOwnership(firmId: string, newOwnerUserId: string, newOwnerMemberId: string, oldOwnerMemberId: string): Promise<any> {
    const now = new Date().toISOString();
    const { data: firm, error } = await this.supabase.from('firms')
      .update({ owner_user_id: newOwnerUserId, updated_at: now }).eq('id', firmId).select().single();
    if (error) throw error;
    await this.supabase.from('firm_members').update({ role: 'admin' }).eq('id', oldOwnerMemberId);
    await this.supabase.from('firm_members').update({ role: 'owner' }).eq('id', newOwnerMemberId);
    return firm;
  }

  // --- Invitations ---

  async listInvitations(firmId: string): Promise<any[]> {
    const { data, error } = await this.supabase.from('firm_invitations')
      .select('id, email, role, status, token, invited_by, expires_at, created_at')
      .eq('firm_id', firmId).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createInvitation(firmId: string, email: string, role: string, invitedBy: string): Promise<any> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const { data, error } = await this.supabase.from('firm_invitations').insert({
      firm_id: firmId, email, role, invited_by: invitedBy,
      token: randomUUID(), status: 'pending', expires_at: expiresAt.toISOString(), created_at: new Date().toISOString(),
    }).select().single();
    if (error) throw error;
    return data;
  }

  async cancelInvitation(firmId: string, invitationId: string): Promise<void> {
    const { error } = await this.supabase.from('firm_invitations')
      .update({ status: 'revoked' }).eq('id', invitationId).eq('firm_id', firmId).eq('status', 'pending');
    if (error) throw error;
  }

  async resendInvitation(firmId: string, invitationId: string): Promise<any> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const { data, error } = await this.supabase.from('firm_invitations')
      .update({ token: randomUUID(), expires_at: expiresAt.toISOString() })
      .eq('id', invitationId).eq('firm_id', firmId).eq('status', 'pending').select().single();
    if (error) throw error;
    return data;
  }

  async findInvitationByToken(token: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('firm_invitations')
      .select('id, firm_id, email, role, status, token, expires_at, created_at, firm:firms!inner(id, name, slug)')
      .eq('token', token).maybeSingle();
    if (error) throw error;
    return data;
  }

  async acceptInvitation(invitationId: string): Promise<void> {
    const { error } = await this.supabase.from('firm_invitations')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', invitationId);
    if (error) throw error;
  }

  async createMemberFromInvitation(firmId: string, recruiterId: string, role: string): Promise<any> {
    const { data, error } = await this.supabase.from('firm_members').insert({
      firm_id: firmId, recruiter_id: recruiterId, role, status: 'active', joined_at: new Date().toISOString(),
    }).select().single();
    if (error) throw error;
    return data;
  }

  // --- Helpers ---

  async getRecruiterByUserId(userId: string): Promise<{ id: string; user_id: string } | null> {
    const { data, error } = await this.supabase.from('recruiters').select('id, user_id').eq('user_id', userId).maybeSingle();
    if (error) throw error;
    return data;
  }

  async getRecruiterUserId(recruiterId: string): Promise<string | null> {
    const { data } = await this.supabase.from('recruiters').select('user_id').eq('id', recruiterId).single();
    return data?.user_id || null;
  }

  async findFirmByRecruiterId(recruiterId: string): Promise<any | null> {
    const { data: membership } = await this.supabase.from('firm_members').select('firm_id')
      .eq('recruiter_id', recruiterId).eq('status', 'active').limit(1).maybeSingle();
    if (!membership) return null;
    return this.findById(membership.firm_id);
  }

  async findFirmsByRecruiterId(recruiterId: string): Promise<any[]> {
    const { data: memberships } = await this.supabase.from('firm_members').select('firm_id')
      .eq('recruiter_id', recruiterId).eq('status', 'active');
    if (!memberships || memberships.length === 0) return [];
    const firms = await Promise.all(memberships.map(m => this.findById(m.firm_id)));
    return firms.filter(Boolean);
  }

  // --- Public ---

  async findPublicFirms(params: FirmListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 24, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase.from('firms').select(PUBLIC_FIRM_SELECT, { count: 'exact' })
      .eq('marketplace_visible', true).not('marketplace_approved_at', 'is', null).eq('status', 'active');

    if (params.search) query = query.or(`name.ilike.%${params.search}%,tagline.ilike.%${params.search}%`);
    if (params.industries?.length) query = query.overlaps('industries', params.industries);
    if (params.specialties?.length) query = query.overlaps('specialties', params.specialties);
    if (params.placement_types?.length) query = query.overlaps('placement_types', params.placement_types);
    if (params.geo_focus?.length) query = query.overlaps('geo_focus', params.geo_focus);
    if (params.candidate_firm !== undefined) query = query.eq('candidate_firm', params.candidate_firm);

    query = query.order(params.sort_by || 'name', { ascending: params.sort_order !== 'desc' });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    const firms = (data || []) as any[];
    if (firms.length > 0) {
      const firmIds = firms.map(f => f.id);
      const { data: memberCounts } = await this.supabase.from('firm_members').select('firm_id')
        .in('firm_id', firmIds).eq('status', 'active');
      const countMap = new Map<string, number>();
      for (const m of memberCounts || []) countMap.set(m.firm_id, (countMap.get(m.firm_id) || 0) + 1);
      for (const firm of firms) firm.active_member_count = firm.show_member_count ? (countMap.get(firm.id) || 0) : null;
    }
    return { data: firms, total: count || 0 };
  }

  async findPublicFirmBySlug(slug: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('firms').select(PUBLIC_FIRM_SELECT)
      .eq('slug', slug).eq('marketplace_visible', true).not('marketplace_approved_at', 'is', null).eq('status', 'active').maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const firm = data as any;
    if (firm.show_member_count) {
      const { count } = await this.supabase.from('firm_members').select('id', { count: 'exact', head: true })
        .eq('firm_id', firm.id).eq('status', 'active');
      firm.active_member_count = count || 0;
    }
    return firm;
  }

  async findPublicFirmMembers(firmId: string): Promise<any[]> {
    const { data, error } = await this.supabase.from('firm_members')
      .select('id, role, joined_at, recruiter:recruiters!inner(id, user:users!recruiters_user_id_fkey(name))')
      .eq('firm_id', firmId).eq('status', 'active').order('joined_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async getFirmPlacementStats(firmId: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('firm_placement_stats').select('*').eq('firm_id', firmId).maybeSingle();
    if (error) throw error;
    return data;
  }

  async getFirmRecentPlacements(firmId: string, limit = 5): Promise<any[]> {
    const { data, error } = await this.supabase.from('firm_recent_placements').select('*').eq('firm_id', firmId).limit(limit);
    if (error) throw error;
    return data || [];
  }

  async getFirmOwnerUserId(firmId: string): Promise<string | null> {
    const { data } = await this.supabase.from('firms').select('owner_user_id').eq('id', firmId).single();
    return data?.owner_user_id || null;
  }

}
