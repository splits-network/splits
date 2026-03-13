/**
 * Firm Detail View Repository
 * GET /api/v3/firms/:id/view/detail
 *
 * Returns firm with members (recruiter + user details), invitations, and placement stats.
 * This is the enriched read — core findById returns flat data only.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class FirmDetailViewRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<any | null> {
    const { data: firm, error } = await this.supabase
      .from('firms')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!firm) return null;

    const [membersResult, invitationsResult, statsResult] = await Promise.all([
      this.findMembers(id),
      this.findInvitations(id),
      this.findPlacementStats(id),
    ]);

    return {
      ...firm,
      member_count: membersResult.length,
      active_member_count: membersResult.filter((m: any) => m.status === 'active').length,
      members: membersResult,
      invitations: invitationsResult,
      placement_stats: statsResult,
    };
  }

  private async findMembers(firmId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('firm_members')
      .select(`
        id, role, status, joined_at,
        recruiter:recruiters!inner(
          id, user_id, status,
          user:users!recruiters_user_id_fkey(id, name, email)
        )
      `)
      .eq('firm_id', firmId)
      .order('joined_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  private async findInvitations(firmId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('firm_invitations')
      .select('id, email, role, status, token, invited_by, expires_at, created_at')
      .eq('firm_id', firmId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  private async findPlacementStats(firmId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('firm_placement_stats')
      .select('*')
      .eq('firm_id', firmId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }
}
