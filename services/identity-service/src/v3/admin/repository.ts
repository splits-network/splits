/**
 * Admin V3 Repository — Pure data layer
 *
 * Delegates to V2 AdminIdentityRepository for shared stat/chart logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AdminListParams } from './types.js';

export class AdminRepository {
  constructor(private supabase: SupabaseClient) {}

  async listUsers(params: AdminListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;
    const sortBy = params.sort_by || 'created_at';
    const ascending = params.sort_order === 'asc';

    let query = this.supabase.from('users').select('*', { count: 'exact' });

    if (params.search) {
      query = query.or(
        `email.ilike.%${params.search}%,first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%`
      );
    }

    query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async getUser(id: string): Promise<any | null> {
    const { data: user, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!user) return null;

    // Fetch related data in parallel
    const [roles, recruiter, candidate] = await Promise.all([
      this.supabase.from('user_roles')
        .select('id, role_name, organization_id, company_id, role_entity_type, created_at')
        .eq('user_id', id).is('deleted_at', null),
      this.supabase.from('recruiters')
        .select('id, status, tagline, location, years_experience, marketplace_enabled, stripe_connect_onboarded, created_at')
        .eq('user_id', id).maybeSingle(),
      this.supabase.from('candidates')
        .select('id, first_name, last_name, email, phone, location, resume_status, created_at')
        .eq('user_id', id).maybeSingle(),
    ]);

    return {
      ...user,
      roles: roles.data ?? [],
      recruiter: recruiter.data ?? null,
      candidate: candidate.data ?? null,
    };
  }

  async addUserRole(userId: string, roleName: string): Promise<any> {
    const { data, error } = await this.supabase.from('user_roles')
      .insert({ user_id: userId, role_name: roleName })
      .select().single();
    if (error) throw error;
    return data;
  }

  async removeUserRole(roleId: string): Promise<void> {
    const { error } = await this.supabase.from('user_roles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', roleId);
    if (error) throw error;
  }

  async listOrganizations(params: AdminListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;
    const sortBy = params.sort_by || 'created_at';
    const ascending = params.sort_order === 'asc';

    let query = this.supabase.from('organizations').select('*', { count: 'exact' });

    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,slug.ilike.%${params.search}%`);
    }
    if (params.status) query = query.eq('status', params.status);

    query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async getCounts(): Promise<{ users: number; organizations: number }> {
    const [usersResult, orgsResult] = await Promise.all([
      this.supabase.from('users').select('id', { count: 'exact', head: true }),
      this.supabase.from('organizations').select('id', { count: 'exact', head: true }),
    ]);

    return {
      users: usersResult.count || 0,
      organizations: orgsResult.count || 0,
    };
  }

  async getActivity(params: { scope?: string; limit?: number }): Promise<any[]> {
    const limit = Math.min(50, Math.max(1, params.limit ?? 20));

    const { data: roleChanges } = await this.supabase
      .from('user_roles')
      .select('id, user_id, role_name, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    const { data: recentUsers } = await this.supabase
      .from('users')
      .select('id, email, first_name, last_name, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    const activities: any[] = [];

    for (const role of roleChanges || []) {
      activities.push({
        id: `role-${role.id}`,
        type: 'role_assigned',
        description: `Role "${role.role_name}" assigned`,
        entityId: role.user_id,
        createdAt: role.created_at,
      });
    }

    for (const user of recentUsers || []) {
      activities.push({
        id: `user-${user.id}`,
        type: 'user_created',
        description: `User ${user.first_name || ''} ${user.last_name || ''} (${user.email}) registered`.trim(),
        actor: user.email,
        entityId: user.id,
        createdAt: user.created_at,
      });
    }

    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return activities.slice(0, limit);
  }
}
