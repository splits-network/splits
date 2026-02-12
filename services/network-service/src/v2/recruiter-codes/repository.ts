/**
 * Recruiter Codes Repository - V2
 * Data access for recruiter referral codes and usage logs
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { StandardListParams, StandardListResponse } from '@splits-network/shared-types';
import {
    RecruiterCode,
    RecruiterCodeFilters,
    RecruiterCodeUpdate,
    RecruiterCodeLogEntry,
} from './types';

// Characters that won't be confused (no 0/O, 1/I/L)
const CODE_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789';

function generateCode(): string {
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
    return code;
}

export class RecruiterCodeRepository {
    constructor(private supabase: SupabaseClient) {}

    async list(
        clerkUserId: string,
        params: StandardListParams & RecruiterCodeFilters
    ): Promise<StandardListResponse<RecruiterCode>> {
        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);

        let query = this.supabase
            .from('recruiter_codes')
            .select(`
                *,
                recruiter:recruiters!inner(
                    id,
                    user:users!recruiters_user_id_fkey!inner(name, email)
                )
            `, { count: 'exact' })
            .is('deleted_at', null);

        // Role-based filtering: recruiters see only their own codes
        if (!accessContext.isPlatformAdmin) {
            if (accessContext.recruiterId) {
                query = query.eq('recruiter_id', accessContext.recruiterId);
            } else {
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
        if (params.search) {
            query = query.or(`
                code.ilike.%${params.search}%,
                label.ilike.%${params.search}%
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

    async findById(id: string, clerkUserId: string): Promise<RecruiterCode | null> {
        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);

        let query = this.supabase
            .from('recruiter_codes')
            .select(`
                *,
                recruiter:recruiters!inner(
                    id,
                    user:users!recruiters_user_id_fkey!inner(name, email)
                )
            `)
            .eq('id', id)
            .is('deleted_at', null);

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

    async findByCode(code: string): Promise<RecruiterCode | null> {
        const { data, error } = await this.supabase
            .from('recruiter_codes')
            .select(`
                *,
                recruiter:recruiters!inner(
                    id,
                    user:users!recruiters_user_id_fkey!inner(name, email, profile_image_url)
                )
            `)
            .eq('code', code.toLowerCase())
            .is('deleted_at', null)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async create(
        recruiterId: string,
        data: { label?: string }
    ): Promise<RecruiterCode> {
        // Generate unique code
        let code = generateCode();
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            const existing = await this.findByCode(code);
            if (!existing) break;
            code = generateCode();
            attempts++;
        }

        if (attempts >= maxAttempts) {
            throw new Error('Failed to generate unique referral code');
        }

        const insertData = {
            recruiter_id: recruiterId,
            code,
            label: data.label || null,
            status: 'active' as const,
        };

        const { data: result, error } = await this.supabase
            .from('recruiter_codes')
            .insert(insertData)
            .select(`
                *,
                recruiter:recruiters!inner(
                    id,
                    user:users!recruiters_user_id_fkey!inner(name, email)
                )
            `)
            .single();

        if (error) throw error;
        return result;
    }

    async update(
        id: string,
        updates: RecruiterCodeUpdate
    ): Promise<RecruiterCode> {
        const { data, error } = await this.supabase
            .from('recruiter_codes')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .is('deleted_at', null)
            .select(`
                *,
                recruiter:recruiters!inner(
                    id,
                    user:users!recruiters_user_id_fkey!inner(name, email)
                )
            `)
            .single();

        if (error) throw error;
        return data;
    }

    async delete(id: string): Promise<void> {
        // Soft delete
        const { error } = await this.supabase
            .from('recruiter_codes')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }

    // ========================================================================
    // Usage Log
    // ========================================================================

    async logUsage(
        recruiterCodeId: string,
        recruiterId: string,
        userId: string,
        signupType?: string,
        ipAddress?: string,
        userAgent?: string
    ): Promise<RecruiterCodeLogEntry> {
        const { data, error } = await this.supabase
            .from('recruiter_codes_log')
            .insert({
                recruiter_code_id: recruiterCodeId,
                recruiter_id: recruiterId,
                user_id: userId,
                signup_type: signupType || null,
                ip_address: ipAddress || null,
                user_agent: userAgent || null,
            })
            .select('*')
            .single();

        if (error) throw error;
        return data;
    }

    async getUsageLog(
        clerkUserId: string,
        params: StandardListParams & { recruiter_code_id?: string }
    ): Promise<StandardListResponse<RecruiterCodeLogEntry>> {
        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);

        let query = this.supabase
            .from('recruiter_codes_log')
            .select(`
                *,
                user:users!inner(name, email),
                recruiter_code:recruiter_codes!inner(code, label)
            `, { count: 'exact' });

        // Role-based filtering
        if (!accessContext.isPlatformAdmin) {
            if (accessContext.recruiterId) {
                query = query.eq('recruiter_id', accessContext.recruiterId);
            } else {
                return {
                    data: [],
                    pagination: { total: 0, page: 1, limit: params.limit || 25, total_pages: 0 }
                };
            }
        }

        if (params.recruiter_code_id) {
            query = query.eq('recruiter_code_id', params.recruiter_code_id);
        }

        query = query.order('created_at', { ascending: false });

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

    async findLogByUserId(userId: string): Promise<RecruiterCodeLogEntry | null> {
        const { data, error } = await this.supabase
            .from('recruiter_codes_log')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async updateLogSignupType(userId: string, signupType: string): Promise<void> {
        const { error } = await this.supabase
            .from('recruiter_codes_log')
            .update({ signup_type: signupType })
            .eq('user_id', userId);

        if (error) throw error;
    }

    async getUsageCount(recruiterCodeId: string): Promise<number> {
        const { count, error } = await this.supabase
            .from('recruiter_codes_log')
            .select('*', { count: 'exact', head: true })
            .eq('recruiter_code_id', recruiterCodeId);

        if (error) throw error;
        return count || 0;
    }
}
