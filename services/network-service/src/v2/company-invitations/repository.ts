/**
 * Company Platform Invitations Repository - V2
 * Handles data access for recruiter-to-company platform invitations
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { StandardListParams, StandardListResponse } from '@splits-network/shared-types';
import {
    CompanyPlatformInvitation,
    CompanyInvitationFilters,
    CompanyInvitationUpdate
} from './types';

// Characters that won't be confused (no 0/O, 1/I/L)
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateInviteCode(): string {
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
    return `SPLITS-${code}`;
}

export class CompanyInvitationRepository {
    constructor(private supabase: SupabaseClient) { }

    async list(
        clerkUserId: string,
        params: StandardListParams & CompanyInvitationFilters
    ): Promise<StandardListResponse<CompanyPlatformInvitation>> {
        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);

        let query = this.supabase
            .from('recruiter_company_invitations')
            .select(`
                *,
                recruiter:recruiters!inner(
                    id,
                    user:users!inner(name, email)
                )
            `, { count: 'exact' });

        // Role-based filtering: recruiters see only their own invitations
        if (!accessContext.isPlatformAdmin) {
            if (accessContext.recruiterId) {
                query = query.eq('recruiter_id', accessContext.recruiterId);
            } else {
                // Non-recruiters can't see invitations
                return {
                    data: [],
                    pagination: { total: 0, page: 1, limit: params.limit || 25, total_pages: 0 }
                };
            }
        }

        // Apply filters
        if (params.recruiter_id) {
            query = query.eq('recruiter_id', params.recruiter_id);
        }
        if (params.status) {
            query = query.eq('status', params.status);
        }
        if (params.invited_email) {
            query = query.eq('invited_email', params.invited_email);
        }
        if (params.search) {
            query = query.or(`
                invited_email.ilike.%${params.search}%,
                company_name_hint.ilike.%${params.search}%,
                invite_code.ilike.%${params.search}%
            `);
        }

        // Sorting
        const sortBy = params.sort_by || 'created_at';
        const sortOrder = params.sort_order || 'desc';
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });

        // Pagination
        const page = params.page || 1;
        const limit = params.limit || 25;
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;
        if (error) throw error;

        return {
            data: data || [],
            pagination: {
                total: count || 0,
                page,
                limit,
                total_pages: Math.ceil((count || 0) / limit)
            }
        };
    }

    async findById(id: string, clerkUserId: string): Promise<CompanyPlatformInvitation | null> {
        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);

        let query = this.supabase
            .from('recruiter_company_invitations')
            .select(`
                *,
                recruiter:recruiters!inner(
                    id,
                    user:users!inner(name, email)
                )
            `)
            .eq('id', id);

        // Role-based access
        if (!accessContext.isPlatformAdmin) {
            if (accessContext.recruiterId) {
                query = query.eq('recruiter_id', accessContext.recruiterId);
            } else {
                return null;
            }
        }

        const { data, error } = await query.maybeSingle();
        if (error) throw error;

        return data;
    }

    async findByCode(code: string): Promise<CompanyPlatformInvitation | null> {
        const { data, error } = await this.supabase
            .from('recruiter_company_invitations')
            .select(`
                *,
                recruiter:recruiters!inner(
                    id,
                    tagline,
                    location,
                    years_experience,
                    industries,
                    specialties,
                    user:users!inner(name, email, profile_image_url)
                )
            `)
            .eq('invite_code', code.toUpperCase())
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async findByToken(token: string): Promise<CompanyPlatformInvitation | null> {
        const { data, error } = await this.supabase
            .from('recruiter_company_invitations')
            .select(`
                *,
                recruiter:recruiters!inner(
                    id,
                    tagline,
                    location,
                    years_experience,
                    industries,
                    specialties,
                    user:users!inner(name, email, profile_image_url)
                )
            `)
            .eq('invite_link_token', token)
            .maybeSingle();
        console.log('findByToken result:', { data, error, token });
        if (error) throw error;
        return data;
    }

    async create(
        recruiterId: string,
        data: {
            invited_email?: string;
            company_name_hint?: string;
            personal_message?: string;
        }
    ): Promise<CompanyPlatformInvitation> {
        // Generate unique invite code
        let inviteCode = generateInviteCode();
        let attempts = 0;
        const maxAttempts = 10;

        // Ensure code is unique
        while (attempts < maxAttempts) {
            const existing = await this.findByCode(inviteCode);
            if (!existing) break;
            inviteCode = generateInviteCode();
            attempts++;
        }

        if (attempts >= maxAttempts) {
            throw new Error('Failed to generate unique invite code');
        }

        const insertData = {
            recruiter_id: recruiterId,
            invite_code: inviteCode,
            invited_email: data.invited_email?.toLowerCase(),
            company_name_hint: data.company_name_hint,
            personal_message: data.personal_message,
            status: 'pending' as const
        };

        const { data: result, error } = await this.supabase
            .from('recruiter_company_invitations')
            .insert(insertData)
            .select(`
                *,
                recruiter:recruiters!inner(
                    id,
                    user:users!inner(name, email)
                )
            `)
            .single();

        if (error) throw error;
        return result;
    }

    async update(
        id: string,
        updates: CompanyInvitationUpdate
    ): Promise<CompanyPlatformInvitation> {
        const { data, error } = await this.supabase
            .from('recruiter_company_invitations')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select(`
                *,
                recruiter:recruiters!inner(
                    id,
                    user:users!inner(name, email)
                )
            `)
            .single();

        if (error) throw error;
        return data;
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('recruiter_company_invitations')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}
