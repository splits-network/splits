import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContext, resolveAccessContext } from '@splits-network/shared-access-context';
import { CandidateSourcer, CandidateSourcerCreate, CandidateSourcerFilters, CandidateSourcerUpdate } from './types';
import { StandardListParams, StandardListResponse } from '@splits-network/shared-types';

export class CandidateSourcerRepository {
    constructor(private supabase: SupabaseClient) { }

    async list(
        clerkUserId: string,
        params: StandardListParams & CandidateSourcerFilters
    ): Promise<StandardListResponse<CandidateSourcer>> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);
        const { page = 1, limit = 25, search, filters = {}, sort_by = 'sourced_at', sort_order = 'desc' } = params;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .schema('ats')
            .from('candidate_sourcers')
            .select('*', { count: 'exact' });

        // Role-based filtering
        if (context.recruiterId) {
            // Recruiters see only candidates they sourced
            query = query.eq('sourcer_user_id', context.identityUserId);
        } else if (context.organizationIds.length > 0) {
            // Company users see sourcers for their organization's candidates
            // Need to join with candidates to filter by company
            const { data: companyCandidates } = await this.supabase
                .schema('ats')
                .from('candidates')
                .select('id')
                .in('company_id', context.organizationIds);

            if (companyCandidates && companyCandidates.length > 0) {
                query = query.in('candidate_id', companyCandidates.map(c => c.id));
            } else {
                // No accessible candidates, return empty
                return { data: [], pagination: { total: 0, page, limit, total_pages: 0 } };
            }
        }
        // Platform admins see everything (no filter)

        // Apply filters
        if (filters.candidate_id) {
            query = query.eq('candidate_id', filters.candidate_id);
        }
        if (filters.sourcer_user_id) {
            query = query.eq('sourcer_user_id', filters.sourcer_user_id);
        }
        if (filters.sourcer_type) {
            query = query.eq('sourcer_type', filters.sourcer_type);
        }
        if (filters.active_protection) {
            query = query.gt('protection_expires_at', new Date().toISOString());
        }

        // Apply search
        if (search) {
            query = query.ilike('notes', `%${search}%`);
        }

        // Apply sorting
        query = query.order(sort_by, { ascending: sort_order === 'asc' });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            throw new Error(`Failed to list candidate sourcers: ${error.message}`);
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

    async findById(id: string, clerkUserId: string): Promise<CandidateSourcer | null> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        let query = this.supabase
            .schema('ats')
            .from('candidate_sourcers')
            .select('*')
            .eq('id', id)
            .single();

        const { data, error } = await query;

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Failed to find candidate sourcer: ${error.message}`);
        }

        // Apply role-based access check
        if (context.recruiterId && data.sourcer_user_id !== context.identityUserId) {
            return null; // Recruiter can only see their own sourcing
        } else if (context.organizationIds.length > 0 && !context.isPlatformAdmin) {
            // Check if candidate belongs to accessible company
            const { data: candidate } = await this.supabase
                .schema('ats')
                .from('candidates')
                .select('company_id')
                .eq('id', data.candidate_id)
                .single();

            if (!candidate || !context.organizationIds.includes(candidate.company_id)) {
                return null;
            }
        }

        return data;
    }

    async findByCandidate(candidate_id: string): Promise<CandidateSourcer | null> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('candidate_sourcers')
            .select('*')
            .eq('candidate_id', candidate_id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Failed to find candidate sourcer: ${error.message}`);
        }

        return data;
    }

    async create(sourcerData: CandidateSourcerCreate): Promise<CandidateSourcer> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('candidate_sourcers')
            .insert({
                candidate_id: sourcerData.candidate_id,
                sourcer_user_id: sourcerData.sourcer_user_id,
                sourcer_type: sourcerData.sourcer_type,
                sourced_at: sourcerData.sourced_at || new Date().toISOString(),
                protection_window_days: sourcerData.protection_window_days || 365,
                protection_expires_at: sourcerData.protection_expires_at.toISOString(),
                notes: sourcerData.notes,
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create candidate sourcer: ${error.message}`);
        }

        return data;
    }

    async update(id: string, clerkUserId: string, updates: CandidateSourcerUpdate): Promise<CandidateSourcer> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Build update query with role-based filtering
        let query = this.supabase
            .schema('ats')
            .from('candidate_sourcers')
            .update({
                notes: updates.notes,
                protection_window_days: updates.protection_window_days,
                protection_expires_at: updates.protection_expires_at?.toISOString(),
            })
            .eq('id', id);

        // Apply role-based access control
        if (context.recruiterId) {
            query = query.eq('sourcer_user_id', context.identityUserId);
        } else if (context.organizationIds.length > 0 && !context.isPlatformAdmin) {
            // Need to verify candidate belongs to accessible company
            const existing = await this.findById(id, clerkUserId);
            if (!existing) {
                throw new Error('Candidate sourcer not found or access denied');
            }
        }

        const { data, error } = await query.select().single();

        if (error) {
            throw new Error(`Failed to update candidate sourcer: ${error.message}`);
        }

        return data;
    }

    async delete(id: string, clerkUserId: string): Promise<void> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Only platform admins can delete sourcer records
        if (!context.isPlatformAdmin) {
            throw new Error('Only platform administrators can delete sourcer records');
        }

        const { error } = await this.supabase
            .schema('ats')
            .from('candidate_sourcers')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to delete candidate sourcer: ${error.message}`);
        }
    }

    async checkProtectionStatus(candidate_id: string): Promise<{
        has_protection: boolean;
        sourcer_user_id?: string;
        protection_expires_at?: Date;
    }> {
        const sourcer = await this.findByCandidate(candidate_id);

        if (!sourcer || !sourcer.protection_expires_at) {
            return { has_protection: false };
        }

        const now = new Date();
        const expiresAt = new Date(sourcer.protection_expires_at);
        const hasActiveProtection = expiresAt > now;

        return {
            has_protection: hasActiveProtection,
            sourcer_user_id: sourcer.sourcer_user_id ?? undefined,
            protection_expires_at: expiresAt,
        };
    }
}
