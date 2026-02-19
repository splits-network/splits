/**
 * Team Repository
 * Direct Supabase queries for teams, team_members, and team_invitations
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TeamFilters, TeamUpdate, TeamMemberFilters, CreateTeamInvitationRequest, RepositoryListResponse } from './types';
import { resolveAccessContext } from '../shared/access';
import { randomUUID } from 'crypto';

export class TeamRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' }
        });
    }

    async findTeams(
        clerkUserId: string,
        filters: TeamFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);

        let query = this.supabase
            .from('teams')
            .select('*', { count: 'exact' });

        // Role-based access filtering
        if (accessContext.recruiterId) {
            // Recruiters see only teams they are members of
            const { data: memberTeamIds } = await this.supabase
                .from('team_members')
                .select('team_id')
                .eq('recruiter_id', accessContext.recruiterId)
                .eq('status', 'active');

            const teamIds = (memberTeamIds || []).map(m => m.team_id);
            if (teamIds.length === 0) {
                return { data: [], total: 0 };
            }
            query = query.in('id', teamIds);
        } else if (!accessContext.isPlatformAdmin) {
            // Company users see teams linked to their billing org
            const organizationIds = accessContext.organizationIds;
            if (organizationIds.length === 0) {
                return { data: [], total: 0 };
            }
            query = query.in('billing_organization_id', organizationIds);
        }
        // Platform admins see all teams

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

        const teams = data || [];

        // Enrich with member stats
        if (teams.length > 0) {
            const teamIds = teams.map(t => t.id);

            const { data: memberCounts } = await this.supabase
                .from('team_members')
                .select('team_id, status')
                .in('team_id', teamIds);

            const statsMap = new Map<string, { member_count: number; active_member_count: number }>();
            for (const m of memberCounts || []) {
                const existing = statsMap.get(m.team_id) || { member_count: 0, active_member_count: 0 };
                existing.member_count++;
                if (m.status === 'active') existing.active_member_count++;
                statsMap.set(m.team_id, existing);
            }

            for (const team of teams) {
                const stats = statsMap.get(team.id) || { member_count: 0, active_member_count: 0 };
                team.member_count = stats.member_count;
                team.active_member_count = stats.active_member_count;
            }
        }
        console.log(`[TeamRepository] findTeams — filters:`, filters, `result count: ${teams.length}, total: ${count}`);
        return {
            data: teams,
            total: count || 0,
        };
    }

    async findTeam(id: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .from('teams')
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
                .from('team_members')
                .select('status')
                .eq('team_id', id);

            data.member_count = (members || []).length;
            data.active_member_count = (members || []).filter(m => m.status === 'active').length;
        }

        return data;
    }

    async createTeam(
        teamData: { name: string },
        clerkUserId: string
    ): Promise<any> {
        // Resolve the internal user UUID and recruiter ID from the Clerk user ID
        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);
        const internalUserId = accessContext.identityUserId;

        if (!internalUserId) {
            throw { statusCode: 400, message: 'User not found — cannot create team' };
        }

        const now = new Date().toISOString();

        // Insert the team using the internal UUID as owner_user_id (FK → users.id)
        const { data: team, error: teamError } = await this.supabase
            .from('teams')
            .insert({
                name: teamData.name,
                owner_user_id: internalUserId,
                status: 'active',
                created_at: now,
                updated_at: now,
            })
            .select()
            .single();

        if (teamError) throw teamError;

        // Auto-add creator as owner member (if they are a recruiter)
        const recruiterId = accessContext.recruiterId;
        if (recruiterId) {
            await this.supabase
                .from('team_members')
                .insert({
                    team_id: team.id,
                    recruiter_id: recruiterId,
                    role: 'owner',
                    status: 'active',
                    joined_at: now,
                });
        }

        team.member_count = recruiterId ? 1 : 0;
        team.active_member_count = recruiterId ? 1 : 0;

        return team;
    }

    async updateTeam(id: string, updates: TeamUpdate): Promise<any> {
        const { data, error } = await this.supabase
            .from('teams')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteTeam(id: string): Promise<void> {
        // Soft delete via status change
        const { error } = await this.supabase
            .from('teams')
            .update({ status: 'suspended', updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }

    async findTeamMembers(
        teamId: string,
        filters: TeamMemberFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 50;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('team_members')
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
            .eq('team_id', teamId);

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

    async removeTeamMember(teamId: string, memberId: string): Promise<void> {
        const { error } = await this.supabase
            .from('team_members')
            .update({ status: 'removed' })
            .eq('id', memberId)
            .eq('team_id', teamId);

        if (error) throw error;
    }

    async findTeamMember(memberId: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .from('team_members')
            .select('*')
            .eq('id', memberId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async createTeamInvitation(
        teamId: string,
        invitation: CreateTeamInvitationRequest,
        clerkUserId: string
    ): Promise<any> {
        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const { data, error } = await this.supabase
            .from('team_invitations')
            .insert({
                team_id: teamId,
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
